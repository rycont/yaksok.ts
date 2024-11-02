import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../index.ts'
import {
    InvalidTypeForCompareError,
    InvalidTypeForOperatorError,
} from '../error/index.ts'

const WRONG_CASES_FOR_CALCULATION = [
    {
        a: "'홍길동'",
        b: "'홍길동'",
        operator: '*',
    },
    {
        a: "'홍길동'",
        b: 10,
        operator: '/',
    },
    {
        a: "'홍길동'",
        b: 10,
        operator: '//',
    },
    {
        a: "'홍길동'",
        b: 10,
        operator: '-',
    },
    {
        a: 10,
        b: "'홍길동'",
        operator: '-',
    },
    {
        a: "'홍길동'",
        b: "'지민'",
        operator: '**',
    },
    {
        a: "'홍길동'",
        b: 10,
        operator: '**',
    },
    {
        a: "'홍길동'",
        b: '[1, 2, 3]',
        operator: '+',
    },
    {
        a: "'홍길동'",
        b: 10,
        operator: '이고',
    },
    {
        a: 10,
        b: "'홍길동'",
        operator: '거나',
    },
    {
        a: "'홍길동'",
        b: 10,
        operator: '%',
    },
]

const WRONG_CASES_FOR_COMPARISON = [
    {
        a: "'홍길동'",
        b: 10,
        operator: '<',
    },
    {
        a: 10,
        b: "'홍길동'",
        operator: '<',
    },
    {
        a: "'홍길동'",
        b: 10,
        operator: '>',
    },
    {
        a: 10,
        b: "'홍길동'",
        operator: '>',
    },
    {
        a: "'홍길동'",
        b: 10,
        operator: '<=',
    },
    {
        a: 10,
        b: "'홍길동'",
        operator: '<=',
    },
    {
        a: "'홍길동'",
        b: 10,
        operator: '>=',
    },
    {
        a: 10,
        b: "'홍길동'",
        operator: '>=',
    },
]

for (const { a, b, operator } of WRONG_CASES_FOR_CALCULATION) {
    Deno.test(`Invalid type for calculation operator ${operator}`, () => {
        const code = `
            ${a} ${operator} ${b}
        `
        try {
            yaksok(code)
            unreachable()
        } catch (error) {
            assertIsError(error, InvalidTypeForOperatorError)
        }
    })
}

for (const { a, b, operator } of WRONG_CASES_FOR_COMPARISON) {
    Deno.test(`Invalid type for comparison operator ${operator}`, () => {
        const code = `
            ${a} ${operator} ${b}
        `
        try {
            yaksok(code)
            unreachable()
        } catch (error) {
            assertIsError(error, InvalidTypeForCompareError)
        }
    })
}
