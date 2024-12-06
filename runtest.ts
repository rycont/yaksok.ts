import { yaksok } from '@yaksok-ts/core'
import { NumberValue } from './src/node/primitive.ts'

console.time('실행')

await yaksok(
    `
번역(Runtime), (숫자)초 기다리기
***
wait
***

"안녕!" 보여주기
1초 기다리기
"반가워!" 보여주기
`,
    {
        async runFFI(_runtime, _code, args) {
            await new Promise((ok) =>
                setTimeout(ok, (args.숫자 as NumberValue).value * 1000),
            )

            return new NumberValue(0)
        },
    },
)
console.timeEnd('실행')
