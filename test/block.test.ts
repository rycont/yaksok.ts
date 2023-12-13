import { assertEquals, assertIsError, unreachable } from 'assert'
import { parse } from '../parser/index.ts'

import { run } from '../runtime.ts'
import { tokenize } from '../tokenize.ts'
import { YaksokError } from '../errors.ts'

Deno.test('Broken Blocks', () => {
    const code = `
값1: (10 * 2) + 10
값1 멋지게 보여주기
`

    try {
        run(parse(tokenize(code)))
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'CANNOT_PARSE')
    }
})
