import { assertEquals } from 'assert'

import { BooleanValue } from '../node/index.ts'
import { yaksok } from '../index.ts'

Deno.test('Number to print', () => {
    let printed = ''

    const code = `
나이: 20
나이 보여주기
`
    const result = yaksok(code, {
        stdout: (message) => (printed += message + '\n'),
    })
    assertEquals(printed, '20\n')
    assertEquals(result.getVariable('나이').value, 20)
    assertEquals(result.getVariable('나이').toPrint(), '20')
})

Deno.test('String to print', () => {
    let printed = ''

    const code = `
이름: "김철수"
이름 보여주기
`

    const result = yaksok(code, {
        stdout: (message) => (printed += message + '\n'),
    })
    assertEquals(printed, '김철수\n')
    assertEquals(result.getVariable('이름').value, '김철수')
    assertEquals(result.getVariable('이름').toPrint(), '김철수')
})

Deno.test('Boolean to print', () => {
    let printed = ''

    const code = `
가짜: 1 = 2
가짜 보여주기

진짜: 1 = 1
진짜 보여주기
`

    const result = yaksok(code, {
        stdout: (message) => (printed += message + '\n'),
    })

    assertEquals(printed, '거짓\n참\n')

    assertEquals(result.getVariable('가짜'), new BooleanValue(false))
    assertEquals(result.getVariable('가짜').toPrint(), '거짓')

    assertEquals(result.getVariable('진짜'), new BooleanValue(true))
    assertEquals(result.getVariable('진짜').toPrint(), '참')
})
