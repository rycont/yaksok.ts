import { assertEquals } from 'assert'
import { parse } from '../parser/index.ts'
import { Block } from '../nodes/block.ts'
import { BinaryCalculation } from '../nodes/calculation.ts'
import { EOL } from '../nodes/misc.ts'
import { EqualOperator } from '../nodes/operator.ts'
import { NumberValue } from '../nodes/primitive.ts'

import { tokenize } from '../tokenize/index.ts'
import { IfStatement, SetVariable, Keyword, Variable } from '../nodes/index.ts'

Deno.test('Parse with indent', () => {
    const code = `
만약 1 = 1 이면
    만약 2 = 2 이면
        값: 5
    아니면
        값: 6
아니면
    값: 3
`

    const result = parse(tokenize(code))

    assertEquals(
        result,
        new Block([
            new EOL(),
            new IfStatement({
                ifBody: new IfStatement({
                    condition: new BinaryCalculation({
                        left: new NumberValue(1),
                        operator: new EqualOperator(),
                        right: new NumberValue(1),
                    }),
                    body: new Block([
                        new IfStatement({
                            ifBody: new IfStatement({
                                condition: new BinaryCalculation({
                                    left: new NumberValue(2),
                                    operator: new EqualOperator(),
                                    right: new NumberValue(2),
                                }),
                                body: new Block([
                                    new SetVariable({
                                        name: new Variable({
                                            name: new Keyword('값'),
                                        }),
                                        value: new NumberValue(5),
                                    }),
                                ]),
                            }),
                            elseBody: new Block([
                                new SetVariable({
                                    name: new Variable({
                                        name: new Keyword('값'),
                                    }),
                                    value: new NumberValue(6),
                                }),
                            ]),
                        }),
                        new EOL(),
                    ]),
                }),

                elseBody: new Block([
                    new SetVariable({
                        name: new Variable({
                            name: new Keyword('값'),
                        }),
                        value: new NumberValue(3),
                    }),
                ]),
            }),
            new EOL(),
        ]),
    )
})
