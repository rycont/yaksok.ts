import { Formula, ValueWithParenthesis } from '../../node/calculation.ts'
import { DeclareFFI, FFIBody } from '../../node/ffi.ts'
import { DeclareFunction, FunctionInvoke } from '../../node/function.ts'
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
    Identifier,
    LessThanOperator,
    LessThanOrEqualOperator,
    ListLiteral,
    Loop,
    MinusOperator,
    MultiplyOperator,
    type Node,
    Operator,
    PlusOperator,
    Print,
    RangeOperator,
    Return,
    Sequence,
    SetToIndex,
    SetVariable,
    IntegerDivideOperator,
    ModularOperator,
    PowerOperator,
    OrOperator,
} from '../../node/index.ts'
import { ListLoop } from '../../node/listLoop.ts'
import { IndexedValue } from '../../value/indexed.ts'
import { NumberValue, StringValue } from '../../value/primitive.ts'

import type { Token } from '../tokenize/token.ts'

export interface PatternUnit {
    type: {
        new (...args: any[]): Node
    }
    value?: Record<string, unknown> | string | number
    as?: string
}

export type Rule = {
    pattern: PatternUnit[]
    factory: (nodes: Node[], tokens: Token[]) => Node
    config?: Record<string, unknown>
}

export const BASIC_RULES: Rule[][] = [
    [
        {
            pattern: [
                {
                    type: Evaluable,
                },
                {
                    type: Expression,
                    value: '[',
                },
                {
                    type: Evaluable,
                },
                {
                    type: Expression,
                    value: ']',
                },
            ],
            factory: (nodes, tokens) => {
                const target = nodes[0] as Evaluable<IndexedValue>
                const index = nodes[2] as Evaluable<StringValue | NumberValue>

                return new IndexFetch(target, index, tokens)
            },
        },
    ],
    [
        {
            pattern: [
                {
                    type: Expression,
                    value: '(',
                },
                {
                    type: Evaluable,
                },
                {
                    type: Expression,
                    value: ')',
                },
            ],
            factory: (nodes, tokens) => {
                const newNode = new ValueWithParenthesis(
                    nodes[1] as Evaluable,
                    tokens,
                )
                newNode.position = nodes[0].position

                return newNode
            },
        },
        {
            pattern: [
                {
                    type: Expression,
                    value: '[',
                },
                {
                    type: Sequence,
                },
                {
                    type: Expression,
                    value: ']',
                },
            ],
            factory: (nodes, tokens) => {
                const sequence = nodes[1] as Sequence
                return new ListLiteral(sequence.items, tokens)
            },
        },
        {
            pattern: [
                {
                    type: Evaluable,
                },
                {
                    type: Operator,
                },
                {
                    type: Evaluable,
                },
            ],
            factory: (nodes, tokens) => {
                const left = nodes[0] as Evaluable
                const operator = nodes[1] as Operator
                const right = nodes[2] as Evaluable

                if (left instanceof Formula) {
                    return new Formula([...left.terms, operator, right], tokens)
                }

                return new Formula([left, operator, right], tokens)
            },
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '=',
                },
            ],
            factory: (_nodes, tokens) => new EqualOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '>',
                },
            ],
            factory: (_nodes, tokens) => new GreaterThanOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '<',
                },
            ],
            factory: (_nodes, tokens) => new LessThanOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '>=',
                },
            ],
            factory: (_nodes, tokens) => new GreaterThanOrEqualOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '<=',
                },
            ],
            factory: (_nodes, tokens) => new LessThanOrEqualOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '//',
                },
            ],
            factory: (_nodes, tokens) => new IntegerDivideOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '%',
                },
            ],
            factory: (_nodes, tokens) => new ModularOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '**',
                },
            ],
            factory: (_nodes, tokens) => new PowerOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '/',
                },
            ],
            factory: (_nodes, tokens) => new DivideOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '*',
                },
            ],
            factory: (_nodes, tokens) => new MultiplyOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '+',
                },
            ],
            factory: (_nodes, tokens) => new PlusOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '-',
                },
            ],
            factory: (_nodes, tokens) => new MinusOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Identifier,
                    value: '이고',
                },
            ],
            factory: (_nodes, tokens) => new AndOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Identifier,
                    value: '고',
                },
            ],
            factory: (_nodes, tokens) => new AndOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Identifier,
                    value: '이거나',
                },
            ],
            factory: (_nodes, tokens) => new OrOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Identifier,
                    value: '거나',
                },
            ],
            factory: (_nodes, tokens) => new OrOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '~',
                },
            ],
            factory: (_nodes, tokens) => new RangeOperator(tokens),
        },
        {
            pattern: [
                {
                    type: Identifier,
                    value: '약속',
                },
                {
                    type: Expression,
                    value: ',',
                },
                {
                    type: FunctionInvoke,
                },
                {
                    type: EOL,
                },
                {
                    type: Block,
                },
            ],
            factory: (nodes, tokens) => {
                const [_, __, functionInvoke, ___, body] = nodes as [
                    unknown,
                    unknown,
                    FunctionInvoke,
                    unknown,
                    Block,
                ]

                const functionName = functionInvoke.name

                return new DeclareFunction(
                    {
                        body,
                        name: functionName,
                    },
                    tokens,
                )
            },
        },
        {
            pattern: [
                {
                    type: Identifier,
                    value: '번역',
                },
                {
                    type: ValueWithParenthesis,
                },
                {
                    type: Expression,
                    value: ',',
                },
                {
                    type: FunctionInvoke,
                },
                {
                    type: EOL,
                },
                {
                    type: FFIBody,
                },
            ],
            factory: (nodes, tokens) => {
                const [_, runtimeNode, __, functionInvoke, ___, body] =
                    nodes as [
                        unknown,
                        ValueWithParenthesis,
                        unknown,
                        FunctionInvoke,
                        unknown,
                        FFIBody,
                    ]

                const functionName = functionInvoke.name
                const runtime = (runtimeNode.value as Identifier).value

                return new DeclareFFI(
                    {
                        body: body.code,
                        name: functionName,
                        runtime,
                    },
                    tokens,
                )
            },
        },
    ],
]

export const ADVANCED_RULES: Rule[] = [
    {
        pattern: [
            {
                type: Evaluable,
            },
            {
                type: Expression,
                value: ',',
            },
            {
                type: Evaluable,
            },
        ],
        factory: (nodes, tokens) => {
            const a = nodes[0] as Evaluable
            const b = nodes[2] as Evaluable

            return new Sequence([a, b], tokens)
        },
    },
    {
        pattern: [
            {
                type: Sequence,
            },
            {
                type: Expression,
                value: ',',
            },
            {
                type: Evaluable,
            },
        ],
        factory: (nodes, tokens) => {
            const a = nodes[0] as Sequence
            const b = nodes[2] as Evaluable

            return new Sequence([...a.items, b], tokens)
        },
    },
    {
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
        factory: (_nodes, tokens) => new ListLiteral([], tokens),
    },
    {
        pattern: [
            {
                type: IndexFetch,
            },
            {
                type: Expression,
                value: ':',
            },
            {
                type: Evaluable,
            },
        ],
        factory: (nodes, tokens) => {
            const target = nodes[0] as IndexFetch
            const value = nodes[2] as Evaluable

            return new SetToIndex(target, value, tokens)
        },
    },
    {
        pattern: [
            {
                type: Identifier,
            },
            {
                type: Expression,
                value: ':',
            },
            {
                type: Evaluable,
            },
            {
                type: EOL,
            },
        ],
        factory: (nodes, tokens) => {
            const name = (nodes[0] as Identifier).value
            const value = nodes[2] as Evaluable

            return new SetVariable(name, value, tokens)
        },
    },
    {
        pattern: [
            {
                type: IfStatement,
            },
            {
                type: ElseIfStatement,
            },
        ],
        factory: (nodes, tokens) => {
            const [ifStatement, elseIfStatement] = nodes as [
                IfStatement,
                ElseIfStatement,
            ]

            const elseIfCase = elseIfStatement.elseIfCase
            ifStatement.cases.push(elseIfCase)

            ifStatement.tokens = tokens

            return ifStatement
        },
    },
    {
        pattern: [
            {
                type: IfStatement,
            },
            {
                type: ElseStatement,
            },
        ],
        factory: (nodes, tokens) => {
            const [ifStatement, elseStatement] = nodes as [
                IfStatement,
                ElseStatement,
            ]

            const elseCase = {
                body: elseStatement.body,
            }

            ifStatement.cases.push(elseCase)
            ifStatement.tokens = tokens

            return ifStatement
        },
    },
    {
        pattern: [
            {
                type: Identifier,
                value: '아니면',
            },
            {
                type: Identifier,
                value: '만약',
            },
            {
                type: Evaluable,
            },
            {
                type: Identifier,
                value: '이면',
            },
            {
                type: EOL,
            },
            {
                type: Block,
            },
        ],
        factory: (nodes, tokens) => {
            const condition = nodes[2] as Evaluable
            const body = nodes[5] as Block

            return new ElseIfStatement({ condition, body }, tokens)
        },
    },
    {
        pattern: [
            {
                type: Identifier,
                value: '아니면',
            },
            {
                type: EOL,
            },
            {
                type: Block,
            },
        ],
        factory: (nodes, tokens) => {
            const body = nodes[2] as Block

            return new ElseStatement(body, tokens)
        },
    },
    {
        pattern: [
            {
                type: Identifier,
                value: '만약',
            },
            {
                type: Evaluable,
            },
            {
                type: Identifier,
                value: '이면',
            },
            {
                type: EOL,
            },
            {
                type: Block,
            },
        ],
        factory: (nodes, tokens) => {
            const condition = nodes[1] as Evaluable
            const body = nodes[4] as Block

            return new IfStatement([{ condition, body }], tokens)
        },
    },
    {
        pattern: [
            {
                type: Evaluable,
            },
            {
                type: Identifier,
                value: '보여주기',
            },
        ],
        factory: (nodes, tokens) => {
            const value = nodes[0] as Evaluable
            return new Print(value, tokens)
        },
    },
    {
        pattern: [
            {
                type: Identifier,
                value: '반복',
            },
            {
                type: EOL,
            },
            {
                type: Block,
            },
        ],
        factory: (nodes, tokens) => new Loop(nodes[2] as Block, tokens),
    },
    {
        pattern: [
            {
                type: Identifier,
                value: '반복',
            },
            {
                type: Identifier,
                value: '그만',
            },
        ],
        factory: (_nodes, tokens) => new Break(tokens),
    },
    {
        pattern: [
            {
                type: Identifier,
                value: '약속',
            },
            {
                type: Identifier,
                value: '그만',
            },
        ],
        factory: (_nodes, tokens) => new Return(tokens),
    },
    {
        pattern: [
            {
                type: Identifier,
                value: '반복',
            },
            {
                type: Evaluable,
            },
            {
                type: Identifier,
                value: '의',
            },
            {
                type: Identifier,
            },
            {
                type: Identifier,
                value: '마다',
            },
            {
                type: EOL,
            },
            {
                type: Block,
            },
        ],
        factory: (nodes, tokens) => {
            const list = nodes[1] as Evaluable
            const name = (nodes[3] as Identifier).value
            const body = nodes[6] as Block

            return new ListLoop(list, name, body, tokens)
        },
    },
]
