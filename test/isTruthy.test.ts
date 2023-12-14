import { assertEquals } from 'assert'
import { parse } from '../parse/index.ts'

import { run } from '../runtime/run.ts'
import { _tokenize } from '../tokenize/index.ts'

Deno.test('isTruthy: Boolean True', () => {
    const code = `
만약 10 = 10이면
    값: "참"
아니면
    값: "거짓"
`
    const result = run(parse(_tokenize(code)))
    assertEquals(result.getVariable('값').value, '참')
})

Deno.test('isTruthy: Boolean False', () => {
    const code = `
만약 10 = 11이면
    값: "참"
아니면
    값: "거짓"
`
    const result = run(parse(_tokenize(code)))
    assertEquals(result.getVariable('값').value, '거짓')
})

Deno.test('isTruthy: Number True', () => {
    const code = `
만약 10이면
    값: "참"
아니면
    값: "거짓"
`
    const result = run(parse(_tokenize(code)))
    assertEquals(result.getVariable('값').value, '참')
})

Deno.test('isTruthy: Number False', () => {
    const code = `
만약 0이면
    값: "참"
아니면
    값: "거짓"
`
    const result = run(parse(_tokenize(code)))
    assertEquals(result.getVariable('값').value, '거짓')
})

Deno.test('isTruthy: String True', () => {
    const code = `
만약 "10"이면
    값: "참"
아니면
    값: "거짓"
`
    const result = run(parse(_tokenize(code)))
    assertEquals(result.getVariable('값').value, '참')
})

Deno.test('isTruthy: String True', () => {
    const code = `
만약 ""이면
    값: "참"
아니면
    값: "거짓"
`
    const result = run(parse(_tokenize(code)))
    assertEquals(result.getVariable('값').value, '거짓')
})

Deno.test('isTruthy: List True', () => {
    const code = `
만약 ["하나", "둘", "셋"]이면
    값: "참"
아니면
    값: "거짓"
`
    console.log(parse(_tokenize(code)))
    const result = run(parse(_tokenize(code)))
    assertEquals(result.getVariable('값').value, '참')
})
