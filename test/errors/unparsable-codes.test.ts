import { assertIsError } from 'assert'
import { yaksok } from '../../index.ts'
import { CannotParseError } from '../../error/index.ts'

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
