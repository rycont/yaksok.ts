import { assertEquals } from 'assert'
import { parse } from '../parser/index.ts'

import { tokenize } from '../tokenize/index.ts'
import { Keyword } from '../nodes/base.ts'
import { StringValue } from '../nodes/primitive.ts'
import {
    BinaryCalculation,
    Block,
    SetVariable,
    EOL,
    PlusOperator,
    Variable,
} from '../nodes/index.ts'

Deno.test('Matching case: Wrapping class inherits from child class', () => {
    const code = `
이름: "홍길" + "동"    
`

    const result = parse(tokenize(code))

    assertEquals(
        result,
        new Block([
            new EOL(),
            new SetVariable({
                name: new Variable({ name: new Keyword('이름') }),
                value: new BinaryCalculation({
                    left: new StringValue('홍길'),
                    operator: new PlusOperator(),
                    right: new StringValue('동'),
                }),
            }),
            new EOL(),
        ]),
    )
})
