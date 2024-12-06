import { assertIsError } from '@std/assert'
import { IndentIsNotMultipleOf4Error } from '../../src/error/index.ts'
import { IndentLevelMismatchError } from '../../src/error/prepare.ts'
import { yaksok } from '../../src/mod.ts'

Deno.test('온전하지 않은 인덴트', async () => {
    try {
        await yaksok(`
   이름: '홍길동'
    나이: 20
`)
    } catch (error) {
        assertIsError(error, IndentLevelMismatchError)
    }
})

Deno.test('길이가 잘못된 인덴트', async () => {
    try {
        await yaksok(`
이름: '홍길동'
     나이: 20
`)
    } catch (error) {
        assertIsError(error, IndentIsNotMultipleOf4Error)
    }
})

Deno.test('시작부터 들어간 인덴트', async () => {
    try {
        await yaksok(`
   이름: '홍길동'
    나이: 20
`)
    } catch (error) {
        assertIsError(error, IndentLevelMismatchError)
    }
})

Deno.test('레벨을 초월한 인덴트', async () => {
    try {
        await yaksok(`
이름: '홍길동'
        나이: 20
`)
    } catch (error) {
        assertIsError(error, IndentLevelMismatchError)
    }
})
