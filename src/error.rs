use thiserror::Error;

use crate::lexer::{span::Span, stream::StreamError, token::TokenKind};

#[derive(Error, Debug, PartialEq)]
pub enum LexerError {
    #[error("Character '{character}' not recognized at line {line}, column {column}")]
    UnrecognizedCharacter {
        character: char,
        line: usize,
        column: usize,
    },
    #[error("Reading file '{0}': {1}")]
    FileError(String, String),
}

#[derive(Error, Debug, PartialEq)]
pub enum ParseError {
    #[error("Syntax error at line {span:?}: expected {expected:?}, found {found:?}")]
    UnexpectedToken {
        expected: TokenKind,
        found: Option<TokenKind>,
        span: Span,
    },
    #[error("Semantic error at line {span:?}: {message}")]
    SemanticError { message: String, span: Span },
    #[error("Stream error: {0:?}")]
    Stream(StreamError),
}

impl From<StreamError> for ParseError {
    fn from(err: StreamError) -> Self {
        ParseError::Stream(err)
    }
}
