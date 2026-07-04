use crate::{
    Result,
    lexer::{Lexer, grammar::ConvertlyGrammar, token::TokenKind},
};
use clap::{Parser, Subcommand, crate_authors, crate_description, crate_name, crate_version};
use colored::*;
use convertly::error::LexerError::FileError;

/// Convert any file to another with custom config files.
#[derive(Parser, Debug)]
#[command(name = crate_name!())]
#[command(author = crate_authors!(", "))]
#[command(version = crate_version!())]
#[command(about = crate_description!())]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Tokenize a file & display in stdout output.
    Tokenize {
        /// Path to the file to tokenize.
        #[arg(short, long)]
        path: String,
    },
}

impl Cli {
    pub fn run(self) -> Result<()> {
        match self.command {
            Commands::Tokenize { path } => tokenize(&path),
        }
    }
}

fn tokenize(file_path: &str) -> Result<()> {
    log::info!("Reading file: {file_path}");

    let source_code = match std::fs::read_to_string(file_path) {
        Ok(content) => content,
        Err(e) => {
            return Err(FileError(file_path.to_string(), e.to_string()).into());
        }
    };

    let grammar = ConvertlyGrammar;
    let mut lexer = Lexer::new(&source_code, &grammar);

    let tokens = lexer.tokenize(TokenKind::Comment)?;

    println!(
        "{} {} {}",
        "Successfully tokenized.".bright_green(),
        format!("{}", tokens.len()).bright_blue().bold().italic(),
        "tokens found:".bright_black()
    );
    for (i, token) in tokens.iter().enumerate() {
        let msg = format!(
            " {:<5} Line: {:<4} Col: {:<4} | Kind: {} | Text: {:<12}",
            format!("{i}.").white(),
            format!("{}", token.span.line).bright_cyan(),
            format!("{}", token.span.column).bright_cyan(),
            token.kind,
            format!("'{}'", token.lexeme).bright_yellow(),
        );
        println!("{}", msg.bright_black());
    }
    Ok(())
}
