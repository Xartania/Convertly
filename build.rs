use std::{fs, path::PathBuf};

use cc::Build;

fn list_source_files(dir: &PathBuf) -> Result<Vec<PathBuf>, std::io::Error> {
    if !dir.is_dir() {
        eprintln!(
            "cargo:warning=Error: {} doesn't exist or is not a directory.",
            dir.to_string_lossy()
        );
        return Ok(Vec::new());
    }

    let mut files = Vec::new();
    for entry in fs::read_dir(dir)? {
        let path = entry?.path();
        if path.is_dir() {
            files.extend(list_source_files(&path)?);
        } else if path.extension().is_some_and(|s| s == "c") {
            files.push(path.clone());
        }
    }
    Ok(files)
}

fn main() -> Result<(), std::io::Error> {
    println!("cargo:rerun-if-changed=src-c");

    let mut build = Build::new();
    let path = PathBuf::from("./src-c/src/");
    let files = list_source_files(&path)?;

    build.files(files);
    build.include("src-c/include/");
    build.compile("convertly");

    Ok(())
}
