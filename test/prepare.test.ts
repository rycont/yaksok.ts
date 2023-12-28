import { assertIsError, unreachable } from 'assert'
import { yaksok } from '../index.ts'
import { FileForRunNotExistError } from '../error/prepare.ts'

Deno.test('Entry Point Not Exist', () => {
    try {
        yaksok({
            submodule1: `
"반가워요" 보여주기
`,
            submodule2: `
"저도요" 보여주기
`,
        })
        unreachable()
    } catch (error) {
        assertIsError(error, FileForRunNotExistError)
    }
})

Deno.test('No file to run', () => {
    try {
        yaksok({})
        unreachable()
    } catch (error) {
        assertIsError(error, FileForRunNotExistError)
    }
})
