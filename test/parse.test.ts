import { assertEquals } from 'assert'

import { Block } from '../node/block.ts'
import { Formula } from '../node/calculation.ts'
import { IfStatement, SetVariable } from '../node/index.ts'
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
            new IfStatement([
                {
                    condition: new Formula([
                        new NumberValue(1),
                        new EqualOperator(),
                        new NumberValue(1),
                    ]),
                    body: new Block([
                        new IfStatement([
                            {
                                condition: new Formula([
                                    new NumberValue(2),
                                    new EqualOperator(),
                                    new NumberValue(2),
                                ]),
                                body: new Block([
                                    new SetVariable('값', new NumberValue(5)),
                                ]),
                            },
                            {
                                body: new Block([
                                    new SetVariable('값', new NumberValue(6)),
                                ]),
                            },
                        ]),
                        new EOL(),
                    ]),
                },
                {
                    body: new Block([
                        new SetVariable('값', new NumberValue(3)),
                    ]),
                },
            ]),
            new EOL(),
        ]),
    )
})
