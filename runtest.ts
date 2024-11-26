import { QuickJS } from '@yaksok-ts/quickjs'
import { yaksok, type ValueType } from '@yaksok-ts/core'

const quickJS = new QuickJS()
await quickJS.init()

const code = `
번역(QuickJS), (최소)와 (최대) 사이의 랜덤한 수
***
    return Math.floor(Math.random() * (최대 - 최소 + 1)) + 최소
***

(1)와 (10) 사이의 랜덤한 수 보여주기
`

function runFFI(
    runtime: string,
    code: string,
    params: Record<string, ValueType>,
) {
    if (runtime !== 'QuickJS') {
        throw new Error(`Unknown runtime: ${runtime}`)
    }

    const result = quickJS.run(code, params)

    if (!result) {
        throw new Error('Result is null')
    }

    return result
}

yaksok(code, { runFFI })
