import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../src/mod.ts'
import { InvalidTypeForOperatorError } from '../../src/error/index.ts'

Deno.test('약속 안에서 발생한 오류', () => {
    try {
        yaksok(`약속, 신나게 놀기
    "이름" / 10 보여주기
    
신나게 놀기`)
        unreachable()
    } catch (error) {
        assertIsError(error, InvalidTypeForOperatorError)
    }
})
