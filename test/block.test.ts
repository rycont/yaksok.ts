import { assertIsError, unreachable } from 'assert'

import { CannotParseError } from '../error/index.ts'
import { yaksok } from '../index.ts'

Deno.test('Broken Blocks', () => {
    const code = `
값1: (10 * 2) + 10
값1 멋지게 보여주기
`

    try {
        yaksok(code)
        unreachable()
    } catch (e) {
        assertIsError(e, CannotParseError)
    }
})
