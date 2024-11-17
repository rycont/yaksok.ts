import { assertIsError } from 'assert'
import { yaksok } from '../../src/mod.ts'
import { UnexpectedTokenError } from '../../src/error/index.ts'
import { UnexpectedEndOfCodeError } from '../../src/error/prepare.ts'

Deno.test('온전하지 않은 약속: 줄바꿈 후에 들여쓰기 없음', () => {
    try {
        yaksok(`약속, (A)와 (B)를 더하기
축하하기`)
    } catch (error) {
        assertIsError(error, UnexpectedTokenError)
        console.log(error)
    }
})

Deno.test('온전하지 않은 약속: 줄 바꾸고 코드가 끝남', () => {
    try {
        yaksok(`약속, (A)와 (B)를 더하기
`)
    } catch (error) {
        assertIsError(error, UnexpectedEndOfCodeError)
        console.log(error)
    }
})

Deno.test('온전하지 않은 번역: 줄바꿈 후에 들여쓰기 없음', () => {
    try {
        yaksok(`번역(Runtime), (A)를 출력하기
축하하기`)
    } catch (error) {
        assertIsError(error, UnexpectedTokenError)
        console.log(error)
    }
})

Deno.test('온전하지 않은 번역: 줄 바꾸고 코드가 끝남', () => {
    try {
        yaksok(`번역(Runtime), (A)랄까 고민하기
`)
    } catch (error) {
        assertIsError(error, UnexpectedEndOfCodeError)
        console.log(error)
    }
})
