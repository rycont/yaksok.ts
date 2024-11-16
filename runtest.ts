import { Runtime } from './src/runtime/index.ts'

const code = `약속, (A)와 (`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

runtime.run()
