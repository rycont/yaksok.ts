import { assertEquals } from 'assert'

import { tokenize } from '../tokenize.ts'
import { parse } from '../parser/index.ts'
import { run } from '../runtime.ts'
import { BooleanPiece, NumberPiece, StringPiece } from '../piece/index.ts'

Deno.test('Number to print', () => {
    const _consoleLog = console.log
    let printed = ''

    console.log = (...items) => (printed += items.join(' '))

    const code = `
나이: 20
나이 보여주기
`
    const result = run(parse(tokenize(code)))
    assertEquals(printed, '20')
    assertEquals(result.getVariable('나이'), new NumberPiece(20))
    assertEquals(result.getVariable('나이').toPrint(), '20')

    console.log = _consoleLog
})

Deno.test('String to print', () => {
    const _consoleLog = console.log
    let printed = ''

    console.log = (...items) => (printed += items.join(' '))

    const code = `
이름: "김철수"
이름 보여주기
`

    const result = run(parse(tokenize(code)))
    assertEquals(printed, '김철수')
    assertEquals(result.getVariable('이름'), new StringPiece('김철수'))
    assertEquals(result.getVariable('이름').toPrint(), '김철수')

    console.log = _consoleLog
})

Deno.test('Boolean to print', () => {
    const _consoleLog = console.log
    let printed = ''

    console.log = (...items) => (printed += items.join(' '))

    const code = `
가짜: 1 = 2
가짜 보여주기

진짜: 1 = 1
진짜 보여주기
`

    const result = run(parse(tokenize(code)))

    assertEquals(printed, '거짓참')

    assertEquals(result.getVariable('가짜'), new BooleanPiece(false))
    assertEquals(result.getVariable('가짜').toPrint(), '거짓')

    assertEquals(result.getVariable('진짜'), new BooleanPiece(true))
    assertEquals(result.getVariable('진짜').toPrint(), '참')

    console.log = _consoleLog
})
