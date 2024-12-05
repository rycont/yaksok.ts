import { QuickJS } from '@yaksok-ts/quickjs'
import { yaksok } from '@yaksok-ts/core'

const quickjs = new QuickJS({
    prompt,
})
await quickjs.init()

yaksok(
    `
번역(QuickJS), (질문) 물어보기
***
    return prompt(질문)
***

입력받은_이름: "이름이 뭐에요?" 물어보기
입력받은_이름 + "님 안녕하세요!" 보여주기
`,
    {
        runFFI(r, code, args) {
            const result = quickjs.run(code, args)
            return result
        },
    },
)
