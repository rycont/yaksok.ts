import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../src/mod.ts'
import { CannotUseReservedWordForIdentifierNameError } from '../../src/error/index.ts'

Deno.test('Valid identifier names', () => {
    try {
        yaksok(`멍멍이: 10`)
        yaksok(`야용이: 20`)
        yaksok(`ㄱ자_전선: 20`)
        yaksok(`내이름은ㄴ이야: 20`)
        yaksok(`_사용하지않음: 20`)
    } catch (_) {
        unreachable()
    }
})

Deno.test('Invalid identifier name', () => {
    try {
        yaksok(`멍멍*이: 10`)
        unreachable()
    } catch (error) {
        assertIsError(error)
    }
})

Deno.test('Cannot use reserved words as an identifier', () => {
    try {
        yaksok(`만약: 10`)
        unreachable()
    } catch (error) {
        assertIsError(error, CannotUseReservedWordForIdentifierNameError)
    }
})
