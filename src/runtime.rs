use std::collections::HashMap;

use regex::Regex;

#[derive(Debug, Clone, PartialEq)]
pub enum RuntimeValue {
    String(String),
    Integer(i64),
    Boolean(bool),
    EventObject(EventData),
}

#[derive(Debug, Clone, PartialEq)]
pub struct EventData {
    pub trigger: String,
    pub ignored: String,
    pub before: String,
    pub after: String,
}

impl EventData {
    pub fn new(trigger: &str, before: &str, after: &str) -> Self {
        Self {
            trigger: trigger.to_string(),
            ignored: String::new(),
            before: before.to_string(),
            after: after.to_string(),
        }
    }

    #[allow(unused)]
    pub fn match_count(&self, target: &str, pattern: &str) -> Result<usize, String> {
        let clean_pattern = pattern.trim_matches('"');

        let re = Regex::new(clean_pattern)
            .map_err(|e| format!("Regex syntax error '{clean_pattern}': {e}"))?;

        Ok(re.find_iter(&self.before).count())
    }
}

pub struct RuntimeEnvironment {
    variables: HashMap<String, RuntimeValue>,
}

impl RuntimeEnvironment {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
        }
    }

    pub fn set_var(&mut self, name: impl Into<String>, value: RuntimeValue) {
        self.variables.insert(name.into(), value);
    }

    pub fn get_var(&self, name: &str) -> Option<&RuntimeValue> {
        self.variables.get(name)
    }
}
