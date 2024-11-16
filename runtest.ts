import { Runtime } from './src/runtime/index.ts'

const code = `***`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

runtime.run()
