import { assertEquals, assertIsError } from 'assert'
import { QuickJS } from '../bridge/quickjs/index.ts'
import { yaksok } from '../index.ts'
import { FFIResulTypeIsNotForYaksokError } from '../error/ffi.ts'
import { List } from '../node/list.ts'
import { StringValue } from '../node/index.ts'

const quickJS = new QuickJS({
    prompt: () => {
        return '10'
    },
})

await quickJS.init()

Deno.test('연결 문법을 사용하여 자바스크립트 함수 호출', () => {
    let output = ''
    yaksok(
        `
번역(QuickJS), (질문) 물어보기
***
    return prompt()
***

번역(QuickJS), (문자)를 숫자로 바꾸기
***
    return parseInt(문자, 10)
***

번역(QuickJS), (최소)와 (최대) 사이의 랜덤한 수
***
    return 7
***

먹고싶은_사과_수: (("사과 몇 개 먹고 싶어요?") 물어보기)를 숫자로 바꾸기
덤_사과_수: (1)와 (10) 사이의 랜덤한 수

먹고싶은_사과_수 + "개는 너무 적으니, " + 덤_사과_수 + "개 더 먹어서 " + (먹고싶은_사과_수 + 덤_사과_수) + "개 먹어야 겠어요." 보여주기
`,
        {
            runFFI(runtime, bodyCode, args) {
                if (runtime === 'QuickJS') {
                    const result = quickJS.run(bodyCode, args)
                    if (!result) {
                        throw new Error('Result is null')
                    }

                    return result
                }

                throw new Error(`Unknown runtime: ${runtime}`)
            },
            stdout(value) {
                output += value + '\n'
            },
        },
    )

    assertEquals(
        output,
        '10개는 너무 적으니, 7개 더 먹어서 17개 먹어야 겠어요.\n',
    )
})

Deno.test('다른 파일에 있는 연결 호출', () => {
    let output = ''
    yaksok(
        {
            유틸: `번역(QuickJS), (질문) 물어보기
***
    return "황선형"
***`,
            main: `
(@유틸 ("이름이 뭐에요?") 물어보기) 보여주기
            `,
        },
        {
            runFFI(runtime, bodyCode, args) {
                if (runtime === 'QuickJS') {
                    const result = quickJS.run(bodyCode, args)
                    if (!result) {
                        throw new Error('Result is null')
                    }

                    return result
                }

                throw new Error(`Unknown runtime: ${runtime}`)
            },
            stdout(value) {
                output += value + '\n'
            },
        },
    )

    assertEquals(output, '황선형\n')
})

Deno.test('배열을 반환하는 연결', () => {
    let output = ''
    yaksok(
        `
번역(QuickJS), (질문) 물어보기
***
CODES
***

(("이름이 뭐에요?") 물어보기) 보여주기`,
        {
            runFFI() {
                return new List([
                    new StringValue('황선형'),
                    new StringValue('도지석'),
                ])
            },
            stdout(value) {
                output += value + '\n'
            },
        },
    )

    assertEquals(output, '[황선형, 도지석]\n')
})

Deno.test('올바르지 않은 연결 반환값', () => {
    try {
        yaksok(
            `번역(mock), (질문) 물어보기
***
CODES
***
(("이름이 뭐에요?") 물어보기) 보여주기`,
            {
                runFFI(runtime) {
                    if (runtime === 'mock') {
                        return 'invalid value' as any
                    }

                    throw new Error(`Unknown runtime: ${runtime}`)
                },
            },
        )
    } catch (e) {
        assertIsError(e, FFIResulTypeIsNotForYaksokError)
    }
})

Deno.test('구현되지 않은 FFI', () => {
    try {
        yaksok(
            `번역(mock), (질문) 물어보기
***
CODES
***
(("이름이 뭐에요?") 물어보기) 보여주기`,
        )
    } catch (e) {
        assertIsError(e)
    }
})
