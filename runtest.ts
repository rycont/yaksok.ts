import { Runtime } from './src/runtime/index.ts'

const code = `약속, (A)와 (B)를 더하기
축하하기`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

runtime.run()
