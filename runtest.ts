import { QuickJS } from './bridge/quickjs/index.ts'
import { yaksok } from './index.ts'

const quickJS = new QuickJS({
    workingDirectory() {
        const cwd = Deno.cwd()
        return cwd
    },
})

await quickJS.init()

yaksok(
    `
번역(QuickJS), CWD
***
    return [workingDirectory()]
***

CWD 보여주기
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
    },
)
