import { yaksok, ListIndexTypeError } from '@yaksok-ts/core'
import { assertIsError, unreachable } from '@std/assert'

Deno.test('Key for list fancy indexing is not a number', async () => {
    try {
        await yaksok(`
목록: [1, 2, 3]
목록[[3, "a"]] 보여주기`)
        unreachable()
    } catch (e) {
        assertIsError(e, ListIndexTypeError)
    }
})
