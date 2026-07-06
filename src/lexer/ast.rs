use crate::lexer::span::Span;

#[derive(Debug, Clone, PartialEq)]
pub struct AstProgram<'a> {
    pub sections: Vec<AstSection<'a>>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq)]
#[allow(unused)]
pub enum AstSection<'a> {
    Import(Vec<AstImport<'a>>),
    Header(Vec<AstHeaderField<'a>>),
    Variables(Vec<AstVariableDef<'a>>),
    Parsing(Vec<AstParsingBlock<'a>>),
    Format(Vec<AstFormatDef<'a>>),
    WritingHeader(Vec<AstWritingField<'a>>),
    WritingContent(Vec<AstWritingBlock<'a>>),
}

#[derive(Debug, Clone, PartialEq)]
pub struct AstImport<'a> {
    pub path: &'a str,
    pub imported_vars: Vec<&'a str>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq)]
pub struct AstHeaderField<'a> {
    pub key: &'a str,
    pub value: AstLiteral<'a>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq)]
pub enum AstVariableDef<'a> {
    Assign {
        name: &'a str,
        is_regex: bool,
        value: AstLiteral<'a>,
        span: Span,
    },
    Block {
        name: &'a str,
        is_arrow_right: bool,
        fields: Vec<AstHeaderField<'a>>,
        span: Span,
    },
}

#[derive(Debug, Clone, PartialEq)]
pub struct AstFormatDef<'a> {
    pub name: &'a str,
    pub fields: Vec<AstHeaderField<'a>>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq)]
pub struct AstParsingBlock<'a> {
    pub annotation: &'a str,
    pub directives: Vec<AstHeaderField<'a>>,
    pub statements: Vec<AstStatement<'a>>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq)]
pub struct AstWritingField<'a> {
    pub key: &'a str,
    pub value: AstLiteral<'a>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq)]
pub struct AstWritingBlock<'a> {
    pub annotation: &'a str,
    pub content: Vec<&'a str>,
    pub span: Span,
}

#[derive(Debug, Clone, PartialEq)]
pub enum AstStatement<'a> {
    Return {
        value: AstExpression<'a>,
        span: Span,
    },
    If {
        condition: AstExpression<'a>,
        then_branch: Vec<AstStatement<'a>>,
        else_branch: Option<Vec<AstStatement<'a>>>,
        span: Span,
    },
    #[allow(unused)]
    For {
        condition: AstExpression<'a>,
        body: Vec<AstStatement<'a>>,
        span: Span,
    },
    Expression(AstExpression<'a>),
}

#[derive(Debug, Clone, PartialEq)]
pub enum AstExpression<'a> {
    Literal(AstLiteral<'a>),
    Identifier(&'a str),
    MemberAccess {
        object: Box<AstExpression<'a>>,
        property: &'a str,
        span: Span,
    },
    MethodCall {
        object: Box<AstExpression<'a>>,
        method_name: &'a str,
        arguments: Vec<AstExpression<'a>>,
        span: Span,
    },
    BinaryOp {
        left: Box<AstExpression<'a>>,
        operator: BinaryOperator,
        right: Box<AstExpression<'a>>,
        span: Span,
    },
    #[allow(unused)]
    LogicalOp {
        left: Box<AstExpression<'a>>,
        operator: LogicalOperator,
        right: Box<AstExpression<'a>>,
        span: Span,
    },
    #[allow(unused)]
    UnaryOp {
        operator: UnaryOperator,
        operand: Box<AstExpression<'a>>,
        span: Span,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[allow(unused)]
pub enum BinaryOperator {
    Equal,
    NotEqual,
    Greater,
    Less,
    GreaterEqual,
    LessEqual,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[allow(unused)]
pub enum LogicalOperator {
    And,
    Or,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[allow(unused)]
pub enum UnaryOperator {
    Not,
}

#[derive(Debug, Clone, PartialEq)]
pub enum AstLiteral<'a> {
    String(&'a str),
    Number(&'a str),
    Boolean(bool),
    Char(char),
    Identifier(&'a str),
}
