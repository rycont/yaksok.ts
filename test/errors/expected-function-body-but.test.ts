import { assertIsError } from 'assert'
import { yaksok } from '../../index.ts'
import { UnexpectedTokenError } from '../../error/index.ts'

Deno.test('온전하지 않은 약속', () => {
    try {
        yaksok(`약속, (A)와 (B)를 더하기
축하하기`)
    } catch (error) {
        assertIsError(error, UnexpectedTokenError)
        console.log(error)
    }
})
