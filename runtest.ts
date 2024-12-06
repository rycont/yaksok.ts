import { yaksok } from '@yaksok-ts/core'
import { QuickJS } from '@yaksok-ts/quickjs'

console.time('실행')

const quickJS = new QuickJS()
await quickJS.init()

await yaksok(
    `
번역(QuickJS), 랜덤 수
***
return 20
***

숫자: 랜덤 수
숫자 보여주기
    `,
    {
        async runFFI(_, code, args) {
            const result = quickJS.run(code, args)

            await new Promise((ok) => setTimeout(ok, 1000))

            if (!result) {
                throw new Error('Result is null')
            }

            return result
        },
    },
)

console.timeEnd('실행')
