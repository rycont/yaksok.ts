import { assertIsError } from 'assert'
import { yaksok } from '../../src/mod.ts'
import { CannotParseError } from '../../src/error/index.ts'
import { UnexpectedCharError } from '../../src/error/prepare.ts'

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

Deno.test('Unparsable numbers', () => {
    try {
        yaksok(`1.2.3`)
    } catch (e) {
        assertIsError(e, UnexpectedCharError)
    }
})
