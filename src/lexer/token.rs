use colored::*;
use std::fmt::Display;

use super::span::Span;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TokenKind {
    BraceOpen,
    BraceClose,
    BracketOpen,
    BracketClose,
    ParenOpen,
    ParenClose,
    Comma,
    Colon,
    Dot,
    At,
    SemiColon,

    DoubleEqual,
    NotEqual,
    Greater,
    Less,
    GreaterEqual,
    LessEqual,

    And,
    Or,
    Not,
    AssignNormal,
    AssignRegex,
    ArrowRight,
    ArrowLeft,

    If,
    For,
    Ret,

    Import,
    From,
    HeaderKey,
    WritingKey,
    Entry,
    Event,
    LoopIndexI,

    TypeValue,
    TypeNone,

    NumberLiteral,
    StringLiteral,
    CharLiteral,
    BooleanLiteral,

    Identifier,

    Comment,
}

impl Display for TokenKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let format = format!("{:<16}", format!("{:?}", *self));
        let data = match *self {
            Self::BracketOpen
            | Self::BracketClose
            | Self::BraceOpen
            | Self::BraceClose
            | Self::ParenOpen
            | Self::ParenClose => format.bright_magenta(),

            Self::ArrowRight
            | Self::ArrowLeft
            | Self::Colon
            | Self::Comma
            | Self::SemiColon
            | Self::At
            | Self::Dot => format.bright_cyan(),

            Self::DoubleEqual
            | Self::NotEqual
            | Self::Less
            | Self::LessEqual
            | Self::Greater
            | Self::GreaterEqual
            | Self::And
            | Self::Or
            | Self::Not
            | Self::AssignNormal
            | Self::AssignRegex => format.bright_blue(),

            Self::Identifier
            | Self::StringLiteral
            | Self::NumberLiteral
            | Self::CharLiteral
            | Self::BooleanLiteral => format.bright_green(),

            Self::If
            | Self::For
            | Self::Ret
            | Self::Import
            | Self::From
            | Self::HeaderKey
            | Self::WritingKey
            | Self::Entry
            | Self::Event
            | Self::LoopIndexI => format.bright_yellow(),

            Self::TypeValue | Self::TypeNone => format.bright_red(),

            Self::Comment => format.bright_black(),
        };
        f.write_str(&data.to_string())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Token<'a, K> {
    pub kind: K,
    pub lexeme: &'a str,
    pub span: Span,
}

impl<'a, K> Token<'a, K> {
    pub fn new(kind: K, lexeme: &'a str, span: Span) -> Self {
        Self { kind, lexeme, span }
    }
}
