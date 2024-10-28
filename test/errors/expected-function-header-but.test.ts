import { assertIsError } from 'assert'
import { yaksok } from '../../index.ts'
import { UnexpectedTokenError } from '../../error/index.ts'

Deno.test('온전하지 않은 약속 정의', () => {
    try {
        yaksok(`약속, (A)와 (`)
    } catch (error) {
        assertIsError(error, UnexpectedTokenError)
        console.log(error)
    }
})
