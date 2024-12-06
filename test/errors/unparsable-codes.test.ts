import { assertIsError } from 'assert'
import { yaksok } from '../../src/mod.ts'
import { CannotParseError } from '../../src/error/index.ts'

Deno.test('Unparsable codes', async () => {
    try {
        await yaksok(
            `
        ]]
        `,
        )
    } catch (e) {
        assertIsError(e, CannotParseError)
    }
})
