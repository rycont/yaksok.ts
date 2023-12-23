import { assertEquals, assertIsError, unreachable } from 'assert'
import { yaksok } from '../index.ts'
import { NotEnumerableValueForListLoopError } from '../errors/index.ts'

Deno.test('Loop for list', () => {
    const _consoleLog = console.log
    let printed = ''

    console.log = (...items) => (printed += items.join(' ') + '\n')
    yaksok(`
무지개색:["빨강", "주황", "노랑", "초록", "파랑", "남색", "보라"]
반복 무지개색 의 색 마다
    # 아래 문장이 무지개색에 속한 색 마다 한번씩 실행됩니다.
    만약 색 = "파랑" 이면
        반복 그만
    색 보여주기    
`)
    console.log = _consoleLog

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
