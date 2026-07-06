use crate::lexer::{
    span::Span,
    token::{Token, TokenKind},
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct StreamError {
    pub expected: TokenKind,
    pub found: Option<TokenKind>,
    pub span: Span,
}

pub struct TokenStream<'a> {
    tokens: &'a [Token<'a, TokenKind>],
    cursor: usize,
}

impl<'a> TokenStream<'a> {
    pub fn new(tokens: &'a [Token<'a, TokenKind>]) -> Self {
        Self { tokens, cursor: 0 }
    }

    #[inline]
    pub fn is_at_end(&self) -> bool {
        self.cursor >= self.tokens.len()
    }

    pub fn peek(&self) -> Option<&'a Token<'a, TokenKind>> {
        self.tokens.get(self.cursor)
    }

    pub fn peek_kind(&self) -> Option<TokenKind> {
        self.peek().map(|t| t.kind)
    }

    pub fn peek_next(&self) -> Option<&'a Token<'a, TokenKind>> {
        self.tokens.get(self.cursor.saturating_add(1))
    }

    pub fn advance(&mut self) -> Option<&'a Token<'a, TokenKind>> {
        let token = self.tokens.get(self.cursor)?;
        self.cursor += 1;
        Some(token)
    }

    pub fn expect(&mut self, expected: TokenKind) -> Result<&'a Token<'a, TokenKind>, StreamError> {
        match self.peek() {
            Some(token) if token.kind == expected => {
                self.cursor += 1;
                Ok(token)
            }
            Some(token) => Err(StreamError {
                expected,
                found: Some(token.kind),
                span: token.span,
            }),
            None => {
                let last_span = self
                    .tokens
                    .last()
                    .map(|t| t.span)
                    .unwrap_or(Span::new(0, 0, 1, 1));
                Err(StreamError {
                    expected,
                    found: None,
                    span: last_span,
                })
            }
        }
    }

    pub fn consume_if(&mut self, kind: TokenKind) -> bool {
        if self.peek_kind() == Some(kind) {
            self.cursor += 1;
            true
        } else {
            false
        }
    }
}
