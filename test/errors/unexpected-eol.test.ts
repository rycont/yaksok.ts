import { assertIsError } from 'assert'
import { yaksok } from '../../index.ts'
import { UnexpectedEndOfCodeError } from '../../error/index.ts'

Deno.test('예상치 못한 줄바꿈', () => {
    try {
        yaksok(`약속, (A)와 (B)를`)
    } catch (error) {
        assertIsError(error, UnexpectedEndOfCodeError)
        console.log(error)
    }
})
