import { assertEquals, unreachable } from 'assert'
import { tokenize } from '../prepare/tokenize/index.ts'

import { parse } from '../prepare/parse/index.ts'
import {
    Block,
    EOL,
    NumberValue,
    Print,
    Loop,
    StringValue,
} from '../node/index.ts'
import { run } from '../runtime/run.ts'

Deno.test('Parse Loop', () => {
    const code = `
반복
    "Hello, World!" 보여주기
`
    const node = parse(tokenize(code))

    assertEquals(
        node,
        new Block([
            new EOL(),
            new Loop({
                body: new Block([
                    new Print({
                        value: new StringValue('Hello, World!'),
                    }),
                    new EOL(),
                ]),
            }),
            new EOL(),
        ]),
    )
})

Deno.test('Run loop', () => {
    const code = `
횟수: 500
반복
    횟수: 횟수 - 1
    만약 횟수 = 11 이면
        반복 그만
`
    try {
        const result = run(parse(tokenize(code)))
        assertEquals(result.getVariable('횟수'), new NumberValue(11))
    } catch (_) {
        unreachable()
    }
})
