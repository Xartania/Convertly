use super::span::Span;

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
