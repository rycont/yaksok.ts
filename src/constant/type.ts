import { ValueType } from '../value/base.ts'

/**
 * 번역(FFI)에 전달되는 인자 타입
 */
export interface FunctionParams {
    [key: string]: ValueType
}
