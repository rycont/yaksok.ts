import { Formula } from '../../node/calculation.ts'
import {
    AndOperator,
    Block,
    Break,
    DivideOperator,
    EOL,
    ElseIfStatement,
    ElseStatement,
    EqualOperator,
    Evaluable,
    Expression,
    GreaterThanOperator,
    GreaterThanOrEqualOperator,
    IfStatement,
    IndexFetch,
    Indexing,
    Keyword,
    LessThanOperator,
    LessThanOrEqualOperator,
    List,
    Loop,
    Mention,
    MinusOperator,
    MultiplyOperator,
    Node,
    Operator,
    PlusOperator,
    Print,
    RangeOperator,
    Return,
    Sequence,
    SetToIndex,
    SetVariable,
    ValueGroup,
    Variable,
} from '../../node/index.ts'
import { ListLoop } from '../../node/listLoop.ts'

export interface PatternUnit {
    type: {
        new(...args: any[]): Node
    }
    value?: Record<string, unknown> | string | number
    as?: string
}

export interface Rule {
    _to: {
        new(...args: any[]): Node
    }
    pattern: PatternUnit[]
    factory?: (nodes: Node[]) => Node
    config?: Record<string, unknown>
}

export const internalPatternsByLevel: Rule[][] = [
    [
        {
            _to: Indexing,
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
            _to: IndexFetch,
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
            _to: EqualOperator,
            pattern: [
                {
                    type: Operator,
                    value: '=',
                },
            ],
        },
        {
            _to: Sequence,
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
            _to: List,
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
            _to: List,
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
            _to: SetToIndex,
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
            _to: ValueGroup,
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
            _to: GreaterThanOperator,
            pattern: [
                {
                    type: Operator,
                    value: '>',
                },
            ],
        },
        {
            _to: GreaterThanOrEqualOperator,
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
            _to: LessThanOperator,
            pattern: [
                {
                    type: Operator,
                    value: '<',
                },
            ],
        },
        {
            _to: LessThanOrEqualOperator,
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
            _to: Variable,
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
            _to: SetVariable,
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
            _to: DivideOperator,
            pattern: [
                {
                    type: Operator,
                    value: '/',
                },
            ],
        },
        {
            _to: MultiplyOperator,
            pattern: [
                {
                    type: Operator,
                    value: '*',
                },
            ],
        },
        {
            _to: PlusOperator,
            pattern: [
                {
                    type: Operator,
                    value: '+',
                },
            ],
        },
        {
            _to: MinusOperator,
            pattern: [
                {
                    type: Operator,
                    value: '-',
                },
            ],
        },
        {
            _to: AndOperator,
            pattern: [
                {
                    type: Keyword,
                    value: '이고',
                },
            ],
        },
        {
            _to: RangeOperator,
            pattern: [
                {
                    type: Operator,
                    value: '~',
                },
            ],
        },
        {
            _to: IfStatement,
            pattern: [
                {
                    type: IfStatement,
                    as: 'ifStatement',
                },
                {
                    type: ElseIfStatement,
                    as: 'elseIfStatement',
                },
            ],
        },
        {
            _to: IfStatement,
            pattern: [
                {
                    type: IfStatement,
                    as: 'ifStatement',
                },
                {
                    type: ElseStatement,
                    as: 'elseStatement',
                },
            ],
        },
        {
            _to: ElseIfStatement,
            pattern: [
                {
                    type: Keyword,
                    value: '아니면',
                },
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
            _to: ElseStatement,
            pattern: [
                {
                    type: Keyword,
                    value: '아니면',
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
            _to: IfStatement,
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
            _to: Print,
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
            _to: Loop,
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
            _to: Break,
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
            _to: Return,
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
            _to: ListLoop,
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
            _to: Formula,
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
            _to: Mention,
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
