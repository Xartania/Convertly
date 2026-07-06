use crate::{
    error::ParseError,
    lexer::{ast::*, span::Span, stream::TokenStream, token::TokenKind},
};

pub struct Parser<'a> {
    stream: TokenStream<'a>,
    source: &'a str,
}

impl<'a> Parser<'a> {
    pub fn new(stream: TokenStream<'a>, source: &'a str) -> Self {
        Self { stream, source }
    }

    pub fn parse(&mut self) -> Result<AstProgram<'a>, ParseError> {
        let mut sections = Vec::new();
        let start_span = self.current_span();

        while !self.stream.is_at_end() {
            if self.stream.peek_kind() == Some(TokenKind::BracketOpen) {
                sections.push(self.parse_section()?);
            } else {
                let token = self.stream.advance().unwrap();
                return Err(ParseError::UnexpectedToken {
                    expected: TokenKind::BracketOpen,
                    found: Some(token.kind),
                    span: token.span,
                });
            }
        }

        let end_span = self.current_span();
        Ok(AstProgram {
            sections,
            span: Span::new(
                start_span.start,
                end_span.end,
                start_span.line,
                end_span.column,
            ),
        })
    }

    fn parse_section(&mut self) -> Result<AstSection<'a>, ParseError> {
        self.stream.expect(TokenKind::BracketOpen)?;
        let section_name = self.stream.expect(TokenKind::Identifier)?;
        self.stream.expect(TokenKind::BracketClose)?;

        match section_name.lexeme {
            "HEADER" => Ok(AstSection::Header(self.parse_header_fields()?)),
            "VARIABLES" => Ok(AstSection::Variables(self.parse_variable_defs()?)),
            "PARSING" => Ok(AstSection::Parsing(self.parse_parsing_blocks()?)),
            other => Err(ParseError::SemanticError {
                message: format!("Unknown section: '[{}]'", other),
                span: section_name.span,
            }),
        }
    }

    fn parse_header_fields(&mut self) -> Result<Vec<AstHeaderField<'a>>, ParseError> {
        let mut fields = Vec::new();
        while let Some(kind) = self.stream.peek_kind() {
            if kind == TokenKind::BracketOpen {
                break;
            }
            fields.push(self.parse_single_header_field()?);
        }
        Ok(fields)
    }

    fn parse_single_header_field(&mut self) -> Result<AstHeaderField<'a>, ParseError> {
        let key_token = self
            .stream
            .advance()
            .ok_or_else(|| ParseError::UnexpectedToken {
                expected: TokenKind::HeaderKey,
                found: None,
                span: self.current_span(),
            })?;

        self.stream.expect(TokenKind::AssignNormal)?;
        let val_token = self.parse_literal()?;

        Ok(AstHeaderField {
            key: key_token.lexeme,
            value: val_token,
            span: key_token.span,
        })
    }

    fn parse_statement(&mut self) -> Result<AstStatement<'a>, ParseError> {
        match self.stream.peek_kind() {
            Some(TokenKind::Ret) => {
                let ret_tok = self.stream.expect(TokenKind::Ret)?;
                let expr = self.parse_expression()?;
                Ok(AstStatement::Return {
                    value: expr,
                    span: ret_tok.span,
                })
            }
            Some(TokenKind::If) => self.parse_if_statement(),
            _ => {
                let expr = self.parse_expression()?;
                Ok(AstStatement::Expression(expr))
            }
        }
    }

    fn parse_if_statement(&mut self) -> Result<AstStatement<'a>, ParseError> {
        let if_tok = self.stream.expect(TokenKind::If)?;
        self.stream.expect(TokenKind::ParenOpen)?;
        let condition = self.parse_expression()?;
        self.stream.expect(TokenKind::ParenClose)?;

        self.stream.expect(TokenKind::BraceOpen)?;
        let mut then_branch = Vec::new();
        while self.stream.peek_kind() != Some(TokenKind::BraceClose) && !self.stream.is_at_end() {
            then_branch.push(self.parse_statement()?);
        }
        self.stream.expect(TokenKind::BraceClose)?;

        Ok(AstStatement::If {
            condition,
            then_branch,
            else_branch: None,
            span: if_tok.span,
        })
    }

    fn parse_expression(&mut self) -> Result<AstExpression<'a>, ParseError> {
        let mut left = self.parse_primary_expression()?;

        while let Some(kind) = self.stream.peek_kind() {
            let op = match kind {
                TokenKind::DoubleEqual => BinaryOperator::Equal,
                TokenKind::NotEqual => BinaryOperator::NotEqual,
                TokenKind::Greater => BinaryOperator::Greater,
                TokenKind::Less => BinaryOperator::Less,
                _ => break,
            };

            self.stream.advance();
            let right = self.parse_primary_expression()?;
            let span = Span::new(0, 0, 1, 1);

            left = AstExpression::BinaryOp {
                left: Box::new(left),
                operator: op,
                right: Box::new(right),
                span,
            };
        }

        Ok(left)
    }

    fn parse_primary_expression(&mut self) -> Result<AstExpression<'a>, ParseError> {
        if let Ok(lit) = self.parse_literal() {
            return Ok(AstExpression::Literal(lit));
        }

        let token = self
            .stream
            .peek()
            .ok_or_else(|| ParseError::UnexpectedToken {
                expected: TokenKind::Identifier,
                found: None,
                span: self.current_span(),
            })?;

        match token.kind {
            TokenKind::Identifier
            | TokenKind::Event
            | TokenKind::Entry
            | TokenKind::LoopIndexI
            | TokenKind::TypeValue => {
                self.stream.advance();
                let mut expr = AstExpression::Identifier(token.lexeme);

                while self.stream.consume_if(TokenKind::Dot) {
                    let prop_token =
                        self.stream
                            .peek()
                            .ok_or_else(|| ParseError::UnexpectedToken {
                                expected: TokenKind::Identifier,
                                found: None,
                                span: self.current_span(),
                            })?;

                    match prop_token.kind {
                        TokenKind::Identifier
                        | TokenKind::Event
                        | TokenKind::Entry
                        | TokenKind::LoopIndexI
                        | TokenKind::TypeValue => {
                            self.stream.advance();
                            let prop_name = prop_token.lexeme;

                            if self.stream.peek_kind() == Some(TokenKind::ParenOpen) {
                                self.stream.advance();
                                let mut args = Vec::new();
                                if self.stream.peek_kind() != Some(TokenKind::ParenClose) {
                                    args.push(self.parse_expression()?);
                                }
                                self.stream.expect(TokenKind::ParenClose)?;
                                expr = AstExpression::MethodCall {
                                    object: Box::new(expr),
                                    method_name: prop_name,
                                    arguments: args,
                                    span: prop_token.span,
                                };
                            } else {
                                expr = AstExpression::MemberAccess {
                                    object: Box::new(expr),
                                    property: prop_name,
                                    span: prop_token.span,
                                };
                            }
                        }
                        _ => {
                            return Err(ParseError::UnexpectedToken {
                                expected: TokenKind::Identifier,
                                found: Some(prop_token.kind),
                                span: prop_token.span,
                            });
                        }
                    }
                }
                Ok(expr)
            }
            _ => Err(ParseError::UnexpectedToken {
                expected: TokenKind::Identifier,
                found: Some(token.kind),
                span: token.span,
            }),
        }
    }

    fn parse_literal(&mut self) -> Result<AstLiteral<'a>, ParseError> {
        let token = self
            .stream
            .peek()
            .ok_or_else(|| ParseError::UnexpectedToken {
                expected: TokenKind::StringLiteral,
                found: None,
                span: self.current_span(),
            })?;

        match token.kind {
            TokenKind::StringLiteral => {
                self.stream.advance();
                Ok(AstLiteral::String(token.lexeme))
            }
            TokenKind::NumberLiteral => {
                self.stream.advance();
                Ok(AstLiteral::Number(token.lexeme))
            }
            TokenKind::BooleanLiteral => {
                self.stream.advance();
                Ok(AstLiteral::Boolean(
                    token.lexeme == "true" || token.lexeme == "1" || token.lexeme == "t",
                ))
            }
            TokenKind::CharLiteral => {
                self.stream.advance();
                let c = token.lexeme.chars().nth(1).unwrap_or(' ');
                Ok(AstLiteral::Char(c))
            }
            TokenKind::Identifier
            | TokenKind::TypeValue
            | TokenKind::Entry
            | TokenKind::LoopIndexI => {
                self.stream.advance();
                Ok(AstLiteral::Identifier(token.lexeme))
            }
            _ => Err(ParseError::UnexpectedToken {
                expected: TokenKind::StringLiteral,
                found: Some(token.kind),
                span: token.span,
            }),
        }
    }

    fn current_span(&self) -> Span {
        self.stream
            .peek()
            .map(|t| t.span)
            .unwrap_or(Span::new(0, 0, 1, 1))
    }

    fn parse_variable_defs(&mut self) -> Result<Vec<AstVariableDef<'a>>, ParseError> {
        let mut defs = Vec::new();
        while let Some(kind) = self.stream.peek_kind() {
            if kind == TokenKind::BracketOpen {
                break;
            }
            defs.push(self.parse_single_variable_def()?);
        }
        Ok(defs)
    }

    fn parse_single_variable_def(&mut self) -> Result<AstVariableDef<'a>, ParseError> {
        let name_tok = self.stream.expect(TokenKind::Identifier)?;
        let next_kind = self
            .stream
            .peek_kind()
            .ok_or_else(|| ParseError::UnexpectedToken {
                expected: TokenKind::AssignNormal,
                found: None,
                span: self.current_span(),
            })?;

        match next_kind {
            TokenKind::AssignNormal | TokenKind::AssignRegex => {
                let op_tok = self.stream.advance().unwrap();
                let is_regex = op_tok.kind == TokenKind::AssignRegex;
                let value = self.parse_literal()?;

                Ok(AstVariableDef::Assign {
                    name: name_tok.lexeme,
                    is_regex,
                    value,
                    span: name_tok.span,
                })
            }
            TokenKind::ArrowRight | TokenKind::ArrowLeft => {
                let arrow_tok = self.stream.advance().unwrap();
                let is_arrow_right = arrow_tok.kind == TokenKind::ArrowRight;
                self.parse_variable_block(name_tok.lexeme, is_arrow_right, name_tok.span)
            }
            _ => Err(ParseError::UnexpectedToken {
                expected: TokenKind::AssignNormal,
                found: Some(next_kind),
                span: name_tok.span,
            }),
        }
    }

    fn parse_variable_block(
        &mut self,
        name: &'a str,
        is_arrow_right: bool,
        start_span: Span,
    ) -> Result<AstVariableDef<'a>, ParseError> {
        let mut fields = Vec::new();

        while let Some(kind) = self.stream.peek_kind() {
            if kind == TokenKind::BracketOpen || kind == TokenKind::At {
                break;
            }

            if let Some(next_token) = self.stream.peek_next() {
                if next_token.kind != TokenKind::AssignNormal
                    && next_token.kind != TokenKind::AssignRegex
                {
                    break;
                }
            } else {
                break;
            }

            if let Some(current_tok) = self.stream.peek() {
                match current_tok.lexeme {
                    "start" | "end" | "contains" | "ignored" | "keep_indent" | "indent"
                    | "before" | "after" => {}
                    _ => break,
                }
            }

            fields.push(self.parse_single_header_field()?);
        }

        Ok(AstVariableDef::Block {
            name,
            is_arrow_right,
            fields,
            span: start_span,
        })
    }

    fn parse_parsing_blocks(&mut self) -> Result<Vec<AstParsingBlock<'a>>, ParseError> {
        let mut blocks = Vec::new();
        while let Some(kind) = self.stream.peek_kind() {
            if kind == TokenKind::BracketOpen {
                break;
            }
            blocks.push(self.parse_single_parsing_block()?);
        }
        Ok(blocks)
    }

    fn parse_single_parsing_block(&mut self) -> Result<AstParsingBlock<'a>, ParseError> {
        let at_start = self.stream.expect(TokenKind::At)?;
        let annotation_name = self.parse_annotation_name()?;

        let mut directives = Vec::new();
        let mut statements = Vec::new();

        if annotation_name.starts_with("code:") {
            while let Some(kind) = self.stream.peek_kind() {
                if kind == TokenKind::At || kind == TokenKind::BracketOpen {
                    break;
                }
                statements.push(self.parse_statement()?);
            }
        } else {
            while let Some(kind) = self.stream.peek_kind() {
                if kind == TokenKind::At || kind == TokenKind::BracketOpen {
                    break;
                }
                if let Some(next_tok) = self.stream.peek_next() {
                    if next_tok.kind != TokenKind::AssignNormal {
                        break;
                    }
                } else {
                    break;
                }
                directives.push(self.parse_single_header_field()?);
            }
        }

        Ok(AstParsingBlock {
            annotation: annotation_name,
            directives,
            statements,
            span: at_start.span,
        })
    }

    fn parse_annotation_name(&mut self) -> Result<&'a str, ParseError> {
        let first_ident = self.stream.expect(TokenKind::Identifier)?;
        let start_offset = first_ident.span.start;
        let mut end_offset = first_ident.span.end;

        while let Some(kind) = self.stream.peek_kind() {
            if kind == TokenKind::At {
                self.stream.advance();
                break;
            }

            if let Some(next_tok) = self.stream.peek_next()
                && (next_tok.kind == TokenKind::AssignNormal
                    || next_tok.kind == TokenKind::AssignRegex)
            {
                break;
            }

            if kind == TokenKind::Colon
                || kind == TokenKind::Dot
                || kind == TokenKind::Identifier
                || kind == TokenKind::TypeValue
            {
                let tok = self.stream.advance().unwrap();
                end_offset = tok.span.end;
            } else {
                break;
            }
        }

        Ok(&self.source[start_offset..end_offset])
    }
}
