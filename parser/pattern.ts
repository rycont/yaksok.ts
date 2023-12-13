import {
    Node,
    SetVariable,
    Keyword,
    Evaluable,
    EOL,
    DivideOperator,
    MultiplyOperator,
    BinaryCalculation,
    Operator,
    IfStatement,
    Block,
    Print,
    Variable,
    PlusOperator,
    MinusOperator,
    EqualOperator,
    ValueGroup,
    AndOperator,
    Loop,
    GreaterThanOperator,
    GreaterThanOrEqualOperator,
    Break,
    LessThanOperator,
    LessThanOrEqualOperator,
    Sequence,
    List,
    Indexing,
    IndexFetch,
    SetToIndex,
    Expression,
    RangeOperator,
} from '../nodes/index.ts'

export interface Pattern {
    wrapper: {
        new (...args: any[]): Node
    }
    units: {
        type: {
            new (...args: any[]): Node
        }
        value?: Record<string, unknown> | string | number
        as?: string
    }[]
    config?: Record<string, unknown>
}

export const internalPatterns: Pattern[] = [
    {
        wrapper: EqualOperator,
        units: [
            {
                type: Operator,
                value: '=',
            },
        ],
    },
    {
        wrapper: Sequence,
        units: [
            {
                type: Evaluable,
                as: 'a',
            },
            {
                type: Expression,
                value: ',',
            },
            {
                type: Evaluable,
                as: 'b',
            },
        ],
    },
    {
        wrapper: List,
        units: [
            {
                type: Expression,
                value: '[',
            },
            {
                type: Sequence,
                as: 'sequence',
            },
            {
                type: Expression,
                value: ']',
            },
        ],
    },
    {
        wrapper: List,
        units: [
            {
                type: Expression,
                value: '[',
            },
            {
                type: Expression,
                value: ']',
            },
        ],
    },
    {
        wrapper: Indexing,
        units: [
            {
                type: Expression,
                value: '[',
            },
            {
                type: Evaluable,
                as: 'index',
            },
            {
                type: Expression,
                value: ']',
            },
        ],
    },
    {
        wrapper: IndexFetch,
        units: [
            {
                type: Evaluable,
                as: 'target',
            },
            {
                type: Indexing,
                as: 'index',
            },
        ],
    },
    {
        wrapper: SetToIndex,
        units: [
            {
                type: IndexFetch,
                as: 'target',
            },
            {
                type: Expression,
                value: ':',
            },
            {
                type: Evaluable,
                as: 'value',
            },
        ],
    },
    {
        wrapper: ValueGroup,
        units: [
            {
                type: Expression,
                value: '(',
            },
            {
                type: Evaluable,
                as: 'value',
            },
            {
                type: Expression,
                value: ')',
            },
        ],
    },
    {
        wrapper: GreaterThanOperator,
        units: [
            {
                type: Operator,
                value: '>',
            },
        ],
    },
    {
        wrapper: GreaterThanOrEqualOperator,
        units: [
            {
                type: GreaterThanOperator,
            },
            {
                type: EqualOperator,
            },
        ],
    },
    {
        wrapper: LessThanOperator,
        units: [
            {
                type: Operator,
                value: '<',
            },
        ],
    },
    {
        wrapper: LessThanOrEqualOperator,
        units: [
            {
                type: LessThanOperator,
            },
            {
                type: EqualOperator,
            },
        ],
    },
    {
        wrapper: Variable,
        units: [
            {
                type: Keyword,
                value: '이전',
            },
            {
                type: Variable,
                as: 'name',
            },
        ],
    },
    {
        wrapper: SetVariable,
        units: [
            {
                type: Variable,
                as: 'name',
            },
            {
                type: Expression,
                value: ':',
            },
            {
                type: Evaluable,
                as: 'value',
            },
            {
                type: EOL,
            },
        ],
    },
    {
        wrapper: DivideOperator,
        units: [
            {
                type: Operator,
                value: '/',
            },
        ],
    },
    {
        wrapper: MultiplyOperator,
        units: [
            {
                type: Operator,
                value: '*',
            },
        ],
    },
    {
        wrapper: PlusOperator,
        units: [
            {
                type: Operator,
                value: '+',
            },
        ],
    },
    {
        wrapper: MinusOperator,
        units: [
            {
                type: Operator,
                value: '-',
            },
        ],
    },
    {
        wrapper: AndOperator,
        units: [
            {
                type: Keyword,
                value: '이고',
            },
        ],
    },
    {
        wrapper: RangeOperator,
        units: [
            {
                type: Operator,
                value: '~',
            },
        ],
    },
    {
        wrapper: BinaryCalculation,
        units: [
            {
                type: Evaluable,
                as: 'left',
            },
            {
                type: Operator,
                as: 'operator',
            },
            {
                type: Evaluable,
                as: 'right',
            },
        ],
    },
    {
        wrapper: IfStatement,
        units: [
            {
                type: Keyword,
                value: '만약',
            },
            {
                type: Evaluable,
                as: 'condition',
            },
            {
                type: Keyword,
                value: '이면',
            },
            {
                type: EOL,
            },
            {
                type: Block,
                as: 'body',
            },
        ],
    },
    {
        wrapper: IfStatement,
        units: [
            {
                type: IfStatement,
                as: 'ifBody',
            },
            {
                type: Keyword,
                value: '아니면',
            },
            {
                type: EOL,
            },
            {
                type: Block,
                as: 'elseBody',
            },
        ],
    },
    {
        wrapper: Print,
        units: [
            {
                type: Evaluable,
                as: 'value',
            },
            {
                type: Keyword,
                value: '보여주기',
            },
        ],
    },
    {
        wrapper: Loop,
        units: [
            {
                type: Keyword,
                value: '반복',
            },
            {
                type: EOL,
            },
            {
                type: Block,
                as: 'body',
            },
        ],
    },
    {
        wrapper: Break,
        units: [
            {
                type: Keyword,
                value: '반복',
            },
            {
                type: Keyword,
                value: '그만',
            },
        ],
    },
]
