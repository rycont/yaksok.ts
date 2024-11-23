import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../../src/mod.ts'
import {
    InvalidTypeForOperatorError,
    IndexOutOfRangeError,
    ListIndexError,
    NotEnumerableValueForListLoopError,
    RangeEndMustBeNumberError,
    RangeStartMustBeLessThanEndError,
    RangeStartMustBeNumberError,
    TargetIsNotIndexedValueError,
    ListIndexMustBeGreaterThan1Error,
} from '../../src/error/index.ts'

Deno.test('Error raised in loop', () => {
    try {
        yaksok(`
반복
    "Hello, world!" * "Hello, world!" 보여주기
`)
        unreachable()
    } catch (e) {
        assertIsError(e, InvalidTypeForOperatorError)
    }
})

Deno.test('Error raised in list loop', () => {
    try {
        yaksok(`
반복 [1, 2, 3]의 숫자 마다
    "Hello, world!" * "Hello, world!" 보여주기
`)
        unreachable()
    } catch (e) {
        assertIsError(e, InvalidTypeForOperatorError)
    }
})

Deno.test('Loop target is not enumerable', () => {
    try {
        yaksok(`
반복 10의 숫자 마다
    숫자 보여주기
`)
        unreachable()
    } catch (e) {
        assertIsError(e, NotEnumerableValueForListLoopError)
    }
})

Deno.test('Range start is less than end', () => {
    try {
        yaksok(`10 ~ 5`)
        unreachable()
    } catch (e) {
        assertIsError(e, RangeStartMustBeLessThanEndError)
    }
})

Deno.test('Range start must be number', () => {
    try {
        yaksok(`"Hello" ~ 5`)
        unreachable()
    } catch (e) {
        assertIsError(e, RangeStartMustBeNumberError)
    }
})

Deno.test('Range end must be number', () => {
    try {
        yaksok(`5 ~ "Hello"`)
        unreachable()
    } catch (e) {
        assertIsError(e, RangeEndMustBeNumberError)
    }
})

Deno.test('Index set target is must be indexable', () => {
    try {
        yaksok(`목록: 5
목록[1]: 10

목록 보여주기
`)
        unreachable()
    } catch (e) {
        assertIsError(e, TargetIsNotIndexedValueError)
    }
})

Deno.test('Index get target is must be indexable', () => {
    try {
        yaksok(`목록: 5
목록[2] 보여주기
`)
        unreachable()
    } catch (e) {
        assertIsError(e, TargetIsNotIndexedValueError)
    }
})

Deno.test('List out of range', () => {
    try {
        yaksok(`목록: [1, 2, 3]
목록[4] 보여주기
`)
        unreachable()
    } catch (e) {
        assertIsError(e, IndexOutOfRangeError)
    }
})

Deno.test('List index must be number', () => {
    try {
        yaksok(`목록: [1, 2, 3]
목록["Hello"] 보여주기
`)
        unreachable()
    } catch (e) {
        assertIsError(e, ListIndexError)
    }
})

Deno.test('List index must be integer', () => {
    try {
        yaksok(`목록: [1, 2, 3]
목록[1.5] 보여주기
`)
        unreachable()
    } catch (e) {
        console.log(e)
        assertIsError(e, ListIndexError)
    }
})

Deno.test('List index must bigger than 1', () => {
    try {
        yaksok(`목록: [1, 2, 3]
목록[0] 보여주기
`)
        unreachable()
    } catch (e) {
        assertIsError(e, ListIndexMustBeGreaterThan1Error)
    }
})
