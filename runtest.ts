import { Runtime } from './src/runtime/index.ts'

const code = `
약속, (음식 10)을 맛있게 만들기
    음식 + "을/를 맛있게 만들었습니다." 보여주기
`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

runtime.run()
