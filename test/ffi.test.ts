import { assertEquals, assertIsError, unreachable } from 'assert'

import { FFIResulTypeIsNotForYaksokError } from '../error/ffi.ts'
import { yaksok } from '../index.ts'
import { NumberValue, StringValue } from '../node/index.ts'

Deno.test('FFI Calling', () => {
    const code = `
번역(plaintext) "한바탕" 횟수 "번 웃기"
***와하하***

한바탕 5번 웃기
`
    yaksok(
        {
            main: code,
        },
        {
            runFFI: (runtime, code, args) => {
                assertEquals(runtime, 'plaintext')
                assertEquals(code, '와하하')
                assertEquals(args.횟수.value, 5)

                return new NumberValue(5)
            },
        },
    )
})

Deno.test('Get result from JavaScript adapter', () => {
    const code = `
번역(javascript) "한바탕" 횟수 "번 웃기"
***
    return "와" + "하".repeat(횟수) + "하"
***

한바탕 10번 웃기 보여주기
`
    let stdout = ''

    yaksok(code, {
        runFFI: (runtime, code, args) => {
            assertEquals(runtime, 'javascript')
            assertEquals(args.횟수.value, 10)
            assertEquals(
                code,
                `
    return "와" + "하".repeat(횟수) + "하"
`,
            )

            const result = new Function(...Object.keys(args), code)(
                ...Object.values(args).map((v) => v.value),
            )

            return new StringValue(result)
        },
        stdout: (text) => (stdout += text + '\n'),
    })

    assertEquals(stdout, '와하하하하하하하하하하하\n')
})

Deno.test('Got result is not a primitive value, but a JS number', () => {
    const code = `
번역(javascript) "한바탕" 횟수 "번 웃기"
***
    return "와" + "하".repeat(횟수) + "하"
***

한바탕 10번 웃기
`

    try {
        yaksok(code, {
            runFFI: () => {
                return 10 as unknown as NumberValue
            },
        })
        unreachable()
    } catch (e) {
        assertIsError(e, FFIResulTypeIsNotForYaksokError)
    }
})

Deno.test('Got result is not a primitive value, but a JS string', () => {
    const code = `
번역(javascript) "한바탕" 횟수 "번 웃기"
***
    return "와" + "하".repeat(횟수) + "하"
***

한바탕 10번 웃기
`

    try {
        yaksok(code, {
            runFFI: () => {
                return '예?' as unknown as NumberValue
            },
        })
        unreachable()
    } catch (e) {
        assertIsError(e, FFIResulTypeIsNotForYaksokError)
    }
})

Deno.test('Got result is not a primitive value, but a JS object', () => {
    const code = `
번역(javascript) "한바탕" 횟수 "번 웃기"
***
    return "와" + "하".repeat(횟수) + "하"
***

한바탕 10번 웃기
`

    try {
        yaksok(code, {
            runFFI: () => {
                return { message: '네??' } as unknown as NumberValue
            },
        })
        unreachable()
    } catch (e) {
        assertIsError(e, FFIResulTypeIsNotForYaksokError)
    }
})
