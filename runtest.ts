import { Runtime } from './src/runtime/index.ts'

const code = `나이: 10 + (20`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

runtime.run()
