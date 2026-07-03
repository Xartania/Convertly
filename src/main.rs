mod lexer;

use std::{env, fmt::Display, fs, process};

use lexer::Lexer;
use lexer::grammar::Grammar;

use convertly::{
    Result,
    error::{ExecError::BadUsage, LexerError::FileError},
};

use colored::*;

#[derive(Debug, PartialEq, Eq)]
enum MockTokenKind {
    Word,
    Number,
    Symbol,
}

impl Display for MockTokenKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let data = match *self {
            Self::Word => format!("{:<7}", "Word").bright_cyan(),
            Self::Number => format!("{:<7}", "Number").bright_purple(),
            Self::Symbol => format!("{:<7}", "Symbol").bright_blue(),
        };
        f.write_str(&data.to_string())
    }
}

struct MockGrammar;

impl Grammar<MockTokenKind> for MockGrammar {
    fn match_token(&self, slice: &str) -> Option<(MockTokenKind, usize)> {
        let mut chars = slice.chars();
        let first = chars.next()?;

        if first.is_alphabetic() {
            let len = slice
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_')
                .map(|c| c.len_utf8())
                .sum();
            return Some((MockTokenKind::Word, len));
        }

        if first.is_ascii_digit() {
            let len = slice
                .chars()
                .take_while(|c| c.is_ascii_digit())
                .map(|c| c.len_utf8())
                .sum();
            return Some((MockTokenKind::Number, len));
        }

        Some((MockTokenKind::Symbol, first.len_utf8()))
    }
}

fn parse_flags() -> Result<String> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        Err(BadUsage(args[0].clone()).into())
    } else {
        Ok(args[1].clone())
    }
}

fn runner() -> Result<()> {
    let file_path = parse_flags()?;
    log::info!("Reading file: {file_path}");

    let source_code = match fs::read_to_string(&file_path) {
        Ok(content) => content,
        Err(e) => {
            return Err(FileError(file_path, e.to_string()).into());
        }
    };

    let grammar = MockGrammar;
    let mut lexer = Lexer::new(&source_code, &grammar);

    let tokens = lexer.tokenize()?;

    println!(
        "{} {} {}",
        "Successfully tokenized.".bright_green(),
        format!("{}", tokens.len()).bright_blue().bold().italic(),
        "tokens found:".bright_black()
    );
    for (i, token) in tokens.iter().enumerate() {
        let msg = format!(
            " {} Kind: {} | Text: {:<12} | Line: {:<3} Col: {}",
            format!("{i}.").white(),
            token.kind,
            format!("'{}'", token.lexeme).bright_yellow(),
            format!("{}", token.span.line).bright_cyan(),
            format!("{}", token.span.column).bright_cyan(),
        );
        println!("{}", msg.bright_black());
    }
    Ok(())
}

fn main() {
    env_logger::builder()
        .filter_level(log::LevelFilter::Info)
        .init();

    if let Err(e) = runner() {
        log::error!("{e}");
        process::exit(1);
    }
}
