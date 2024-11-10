import { FunctionParams } from './src/mod.ts'
import { StringValue } from './src/mod.ts'
import { NumberValue } from './src/mod.ts'
import { yaksok } from './src/mod.ts'

function runFFI(runtime: string, code: string, params: FunctionParams) {
    const payload = JSON.parse(code)

    if (payload.action === 'getUserAgent') {
        return new StringValue(navigator.userAgent)
    }
}

const code = `
번역(JavaScript), 브라우저의 UserAgent 가져오기
***
{
    "action": "getUserAgent"
}
***

브라우저의 UserAgent 가져오기 보여주기
`

yaksok(code, { runFFI })
