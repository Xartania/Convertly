use thiserror::Error;

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
pub enum ExecError {
    #[error("Bad Usage:\n{0} /path/to/file")]
    BadUsage(String),
}
