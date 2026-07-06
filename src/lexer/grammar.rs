use crate::lexer::token::TokenKind;

pub trait Grammar<K> {
    fn match_token(&self, slice: &str) -> Option<(K, usize)>;
    fn is_whitespace(&self, c: char) -> bool {
        c.is_whitespace()
    }
}

pub const COMMENT_SINGLE_OPEN: &str = "@>";
pub const COMMENT_MULTI_OPEN: &str = "@>";
pub const COMMENT_MULTI_CLOSE: &str = "<@";

pub const ALT_COMMENT_OPEN_1: &str = "//";
pub const ALT_COMMENT_OPEN_2: &str = "/*";
pub const ALT_COMMENT_CLOSE: &str = "*/";

pub const MULTI_CHAR_OPERATORS: &[(&str, TokenKind)] = &[
    (">=", TokenKind::GreaterEqual),
    ("<=", TokenKind::LessEqual),
    ("==", TokenKind::DoubleEqual),
    ("!=", TokenKind::NotEqual),
    ("&&", TokenKind::And),
    ("||", TokenKind::Or),
    (":=", TokenKind::AssignRegex),
    ("->", TokenKind::ArrowRight),
    ("<-", TokenKind::ArrowLeft),
];

pub struct ConvertlyGrammar;

impl Grammar<TokenKind> for ConvertlyGrammar {
    fn match_token(&self, slice: &str) -> Option<(TokenKind, usize)> {
        self.try_lex_comment(slice)
            .or_else(|| self.try_lex_multi_char_op(slice))
            .or_else(|| self.try_lex_single_char_op(slice))
            .or_else(|| self.try_lex_string_or_char(slice))
            .or_else(|| self.try_lex_number(slice))
            .or_else(|| self.try_lex_identifier_or_keyword(slice))
    }
}

impl ConvertlyGrammar {
    fn try_lex_comment(&self, slice: &str) -> Option<(TokenKind, usize)> {
        let is_open = slice.starts_with(COMMENT_SINGLE_OPEN)
            || slice.starts_with(COMMENT_MULTI_OPEN)
            || slice.starts_with(ALT_COMMENT_OPEN_1)
            || slice.starts_with(ALT_COMMENT_OPEN_2);
        if !is_open {
            return None;
        }

        for close_marker in [COMMENT_MULTI_CLOSE, ALT_COMMENT_CLOSE] {
            if let Some(pos) = slice[2..].find(close_marker) {
                return Some((TokenKind::Comment, pos + 2 + close_marker.len()));
            }
        }

        let len = slice.find('\n').unwrap_or(slice.len());
        Some((TokenKind::Comment, len))
    }

    fn try_lex_multi_char_op(&self, slice: &str) -> Option<(TokenKind, usize)> {
        for &(op, kind) in MULTI_CHAR_OPERATORS {
            if slice.starts_with(op) {
                return Some((kind, op.len()));
            }
        }
        None
    }

    fn try_lex_single_char_op(&self, slice: &str) -> Option<(TokenKind, usize)> {
        let first = slice.chars().next()?;
        let kind = match first {
            '{' => TokenKind::BraceOpen,
            '}' => TokenKind::BraceClose,
            '[' => TokenKind::BracketOpen,
            ']' => TokenKind::BracketClose,
            '(' => TokenKind::ParenOpen,
            ')' => TokenKind::ParenClose,
            ',' => TokenKind::Comma,
            ':' => TokenKind::Colon,
            '.' => TokenKind::Dot,
            '@' => TokenKind::At,
            ';' => TokenKind::SemiColon,
            '=' => TokenKind::AssignNormal,
            '>' => TokenKind::Greater,
            '<' => TokenKind::Less,
            '!' => TokenKind::Not,
            _ => return None,
        };
        Some((kind, first.len_utf8()))
    }

    fn try_lex_string_or_char(&self, slice: &str) -> Option<(TokenKind, usize)> {
        let first = slice.chars().next()?;
        if first != '"' && first != '\'' {
            return None;
        }

        let mut len = first.len_utf8();
        let mut escaped = false;

        for c in slice[len..].chars() {
            len += c.len_utf8();
            if escaped {
                escaped = false;
            } else if c == '\\' {
                escaped = true;
            } else if c == first {
                let kind = if first == '"' {
                    TokenKind::StringLiteral
                } else {
                    TokenKind::CharLiteral
                };
                return Some((kind, len));
            }
        }
        None
    }

    fn try_lex_number(&self, slice: &str) -> Option<(TokenKind, usize)> {
        if let Some(s) = slice.strip_prefix("0x") {
            let len = 2 + s
                .chars()
                .take_while(|c| c.is_ascii_hexdigit())
                .map(|c| c.len_utf8())
                .sum::<usize>();
            return if len > 2 {
                Some((TokenKind::NumberLiteral, len))
            } else {
                None
            };
        }
        if let Some(s) = slice.strip_prefix("0b") {
            let len = 2 + s
                .chars()
                .take_while(|c| matches!(c, '0' | '1'))
                .map(|c| c.len_utf8())
                .sum::<usize>();
            return if len > 2 {
                Some((TokenKind::NumberLiteral, len))
            } else {
                None
            };
        }

        let first = slice.chars().next()?;
        if first.is_ascii_digit()
            || (first == '-' && slice.chars().nth(1).is_some_and(|c| c.is_ascii_digit()))
        {
            let start = if first == '-' { 1 } else { 0 };
            let len = start
                + slice[start..]
                    .chars()
                    .take_while(|c| c.is_ascii_digit())
                    .map(|c| c.len_utf8())
                    .sum::<usize>();
            return Some((TokenKind::NumberLiteral, len));
        }
        None
    }

    fn try_lex_identifier_or_keyword(&self, slice: &str) -> Option<(TokenKind, usize)> {
        let mut chars = slice.chars();
        let first = chars.next()?;

        if !first.is_alphabetic() && first != '_' {
            return None;
        }

        let len = slice
            .chars()
            .take_while(|c| c.is_alphanumeric() || *c == '_')
            .map(|c| c.len_utf8())
            .sum::<usize>();

        let word = &slice[..len];
        let kind = self.resolve_keyword(word);

        Some((kind, len))
    }

    fn resolve_keyword(&self, word: &str) -> TokenKind {
        match word {
            "if" => TokenKind::If,
            "for" => TokenKind::For,
            "ret" => TokenKind::Ret,

            "import" => TokenKind::Import,
            "from" => TokenKind::From,
            "entry" => TokenKind::Entry,
            "event" => TokenKind::Event,
            "i" => TokenKind::LoopIndexI,

            "file" | "type" | "extension" | "ext" | "separated" | "sep" | "using"
            | "indent_size" => TokenKind::HeaderKey,
            "magic" | "content" => TokenKind::WritingKey,

            "value" | "v" => TokenKind::TypeValue,
            "none" => TokenKind::TypeNone,

            "true" | "t" | "false" | "f" => TokenKind::BooleanLiteral,

            _ => TokenKind::Identifier,
        }
    }
}
