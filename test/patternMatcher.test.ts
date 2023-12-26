import { assertEquals } from 'assert'

import { tokenize } from '../prepare/tokenize/index.ts'
import { StringValue } from '../node/primitive.ts'
import { _LEGACY__parse } from '../prepare/parse/index.ts'
import { Keyword } from '../node/base.ts'
import {
    Formula,
    Block,
    SetVariable,
    EOL,
    PlusOperator,
    Variable,
} from '../node/index.ts'

Deno.test('Matching case: Wrapping class inherits from child class', () => {
    const code = `
이름: "홍길" + "동"    
`

    const result = _LEGACY__parse(tokenize(code, true))

    assertEquals(
        result,
        new Block([
            new EOL(),
            new SetVariable({
                name: new Variable({ name: new Keyword('이름') }),
                value: new Formula({
                    left: new StringValue('홍길'),
                    operator: new PlusOperator(),
                    right: new StringValue('동'),
                }),
            }),
            new EOL(),
        ]),
    )
})
