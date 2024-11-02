import { assert, assertIsError, unreachable } from 'assert'
import { yaksok } from '../index.ts'
import {
    InvalidTypeForCompareError,
    InvalidTypeForOperatorError,
} from '../error/index.ts'

const WRONG_CASES_FOR_CALCULATION = [
    {
        // Cannot multiply string and string
        a: "'홍길동'",
        b: "'홍길동'",
        operator: '*',
    },
    {
        // Cannot divide string and string
        a: "'홍길동'",
        b: 10,
        operator: '/',
    },
    {
        // Cannot divide string and string
        a: "'홍길동'",
        b: 10,
        operator: '//',
    },
    {
        // Cannot subtract string and string
        a: "'홍길동'",
        b: 10,
        operator: '-',
    },
    {
        // Cannot subtract string and number
        a: 10,
        b: "'홍길동'",
        operator: '-',
    },
    {
        // Cannot power string and string
        a: "'홍길동'",
        b: "'지민'",
        operator: '**',
    },
    {
        // Cannot power string and number
        a: "'홍길동'",
        b: 10,
        operator: '**',
    },
    {
        // Cannot add string and list
        a: "'홍길동'",
        b: '[1, 2, 3]',
        operator: '+',
    },
    {
        // Cannot compare(and) string and number
        a: "'홍길동'",
        b: 10,
        operator: '이고',
    },
    {
        // Cannot compare(or) number and string
        a: 10,
        b: "'홍길동'",
        operator: '거나',
    },
    {
        // Cannot modular string and number
        a: "'홍길동'",
        b: 10,
        operator: '%',
    },
]

const WRONG_CASES_FOR_COMPARISON = [
    {
        // Cannot compare(less) string and number
        a: "'홍길동'",
        b: 10,
        operator: '<',
    },
    {
        // Cannot compare(less) number and string
        a: 10,
        b: "'홍길동'",
        operator: '<',
    },
    {
        // Cannot compare(more) string and number
        a: "'홍길동'",
        b: 10,
        operator: '>',
    },
    {
        // Cannot compare(more) number and string
        a: 10,
        b: "'홍길동'",
        operator: '>',
    },
    {
        // Cannot compare(less or equal) string and number
        a: "'홍길동'",
        b: 10,
        operator: '<=',
    },
    {
        // Cannot compare(less or equal) number and string
        a: 10,
        b: "'홍길동'",
        operator: '<=',
    },
    {
        // Cannot compare(more or equal) string and number
        a: "'홍길동'",
        b: 10,
        operator: '>=',
    },
    {
        // Cannot compare(more or equal) number and string
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
