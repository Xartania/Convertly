use crate::{
    lexer::ast::*,
    runtime::{RuntimeEnvironment, RuntimeValue},
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum RuntimeError {
    #[error("Undefined variable: '{0}'")]
    UndefinedVariable(String),
    #[error("Type error in runtime: {0}")]
    TypeError(String),
    #[error("Native execution error: {0}")]
    NativeError(String),
}

pub struct Interpreter<'a> {
    env: &'a mut RuntimeEnvironment,
}

impl<'a> Interpreter<'a> {
    pub fn new(env: &'a mut RuntimeEnvironment) -> Self {
        Self { env }
    }

    pub fn execute_block(
        &mut self,
        statements: &[AstStatement],
    ) -> Result<Option<RuntimeValue>, RuntimeError> {
        for statement in statements {
            match self.execute_statement(statement)? {
                Some(return_val) => return Ok(Some(return_val)),
                None => continue,
            }
        }
        Ok(None)
    }

    fn execute_statement(
        &mut self,
        statement: &AstStatement,
    ) -> Result<Option<RuntimeValue>, RuntimeError> {
        match statement {
            AstStatement::Return { value, .. } => {
                let val = self.evaluate_expression(value)?;
                Ok(Some(val))
            }
            AstStatement::If {
                condition,
                then_branch,
                else_branch,
                ..
            } => {
                let cond_val = self.evaluate_expression(condition)?;
                match cond_val {
                    RuntimeValue::Boolean(true) => self.execute_block(then_branch),
                    RuntimeValue::Boolean(false) => {
                        if let Some(else_statement) = else_branch {
                            self.execute_block(else_statement)
                        } else {
                            Ok(None)
                        }
                    }
                    _ => Err(RuntimeError::TypeError(
                        "'if' condition must be a boolean".to_string(),
                    )),
                }
            }
            AstStatement::Expression(expr) => {
                self.evaluate_expression(expr)?;
                Ok(None)
            }
            _ => Ok(None),
        }
    }

    fn evaluate_expression(&mut self, expr: &AstExpression) -> Result<RuntimeValue, RuntimeError> {
        match expr {
            AstExpression::Literal(lit) => match lit {
                AstLiteral::String(s) => Ok(RuntimeValue::String(s.trim_matches('"').to_string())),
                AstLiteral::Number(n) => {
                    let val = n
                        .parse::<i64>()
                        .map_err(|_| RuntimeError::TypeError("invalid number".to_string()))?;
                    Ok(RuntimeValue::Integer(val))
                }
                AstLiteral::Boolean(b) => Ok(RuntimeValue::Boolean(*b)),
                AstLiteral::Char(c) => Ok(RuntimeValue::String(c.to_string())),
                AstLiteral::Identifier(s) => Ok(RuntimeValue::String(s.to_string())),
            },

            AstExpression::Identifier(name) => self
                .env
                .get_var(name)
                .cloned()
                .ok_or_else(|| RuntimeError::UndefinedVariable(name.to_string())),

            AstExpression::MethodCall {
                object,
                method_name,
                arguments,
                ..
            } => {
                let obj_val = self.evaluate_expression(object)?;
                match (obj_val, *method_name) {
                    (RuntimeValue::String(target_str), "match_count") => {
                        if let Some(arg_expr) = arguments.first() {
                            let arg_val = self.evaluate_expression(arg_expr)?;
                            if let RuntimeValue::String(pattern) = arg_val {
                                let count = target_str.matches(&pattern).count();
                                return Ok(RuntimeValue::Integer(count as i64));
                            }
                        }
                        Err(RuntimeError::TypeError(
                            "Invalid arguments for 'match_count'".to_string(),
                        ))
                    }
                    _ => Err(RuntimeError::NativeError(format!(
                        "Unknown method: {method_name}"
                    ))),
                }
            }

            AstExpression::BinaryOp {
                left,
                operator,
                right,
                ..
            } => {
                let left_val = self.evaluate_expression(left)?;
                let right_val = self.evaluate_expression(right)?;

                match (left_val, right_val, operator) {
                    (RuntimeValue::Integer(l), RuntimeValue::Integer(r), BinaryOperator::Equal) => {
                        Ok(RuntimeValue::Boolean(l == r))
                    }
                    (
                        RuntimeValue::Integer(l),
                        RuntimeValue::Integer(r),
                        BinaryOperator::NotEqual,
                    ) => Ok(RuntimeValue::Boolean(l != r)),
                    (
                        RuntimeValue::Integer(l),
                        RuntimeValue::Integer(r),
                        BinaryOperator::Greater,
                    ) => Ok(RuntimeValue::Boolean(l > r)),
                    (RuntimeValue::Integer(l), RuntimeValue::Integer(r), BinaryOperator::Less) => {
                        Ok(RuntimeValue::Boolean(l < r))
                    }
                    (RuntimeValue::String(l), RuntimeValue::String(r), BinaryOperator::Equal) => {
                        Ok(RuntimeValue::Boolean(l == r))
                    }
                    _ => Err(RuntimeError::TypeError(
                        "Incompatible type comparison".to_string(),
                    )),
                }
            }

            AstExpression::MemberAccess {
                object, property, ..
            } => {
                let obj_val = self.evaluate_expression(object)?;
                match (obj_val, *property) {
                    (RuntimeValue::EventObject(event_data), "before") => {
                        Ok(RuntimeValue::String(event_data.before))
                    }
                    (RuntimeValue::EventObject(event_data), "after") => {
                        Ok(RuntimeValue::String(event_data.after))
                    }
                    (RuntimeValue::EventObject(event_data), "trigger") => {
                        Ok(RuntimeValue::String(event_data.trigger))
                    }
                    (RuntimeValue::EventObject(event_data), "ignored") => {
                        Ok(RuntimeValue::String(event_data.ignored))
                    }
                    _ => Err(RuntimeError::NativeError(format!(
                        "Unknown property: {}",
                        property
                    ))),
                }
            }

            AstExpression::LogicalOp {
                left,
                operator,
                right,
                ..
            } => {
                let left_val = self.evaluate_expression(left)?;
                match (left_val, *operator) {
                    (RuntimeValue::Boolean(true), LogicalOperator::And) => {
                        let right_val = self.evaluate_expression(right)?;
                        Ok(RuntimeValue::Boolean(matches!(
                            right_val,
                            RuntimeValue::Boolean(true)
                        )))
                    }
                    (RuntimeValue::Boolean(false), LogicalOperator::And) => {
                        Ok(RuntimeValue::Boolean(false))
                    }
                    (RuntimeValue::Boolean(true), LogicalOperator::Or) => {
                        Ok(RuntimeValue::Boolean(true))
                    }
                    (RuntimeValue::Boolean(false), LogicalOperator::Or) => {
                        let right_val = self.evaluate_expression(right)?;
                        Ok(RuntimeValue::Boolean(matches!(
                            right_val,
                            RuntimeValue::Boolean(true)
                        )))
                    }
                    _ => Err(RuntimeError::TypeError(
                        "Opérateurs logiques (&&, ||) nécessitent des booléens".to_string(),
                    )),
                }
            }

            AstExpression::UnaryOp {
                operator, operand, ..
            } => {
                let val = self.evaluate_expression(operand)?;
                match (*operator, val) {
                    (UnaryOperator::Not, RuntimeValue::Boolean(b)) => Ok(RuntimeValue::Boolean(!b)),
                    _ => Err(RuntimeError::TypeError(
                        "Opérateur '!' nécessite un booléen".to_string(),
                    )),
                }
            }

            #[allow(unreachable_patterns)]
            _ => Err(RuntimeError::NativeError(
                "Unsupported expression".to_string(),
            )),
        }
    }
}
