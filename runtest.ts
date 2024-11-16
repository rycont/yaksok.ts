import { Runtime } from './src/runtime/index.ts'

const code = `
약속, (음식)을/를 (사람)와/과 먹기
    "진짜요" 보여주기
`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

runtime.run()
