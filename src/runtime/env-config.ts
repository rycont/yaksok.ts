import type { EnabledFlags } from '../constant/feature-flags.ts'
import type { FunctionParams } from '../constant/type.ts'
import type { ValueTypes } from '../node/base.ts'

export interface RuntimeConfig {
    stdout: (message: string) => void
    stderr: (message: string) => void
    entryPoint: string
    runFFI: (runtime: string, code: string, args: FunctionParams) => ValueTypes
    flags: EnabledFlags
}

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
    stdout: console.log,
    stderr: console.error,
    entryPoint: 'main',
    runFFI: (runtime: string) => {
        throw new Error(`FFI ${runtime} not implemented`)
    },
    flags: {},
}
