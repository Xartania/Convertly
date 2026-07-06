use crate::error::LexerError::FileError;
use crate::interpreter::Interpreter;
use crate::lexer::ast::AstSection;
use crate::lexer::grammar::Grammar;
use crate::lexer::stream::TokenStream;
use crate::lexer::token::Token;
use crate::parser::Parser;
use crate::runtime::{EventData, RuntimeEnvironment, RuntimeValue};
use crate::{
    Result,
    lexer::{Lexer, grammar::ConvertlyGrammar, token::TokenKind},
};
use clap::{Subcommand, crate_authors, crate_description, crate_name, crate_version};
use colored::*;

/// Convert any file to another with custom config files.
#[derive(clap::Parser, Debug)]
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
    /// Interpret a file
    Interpret {
        /// Path to the file to interpret
        #[arg(short, long)]
        path: String,
    },
}

impl Cli {
    pub fn run(self) -> Result<()> {
        match self.command {
            Commands::Tokenize { path } => {
                let source_code = read_file(&path)?;
                let grammar = ConvertlyGrammar;
                let tokens = tokenize(&grammar, &source_code)?;
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
            Commands::Interpret { path } => interpret(&path),
        }
    }
}

fn read_file(file_path: &str) -> Result<String> {
    log::info!("Reading file: {file_path}");

    match std::fs::read_to_string(file_path) {
        Ok(content) => Ok(content),
        Err(e) => Err(FileError(file_path.to_string(), e.to_string()).into()),
    }
}

fn tokenize<'a, G>(grammar: &'a G, source_code: &'a str) -> Result<Vec<Token<'a, TokenKind>>>
where
    G: Grammar<TokenKind>,
{
    let mut lexer = Lexer::new(source_code, grammar);

    let tokens = lexer.tokenize(TokenKind::Comment)?;

    Ok(tokens)
}

fn interpret(file_path: &str) -> Result<()> {
    let source_code = read_file(file_path)?;

    let grammar = ConvertlyGrammar;
    let mut lexer = Lexer::new(&source_code, &grammar);

    let tokens = lexer.tokenize(TokenKind::Comment)?;

    let stream = TokenStream::new(&tokens);
    let mut parser = Parser::new(stream, &source_code);
    let ast = parser.parse()?;

    println!(
        "{} {} {}",
        "AST Successfully generated:".bright_green(),
        format!("{}", ast.sections.len())
            .bright_blue()
            .bold()
            .italic(),
        "sections analyzed!".bright_black()
    );

    let mut env = RuntimeEnvironment::new();

    let json_content = std::fs::read_to_string("data.json").unwrap();
    let test_event = EventData::new("entry", &json_content, "");
    env.set_var("event", RuntimeValue::EventObject(test_event));

    let mut interpreter = Interpreter::new(&mut env);

    for section in &ast.sections {
        if let AstSection::Parsing(blocks) = section {
            for block in blocks {
                if block.annotation.starts_with("code:") {
                    println!(" -> Evaluating block '@{}'...", block.annotation);
                    match interpreter.execute_block(&block.statements) {
                        Ok(Some(return_val)) => {
                            println!("    Return value: {:?}", return_val);
                        }
                        Ok(None) => println!("    Block executed without return instruction"),
                        Err(e) => {
                            return Err(e.into());
                        }
                    }
                }
            }
        }
    }
    Ok(())
}
