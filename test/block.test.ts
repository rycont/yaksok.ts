import { assertEquals, assertIsError, unreachable } from 'assert'
import { parse } from '../parse/index.ts'

import { run } from '../runtime/run.ts'
import { _tokenize } from '../tokenize/index.ts'
import { YaksokError } from '../errors.ts'

Deno.test('Broken Blocks', () => {
    const code = `
값1: (10 * 2) + 10
값1 멋지게 보여주기
`

    try {
        run(parse(_tokenize(code)))
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'CANNOT_PARSE')
    }
})
