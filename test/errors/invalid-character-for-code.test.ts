import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../src/index.ts'
import { UnexpectedCharError } from '../../src/error/index.ts'

Deno.test('사용할 수 없는 문자', () => {
    try {
        yaksok(`내 이름: "정한";`)
        unreachable()
    } catch (error) {
        assertIsError(error, UnexpectedCharError)
    }
})
