import { assertIsError } from 'assert'
import { yaksok } from '../../core/mod.ts'
import { UnexpectedEndOfCodeError } from '../../core/error/index.ts'

Deno.test('예상치 못한 줄바꿈', async () => {
    try {
        await yaksok(`약속, (A)와 (B)를`)
    } catch (error) {
        assertIsError(error, UnexpectedEndOfCodeError)
        console.log(error)
    }
})
