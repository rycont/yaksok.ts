import { assertEquals } from 'assert'
import { parse } from '../parser.ts'
import { NumberPiece } from '../piece/primitive.ts'
import { preprocessor } from '../preprocessor.ts'
import { run } from '../runtime.ts'
import { tokenizer } from '../tokenizer.ts'

Deno.test('Calculation with parenthesis', () => {
    const code = `
값1: (10 * 2) + 10
값2: 10 * (2 + 10)
`

    const result = run(parse(tokenizer(preprocessor(code))))
    assertEquals(result.getVariable('값1'), new NumberPiece(30))
    assertEquals(result.getVariable('값2'), new NumberPiece(120))
})
