import { assertEquals } from 'assert'
import { yaksok } from '../index.ts'

Deno.test('Fibonacci', () => {
    let printed = ''

    const code = `
약속, 피보나치 [수]
    만약 수 < 3 이면
        결과: 1
    아니면
        결과: (피보나치 [수 - 1]) + (피보나치 [수 - 2])

횟수: 1

반복
    횟수 + "번째 피보나치 수는 " + (피보나치 [횟수]) + "입니다" 보여주기
    횟수: 횟수 + 1

    만약 횟수 > 10 이면
        반복 그만
`
    yaksok(code, {
        stdout: (message) => (printed += message + '\n'),
    })
    assertEquals(
        printed,
        `1번째 피보나치 수는 1입니다
2번째 피보나치 수는 1입니다
3번째 피보나치 수는 2입니다
4번째 피보나치 수는 3입니다
5번째 피보나치 수는 5입니다
6번째 피보나치 수는 8입니다
7번째 피보나치 수는 13입니다
8번째 피보나치 수는 21입니다
9번째 피보나치 수는 34입니다
10번째 피보나치 수는 55입니다
`,
    )
})
