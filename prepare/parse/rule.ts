import { Formula } from '../../node/calculation.ts'
import {
    Node,
    SetVariable,
    Keyword,
    Evaluable,
    EOL,
    DivideOperator,
    MultiplyOperator,
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
    Return,
    Mention,
    FFIBody,
    DeclareFFI,
} from '../../node/index.ts'
import { ListLoop } from '../../node/listLoop.ts'

export interface PatternUnit {
    type: {
        new (...args: any[]): Node
    }
    value?: Record<string, unknown> | string | number
    as?: string
}

export interface Rule {
    to: {
        new (...args: any[]): Node
    }
    pattern: PatternUnit[]
    config?: Record<string, unknown>
}

export const internalPatternsByLevel: Rule[][] = [
    [
        {
            to: Indexing,
            pattern: [
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
            to: IndexFetch,
            pattern: [
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
    ],
    [
        {
            to: EqualOperator,
            pattern: [
                {
                    type: Operator,
                    value: '=',
                },
            ],
        },
        {
            to: Sequence,
            pattern: [
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
            to: List,
            pattern: [
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
            to: List,
            pattern: [
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
            to: SetToIndex,
            pattern: [
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
            to: ValueGroup,
            pattern: [
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
            to: GreaterThanOperator,
            pattern: [
                {
                    type: Operator,
                    value: '>',
                },
            ],
        },
        {
            to: GreaterThanOrEqualOperator,
            pattern: [
                {
                    type: GreaterThanOperator,
                },
                {
                    type: EqualOperator,
                },
            ],
        },
        {
            to: LessThanOperator,
            pattern: [
                {
                    type: Operator,
                    value: '<',
                },
            ],
        },
        {
            to: LessThanOrEqualOperator,
            pattern: [
                {
                    type: LessThanOperator,
                },
                {
                    type: EqualOperator,
                },
            ],
        },
        {
            to: Variable,
            pattern: [
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
            to: SetVariable,
            pattern: [
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
            to: DivideOperator,
            pattern: [
                {
                    type: Operator,
                    value: '/',
                },
            ],
        },
        {
            to: MultiplyOperator,
            pattern: [
                {
                    type: Operator,
                    value: '*',
                },
            ],
        },
        {
            to: PlusOperator,
            pattern: [
                {
                    type: Operator,
                    value: '+',
                },
            ],
        },
        {
            to: MinusOperator,
            pattern: [
                {
                    type: Operator,
                    value: '-',
                },
            ],
        },
        {
            to: AndOperator,
            pattern: [
                {
                    type: Keyword,
                    value: '이고',
                },
            ],
        },
        {
            to: RangeOperator,
            pattern: [
                {
                    type: Operator,
                    value: '~',
                },
            ],
        },
        {
            to: IfStatement,
            pattern: [
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
            to: IfStatement,
            pattern: [
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
            to: Print,
            pattern: [
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
            to: Loop,
            pattern: [
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
            to: Break,
            pattern: [
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
        {
            to: Return,
            pattern: [
                {
                    type: Keyword,
                    value: '약속',
                },
                {
                    type: Keyword,
                    value: '그만',
                },
            ],
        },
        {
            to: ListLoop,
            pattern: [
                {
                    type: Keyword,
                    value: '반복',
                },
                {
                    type: Evaluable,
                    as: 'list',
                },
                {
                    type: Keyword,
                    value: '의',
                },
                {
                    type: Variable,
                    as: 'name',
                },
                {
                    type: Keyword,
                    value: '마다',
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
            to: Formula,
            pattern: [
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
            to: Mention,
            pattern: [
                {
                    type: Expression,
                    value: '@',
                },
                {
                    type: Keyword,
                    as: 'name',
                },
            ],
        },
    ],
]
