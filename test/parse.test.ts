import { assertEquals } from 'assert'

import { Block } from '../node/block.ts'
import { Formula } from '../node/calculation.ts'
import { IfStatement, SetVariable, Variable } from '../node/index.ts'
import { EOL } from '../node/misc.ts'
import { EqualOperator } from '../node/operator.ts'
import { NumberValue } from '../node/primitive.ts'
import { parse } from '../prepare/parse/index.ts'
import { tokenize } from '../prepare/tokenize/index.ts'

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

    const { ast } = parse(tokenize(code, true))

    assertEquals(
        ast,
        new Block([
            new EOL(),
            new IfStatement({
                cases: [
                    {
                        condition: new Formula({
                            left: new NumberValue(1),
                            operator: new EqualOperator(),
                            right: new NumberValue(1),
                        }),
                        body: new Block([
                            new IfStatement({
                                cases: [
                                    {
                                        condition: new Formula({
                                            left: new NumberValue(2),
                                            operator: new EqualOperator(),
                                            right: new NumberValue(2),
                                        }),
                                        body: new Block([
                                            new SetVariable({
                                                name: '값',
                                                value: new NumberValue(5),
                                            }),
                                        ]),
                                    },
                                    {
                                        body: new Block([
                                            new SetVariable({
                                                name: '값',
                                                value: new NumberValue(6),
                                            }),
                                        ]),
                                    },
                                ],
                            }),
                            new EOL(),
                        ]),
                    },
                    {
                        body: new Block([
                            new SetVariable({
                                name: '값',
                                value: new NumberValue(3),
                            }),
                        ]),
                    },
                ],
            }),
            new EOL(),
        ]),
    )
})
