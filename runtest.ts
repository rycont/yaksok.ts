import { StringValue, yaksok } from '@yaksok-ts/core'

yaksok(
    `
번역(QuickJS), (질문) 물어보기
***
    return prompt(질문)
***

입력받은_이름: "이름이 뭐에요?" 물어보기
(입력받은_이름 + "님 안녕하세요!") 보여주기
`,
    {
        async runFFI(r, code, args) {
            await new Promise((ok) => setTimeout(ok, 3000))
            return new StringValue('아 진짜요?')
        },
    },
)
