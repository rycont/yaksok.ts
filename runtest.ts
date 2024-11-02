import { QuickJS, yaksok } from './index.ts'

const quickJS = new QuickJS({
    prompt: () => {
        return '10'
    },
})

await quickJS.init()

yaksok(
    `
번역(QuickJS), 에러 발생
***
    return ("ㅁㄴㅇㄹ" as string) */ 10
***

에러 발생
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
