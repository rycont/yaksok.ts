import { assertIsError } from 'assert'
import { yaksok } from '../../index.ts'
import {
    ErrorInModuleError,
    FileForRunNotExistError,
    InvalidTypeForOperatorError,
} from '../../error/index.ts'

Deno.test('Cannot find entry point in files', () => {
    try {
        yaksok({
            dummy1: '',
            dummy2: '',
        })
    } catch (error) {
        assertIsError(error, FileForRunNotExistError)
    }
})

Deno.test('No files to run', () => {
    try {
        yaksok({})
    } catch (error) {
        assertIsError(error, FileForRunNotExistError)
    }
})

Deno.test('Error in module', () => {
    try {
        yaksok({
            아두이노: `
이름: "아두이노" / 2
`,
            main: '(@아두이노 이름) 보여주기',
        })
    } catch (error) {
        assertIsError(error, ErrorInModuleError)
    }
})
