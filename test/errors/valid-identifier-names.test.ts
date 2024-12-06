import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../src/mod.ts'
import { CannotUseReservedWordForIdentifierNameError } from '../../src/error/index.ts'

Deno.test('Valid identifier names', async () => {
    try {
        await yaksok(`멍멍이: 10`)
        await yaksok(`야용이: 20`)
        await yaksok(`ㄱ자_전선: 20`)
        await yaksok(`내이름은ㄴ이야: 20`)
        await yaksok(`_사용하지않음: 20`)
    } catch (_) {
        unreachable()
    }
})

Deno.test('Invalid identifier name', async () => {
    try {
        await yaksok(`멍멍*이: 10`)
        unreachable()
    } catch (error) {
        assertIsError(error)
    }
})

Deno.test('Cannot use reserved words as an identifier', async () => {
    try {
        await yaksok(`만약: 10`)
        unreachable()
    } catch (error) {
        assertIsError(error, CannotUseReservedWordForIdentifierNameError)
    }
})
