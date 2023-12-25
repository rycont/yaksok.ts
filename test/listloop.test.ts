import { assertEquals, assertIsError, unreachable } from 'assert'
import { yaksok } from '../index.ts'
import { NotEnumerableValueForListLoopError } from '../error/index.ts'
import { CannotParseError } from '../error/prepare.ts'

Deno.test('Loop for list', () => {
    let printed = ''

    yaksok(
        `
무지개색:["빨강", "주황", "노랑", "초록", "파랑", "남색", "보라"]
반복 무지개색 의 색 마다
    # 아래 문장이 무지개색에 속한 색 마다 한번씩 실행됩니다.
    만약 색 = "파랑" 이면
        반복 그만
    색 보여주기    
`,
        {
            stdout: (message) => (printed += message + '\n'),
        },
    )

    assertEquals(
        printed,
        `빨강
주황
노랑
초록
`,
    )
})

Deno.test('Broken loop for not enumerable data', () => {
    try {
        yaksok(`
반복 3 의 숫자 마다
    숫자 보여주기
`)
        unreachable()
    } catch (e) {
        assertIsError(e, NotEnumerableValueForListLoopError)
    }
})

Deno.test('List Loop with broken body', () => {
    const code = `
반복 10 ~ 30 의 숫자 마다
    숫자 보여주 기
        `
    try {
        yaksok(code)
        unreachable()
    } catch (e) {
        assertIsError(e, CannotParseError)
    }
})
