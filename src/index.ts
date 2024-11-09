import type { ValueTypes } from '../src/node/base.ts'

import { EnabledFlags } from './contant/feature-flags.ts'
import { Runtime } from './runtime/index.ts'
import { FunctionParams } from './contant/type.ts'
import { DEFAULT_RUNTIME_CONFIG } from './runtime/env-config.ts'

interface YaksokConfig {
    stdout: (message: string) => void
    stderr: (message: string) => void
    entryPoint: string
    runFFI: (runtime: string, code: string, args: FunctionParams) => ValueTypes
    flags: EnabledFlags
}

export function yaksok(
    code: string | Record<string, string>,
    config: Partial<YaksokConfig> = {},
): Runtime {
    const yaksok = new Runtime(
        typeof code === 'string'
            ? {
                  [DEFAULT_RUNTIME_CONFIG.entryPoint]: code,
              }
            : code,
        config,
    )

    yaksok.run()
    return yaksok
}

export * from '../src/prepare/tokenize/index.ts'
export * from '../src/prepare/parse/index.ts'
