pub mod ast;
pub mod grammar;
pub mod span;
pub mod stream;
pub mod token;

use grammar::Grammar;
use span::Span;
use token::Token;

use crate::error::LexerError;

pub struct Lexer<'a, K, G: Grammar<K>> {
    source: &'a str,
    grammar: &'a G,
    cursor: usize,
    line: usize,
    column: usize,
    _marker: std::marker::PhantomData<K>,
}

impl<'a, K, G: Grammar<K>> Lexer<'a, K, G>
where
    K: PartialEq,
{
    pub fn new(source: &'a str, grammar: &'a G) -> Self {
        Self {
            source,
            grammar,
            cursor: 0,
            line: 1,
            column: 1,
            _marker: std::marker::PhantomData,
        }
    }

    pub fn tokenize(&mut self, comment_kind: K) -> Result<Vec<Token<'a, K>>, LexerError> {
        let mut tokens = Vec::new();

        while self.cursor < self.source.len() {
            let remaining_slice = &self.source[self.cursor..];

            let mut chars = remaining_slice.chars();
            if let Some(current_char) = chars.next()
                && self.grammar.is_whitespace(current_char)
            {
                self.consume_char(current_char);
                continue;
            }

            if let Some((kind, len)) = self.grammar.match_token(remaining_slice) {
                let start = self.cursor;
                let start_line = self.line;
                let start_col = self.column;

                let lexeme = &self.source[start..start + len];
                for c in lexeme.chars() {
                    self.consume_char(c);
                }

                if kind == comment_kind {
                    continue;
                }

                let span = Span::new(start, self.cursor, start_line, start_col);
                tokens.push(Token::new(kind, lexeme, span));
            } else {
                let bad_char = remaining_slice.chars().next().unwrap_or(' ');
                return Err(LexerError::UnrecognizedCharacter {
                    character: bad_char,
                    line: self.line,
                    column: self.column,
                });
            }
        }

        Ok(tokens)
    }

    fn consume_char(&mut self, c: char) {
        self.cursor += c.len_utf8();
        if c == '\n' {
            self.line += 1;
            self.column = 1;
        } else {
            self.column += 1;
        }
    }
}
