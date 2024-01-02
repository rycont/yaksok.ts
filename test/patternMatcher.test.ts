import { assertEquals } from 'assert'

import {
    Block,
    EOL,
    Formula,
    PlusOperator,
    SetVariable,
} from '../node/index.ts'
import { StringValue } from '../node/primitive.ts'
import { parse } from '../prepare/parse/index.ts'
import { tokenize } from '../prepare/tokenize/index.ts'

Deno.test('Matching case: Wrapping class inherits from child class', () => {
    const code = `
이름: "홍길" + "동"    
`

    const { ast } = parse(tokenize(code, true))

    assertEquals(
        ast,
        new Block([
            new EOL(),
            new SetVariable(
                '이름',
                new Formula([
                    new StringValue('홍길'),
                    new PlusOperator(),
                    new StringValue('동'),
                ]),
            ),
            new EOL(),
        ]),
    )
})
