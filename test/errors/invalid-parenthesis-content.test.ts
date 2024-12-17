import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../core/mod.ts'
import { CannotParseError } from '../../core/error/index.ts'

Deno.test('올바르지 않은 괄호 묶음', async () => {
    try {
        await yaksok(`(이고)`)
        unreachable()
    } catch (error) {
        assertIsError(error, CannotParseError)
    }
})
