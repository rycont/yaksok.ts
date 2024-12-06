import type { EnabledFlags } from '../constant/feature-flags.ts'
import type { FunctionParams } from '../constant/type.ts'
import type { ValueTypes } from '../node/base.ts'

/**
 * RuntimeConfig 객체를 사용하여 약속 런타임을 설정합니다.
 *
 * ```typescript
 * import { yaksok, RuntimeConfig } from '@yaksok-ts/core'
 *
 * const runtimeConfig: RuntimeConfig = { // [!code highlight]
 *    stdout: console.log, // [!code highlight]
 *    stderr: console.error, // [!code highlight]
 * } // [!code highlight]
 *
 * yaksok(`"안녕" 보여주기`, runtimeConfig)
 * ```
 */

export interface RuntimeConfig {
    /**
     * @default console.log
     * @param message `보여주기`에서 전달된 메시지
     */
    stdout: (message: string) => void
    /**
     * @default console.error
     * @param message 오류로 인해 발생한 메시지
     */
    stderr: (message: string) => void
    /**
     * @default 'main'
     * @param entryPoint 시작할 파일 이름
     */
    entryPoint: string
    /**
     * @param runtime 런타임 이름
     * @param code 실행할 코드
     * @param args 함수 인자
     * @returns 함수 실행 결과
     */
    runFFI: (runtime: string, code: string, args: FunctionParams) => ValueTypes | Promise<ValueTypes>
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
