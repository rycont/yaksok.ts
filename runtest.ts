import { QuickJS } from '@yaksok-ts/quickjs'
import { yaksok } from '@yaksok-ts/core'

const quickJS = new QuickJS()
await quickJS.init()

const result = yaksok(
    `
번역(QuickJS), 랜덤 수
***
    return 20
***

숫자: 랜덤 수
        `,
    {
        runFFI(_, code, args) {
            const result = quickJS.run(code, args)

            if (!result) {
                throw new Error('Result is null')
            }

            return result
        },
    },
)

console.log(result.getFileRunner().scope.getVariable('숫자'))
