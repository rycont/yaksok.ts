import { Runtime } from './src/runtime/index.ts'

const code = `번역(QuickJS), (질문) 물어보기
***
    return prompt()
***

약속, (문자열)을 말하기
    "싫어염" 보여주기
`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

runtime.run()
