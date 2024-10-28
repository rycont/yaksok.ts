import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../index.ts'
import { UnexpectedTokenError } from '../../error/index.ts'

Deno.test('인자를 닫는 괄호가 필요하지만 없습니다', () => {
    try {
        yaksok(`
약속, (음식 10)을 맛있게 만들기
    음식 + "을/를 맛있게 만들었습니다." 보여주기
`)
        unreachable()
    } catch (error) {
        assertIsError(error, UnexpectedTokenError)
    }
})
