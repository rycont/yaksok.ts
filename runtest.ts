import { yaksok } from './index.ts'
import { NumberValue, StringValue } from './node/primitive.ts'

yaksok(
    {
        main: `
번역(javascript) 숫자1"와/과" 숫자2 "사이의 랜덤 수"
***
    return Math.floor(Math.random() * (숫자2 - 숫자1 + 1)) + 숫자1
***

10과 20 사이의 랜덤 수 보여주기
`,
    },
    {
        runFFI: (runtime, code, args) => {
            if (runtime !== 'javascript') {
                throw new Error('Not implemented')
            }

            const argKeys = Object.keys(args)
            const unpackedArgValues = argKeys.map((key) => args[key].value)

            const result = new Function(...argKeys, code)(...unpackedArgValues)

            if (typeof result === 'number') {
                return new NumberValue(result)
            }

            if (typeof result === 'string') {
                return new StringValue(result)
            }

            throw new Error('Not implemented')
        },
    },
)
