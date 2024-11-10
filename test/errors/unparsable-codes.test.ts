import { assertIsError } from 'assert'
import { yaksok } from '../../src/mod.ts'
import { CannotParseError } from '../../src/error/index.ts'

Deno.test('Unparsable codes', () => {
    try {
        yaksok(
            `
        ]]
        `,
        )
    } catch (e) {
        assertIsError(e, CannotParseError)
    }
})
