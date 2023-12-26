import { assertEquals } from 'assert'
import { _LEGACY__parse } from '../prepare/parse/index.ts'
import { Block } from '../node/block.ts'
import { Formula } from '../node/calculation.ts'
import { EOL } from '../node/misc.ts'
import { EqualOperator } from '../node/operator.ts'
import { NumberValue } from '../node/primitive.ts'

import { tokenize } from '../prepare/tokenize/index.ts'
import { IfStatement, SetVariable, Keyword, Variable } from '../node/index.ts'

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

    const result = _LEGACY__parse(tokenize(code, true))

    assertEquals(
        result,
        new Block([
            new EOL(),
            new IfStatement({
                ifBody: new IfStatement({
                    condition: new Formula({
                        left: new NumberValue(1),
                        operator: new EqualOperator(),
                        right: new NumberValue(1),
                    }),
                    body: new Block([
                        new IfStatement({
                            ifBody: new IfStatement({
                                condition: new Formula({
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
