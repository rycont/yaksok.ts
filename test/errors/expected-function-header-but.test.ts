import { assertIsError } from 'assert'
import { yaksok } from '../../src/mod.ts'
import {
    UnexpectedEndOfCodeError,
    UnexpectedTokenError,
} from '../../src/error/index.ts'

Deno.test('온전하지 않은 약속 정의', () => {
    try {
        yaksok(`약속, (A)와 (`)
    } catch (error) {
        assertIsError(error, UnexpectedEndOfCodeError)
    }
})

Deno.test('약속 정의 문법이 틀림', () => {
    try {
        yaksok(`약속, (A)와 (((((`)
    } catch (error) {
        console.log(error)
        assertIsError(error, UnexpectedTokenError)
    }
})

Deno.test('온전하지 않은 FFI 정의', () => {
    try {
        yaksok(`***`)
    } catch (error) {
        assertIsError(error, UnexpectedEndOfCodeError)
    }
})
