import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../index.ts'
import { CannotParseError } from '../../error/index.ts'

Deno.test('올바르지 않은 괄호 묶음', () => {
    try {
        yaksok(`(이고)`)
        unreachable()
    } catch (error) {
        assertIsError(error, CannotParseError)
    }
})
