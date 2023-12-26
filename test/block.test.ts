import { assertIsError, unreachable } from 'assert'

import { tokenize } from '../prepare/tokenize/index.ts'
import { _LEGACY__parse } from '../prepare/parse/index.ts'
import { CannotParseError } from '../error/index.ts'
import { run } from '../runtime/run.ts'

Deno.test('Broken Blocks', () => {
    const code = `
값1: (10 * 2) + 10
값1 멋지게 보여주기
`

    try {
        run(_LEGACY__parse(tokenize(code)))
        unreachable()
    } catch (e) {
        assertIsError(e, CannotParseError)
    }
})
