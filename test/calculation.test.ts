import { assertEquals } from 'assert'
import { parse } from '../parser/index.ts'
import { NumberValue } from '../nodes/primitive.ts'

import { run } from '../runtime/run.ts'
import { tokenize } from '../tokenize/index.ts'

Deno.test('Calculation with parenthesis', () => {
    const code = `
값1: (10 * 2) + 10
값2: 10 * (2 + 10)
`

    const result = run(parse(tokenize(code)))
    assertEquals(result.getVariable('값1'), new NumberValue(30))
    assertEquals(result.getVariable('값2'), new NumberValue(120))
})
