import { assertIsError } from 'assert'
import { yaksok } from '../../src/mod.ts'
import {
    ErrorInModuleError,
    FileForRunNotExistError,
} from '../../src/error/index.ts'

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

Deno.test('Error in importing module', () => {
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

Deno.test('Error in using module function', () => {
    try {
        yaksok({
            아두이노: `
약속, 이름
    결과: "아두이노" / 2
`,
            main: '(@아두이노 이름) 보여주기',
        })
    } catch (error) {
        assertIsError(error, ErrorInModuleError)
    }
})
