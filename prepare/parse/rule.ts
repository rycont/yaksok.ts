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
    ValueWithBracket,
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
    ValueWithParenthesis,
    Variable,
} from '../../node/index.ts'
import { ListLoop } from '../../node/listLoop.ts'

export interface PatternUnit {
    type: {
        new (...args: any[]): Node
    }
    value?: Record<string, unknown> | string | number
    as?: string
}

export type Rule = {
    pattern: PatternUnit[]
    factory: (nodes: Node[]) => Node
    config?: Record<string, unknown>
}

export const internalPatternsByLevel: Rule[][] = [
    [
        {
            pattern: [
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
            factory: (nodes) => {
                const index = nodes[1] as Evaluable
                return new ValueWithBracket(index)
            },
        },
        {
            pattern: [
                {
                    type: Evaluable,
                },
                {
                    type: ValueWithBracket,
                },
            ],
            factory: (nodes) => {
                const target = nodes[0] as Evaluable
                const index = nodes[1] as ValueWithBracket
                return new IndexFetch(target, index.value)
            },
        },
    ],
    [
        {
            pattern: [
                {
                    type: Operator,
                    value: '=',
                },
            ],
            factory: () => new EqualOperator(),
        },
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
            factory: (nodes) => {
                const a = nodes[0] as Evaluable
                const b = nodes[2] as Evaluable

                if (a instanceof Sequence) {
                    return new Sequence([...a.items, b])
                }

                return new Sequence([a, b])
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
            factory: (nodes) => {
                const sequence = nodes[1] as Sequence
                return new List(sequence.items)
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
            factory: () => new List([]),
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
            factory: (nodes) => {
                const target = nodes[0] as IndexFetch
                const value = nodes[2] as Evaluable

                return new SetToIndex(target, value)
            },
        },
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
            factory: (nodes) => {
                const value = nodes[1] as Evaluable
                return new ValueWithParenthesis(value)
            },
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '>',
                },
            ],
            factory: () => new GreaterThanOperator(),
        },
        {
            pattern: [
                {
                    type: GreaterThanOperator,
                },
                {
                    type: EqualOperator,
                },
            ],
            factory: () => new GreaterThanOrEqualOperator(),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '<',
                },
            ],
            factory: () => new LessThanOperator(),
        },
        {
            pattern: [
                {
                    type: LessThanOperator,
                },
                {
                    type: EqualOperator,
                },
            ],
            factory: () => new LessThanOrEqualOperator(),
        },
        {
            pattern: [
                {
                    type: Keyword,
                    value: '이전',
                },
                {
                    type: Variable,
                },
            ],
            factory: (nodes) => {
                const variable = nodes[1] as Variable
                const name = variable.name

                return new Variable(name)
            },
        },
        {
            pattern: [
                {
                    type: Variable,
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
            factory: (nodes) => {
                const name = (nodes[0] as Variable).name
                const value = nodes[2] as Evaluable

                return new SetVariable(name, value)
            },
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '/',
                },
            ],
            factory: () => new DivideOperator(),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '*',
                },
            ],
            factory: () => new MultiplyOperator(),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '+',
                },
            ],
            factory: () => new PlusOperator(),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '-',
                },
            ],
            factory: () => new MinusOperator(),
        },
        {
            pattern: [
                {
                    type: Keyword,
                    value: '이고',
                },
            ],
            factory: () => new AndOperator(),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '~',
                },
            ],
            factory: () => new RangeOperator(),
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
            factory: (nodes) => {
                const [ifStatement, elseIfStatement] = nodes as [
                    IfStatement,
                    ElseIfStatement,
                ]

                const elseIfCase = elseIfStatement.elseIfCase
                ifStatement.cases.push(elseIfCase)

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
            factory: (nodes) => {
                const [ifStatement, elseStatement] = nodes as [
                    IfStatement,
                    ElseStatement,
                ]

                const elseCase = {
                    body: elseStatement.body,
                }
                ifStatement.cases.push(elseCase)

                return ifStatement
            },
        },
        {
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
                },
            ],
            factory: (nodes) => {
                const condition = nodes[2] as Evaluable
                const body = nodes[5] as Block

                return new ElseIfStatement({ condition, body })
            },
        },
        {
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
                },
            ],
            factory: (nodes) => {
                const body = nodes[2] as Block

                return new ElseStatement(body)
            },
        },
        {
            pattern: [
                {
                    type: Keyword,
                    value: '만약',
                },
                {
                    type: Evaluable,
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
                },
            ],
            factory: (nodes) => {
                const condition = nodes[1] as Evaluable
                const body = nodes[4] as Block

                return new IfStatement([{ condition, body }])
            },
        },
        {
            pattern: [
                {
                    type: Evaluable,
                },
                {
                    type: Keyword,
                    value: '보여주기',
                },
            ],
            factory: (nodes) => {
                const value = nodes[0] as Evaluable
                return new Print(value)
            },
        },
        {
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
                },
            ],
            factory: (nodes) => new Loop(nodes[2] as Block),
        },
        {
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
            factory: () => new Break(),
        },
        {
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
            factory: () => new Return(),
        },
        {
            pattern: [
                {
                    type: Keyword,
                    value: '반복',
                },
                {
                    type: Evaluable,
                },
                {
                    type: Keyword,
                    value: '의',
                },
                {
                    type: Variable,
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
                },
            ],
            factory: (nodes) => {
                const list = nodes[1] as Evaluable
                const name = (nodes[3] as Variable).name
                const body = nodes[6] as Block

                return new ListLoop(list, name, body)
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
            factory: (nodes) => {
                const left = nodes[0] as Evaluable
                const operator = nodes[1] as Operator
                const right = nodes[2] as Evaluable

                if (left instanceof Formula) {
                    return new Formula([...left.terms, operator, right])
                }

                return new Formula([left, operator, right])
            },
        },
        {
            pattern: [
                {
                    type: Expression,
                    value: '@',
                },
                {
                    type: Keyword,
                },
            ],
            factory: (nodes) => {
                const name = (nodes[1] as Keyword).value
                return new Mention(name)
            },
        },
    ],
]
