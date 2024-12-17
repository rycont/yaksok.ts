import { assertIsError } from '@std/assert'
import { yaksok } from '../../core/mod.ts'
import { CannotParseError } from '../../core/error/index.ts'
import { UnexpectedCharError } from '../../core/error/prepare.ts'

Deno.test('Unparsable codes', async () => {
    try {
        await yaksok(`]]`)
    } catch (e) {
        assertIsError(e, CannotParseError)
    }
})

Deno.test('Unparsable numbers', async () => {
    try {
        await yaksok(`1.2.3`)
    } catch (e) {
        assertIsError(e, UnexpectedCharError)
    }
})
