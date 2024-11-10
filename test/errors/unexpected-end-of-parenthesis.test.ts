import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../src/mod.ts'
import { UnexpectedEndOfCodeError } from '../../src/error/index.ts'

Deno.test('끝나지 못한 괄호', () => {
    try {
        yaksok(`나이: 10 + (20`)
        unreachable()
    } catch (error) {
        assertIsError(error, UnexpectedEndOfCodeError)
    }
})
