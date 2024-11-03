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
    Identifier,
    LessThanOperator,
    LessThanOrEqualOperator,
    List,
    Loop,
    Mention,
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
                    type: Operator,
                    value: '>',
                },
            ],
            factory: () => new GreaterThanOperator(),
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
                    type: Operator,
                    value: '>=',
                },
            ],
            factory: () => new GreaterThanOrEqualOperator(),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '<=',
                },
            ],
            factory: () => new LessThanOrEqualOperator(),
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
            factory: (nodes) => {
                const name = (nodes[0] as Identifier).value
                const value = nodes[2] as Evaluable

                return new SetVariable(name, value)
            },
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '//',
                },
            ],
            factory: () => new IntegerDivideOperator(),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '%',
                },
            ],
            factory: () => new ModularOperator(),
        },
        {
            pattern: [
                {
                    type: Operator,
                    value: '**',
                },
            ],
            factory: () => new PowerOperator(),
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
                    type: Identifier,
                    value: '이고',
                },
            ],
            factory: () => new AndOperator(),
        },
        {
            pattern: [
                {
                    type: Identifier,
                    value: '고',
                },
            ],
            factory: () => new AndOperator(),
        },
        {
            pattern: [
                {
                    type: Identifier,
                    value: '이거나',
                },
            ],
            factory: () => new OrOperator(),
        },
        {
            pattern: [
                {
                    type: Identifier,
                    value: '거나',
                },
            ],
            factory: () => new OrOperator(),
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
            factory: (nodes) => {
                const condition = nodes[2] as Evaluable
                const body = nodes[5] as Block

                return new ElseIfStatement({ condition, body })
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
            factory: (nodes) => {
                const body = nodes[2] as Block

                return new ElseStatement(body)
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
                    type: Identifier,
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
            factory: (nodes) => new Loop(nodes[2] as Block),
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
            factory: () => new Break(),
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
            factory: () => new Return(),
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
            factory: (nodes) => {
                const list = nodes[1] as Evaluable
                const name = (nodes[3] as Identifier).value
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
                    type: Identifier,
                },
            ],
            factory: (nodes) => {
                const name = (nodes[1] as Identifier).value
                return new Mention(name)
            },
        },
    ],
]
