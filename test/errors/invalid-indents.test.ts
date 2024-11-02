import { assertIsError } from 'assert'
import { IndentIsNotMultipleOf4Error } from '../../error/index.ts'
import { yaksok } from '../../index.ts'

Deno.test('온전하지 않은 인덴트', () => {
    try {
        yaksok(`
   이름: '홍길동'
    나이: 20
`)
    } catch (error) {
        assertIsError(error, IndentIsNotMultipleOf4Error)
    }
})