import { yaksok } from '@yaksok-ts/core'
import { assertIsError } from '@std/assert'
import { FileForRunNotExistError } from '../../src/error/prepare.ts'

Deno.test('없는 파일 실행 요청', () => {
    try {
        yaksok({
            main: `
    @코레일 출발하기
            `,
        })
    } catch (e) {
        assertIsError(e, FileForRunNotExistError)
    }

    try {
        yaksok({
            코레일: `
요금계산표: "없음"
            `,
        })
    } catch (e) {
        assertIsError(e, FileForRunNotExistError)
    }
})
