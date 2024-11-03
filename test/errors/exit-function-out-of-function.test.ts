import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../src/index.ts'
import { CannotReturnOutsideFunctionError } from '../../src/error/index.ts'

Deno.test('약속의 밖에서는 `약속 그만`을 쓸 수 없음', () => {
    try {
        yaksok(`"약속 밖에서는 약속을 멈출 수 없습니다" 보여주기
약속 그만`)

        unreachable()
    } catch (error) {
        assertIsError(error, CannotReturnOutsideFunctionError)
    }
})
