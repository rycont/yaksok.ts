import { FunctionParams } from './src/mod.ts'
import { NumberValue } from './src/mod.ts'
import { yaksok } from './src/mod.ts'

yaksok(
    `
번역(JavaScript), (A)와 (B) 사이 랜덤 수
***
    return Math.floor(Math.random() * (B - A) + A)
***

(1)와 (10) 사이 랜덤 수 보여주기
`,
    {
        runFFI: (runtime, code, params) => {
            if (runtime !== 'JavaScript') {
                throw new Error('지원하지 않는 런타임입니다')
            }

            const runnableCode = buildCodeFromCodeAndParams(code, params)
            const resultInJS = eval(runnableCode)

            if (typeof resultInJS !== 'number') {
                throw new Error('결과값은 숫자여야 합니다')
            }

            return new NumberValue(resultInJS)
        },
    },
)

function buildCodeFromCodeAndParams(code: string, params: FunctionParams) {
    const paramNames = Object.keys(params)
    const paramsInJS = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value.value]),
    )

    return `((${paramNames.join(', ')}) => {${code}})(${Object.values(
        paramsInJS,
    ).join(', ')})`
}
