import type { Evaluable } from '../node/base.ts'

export interface FunctionParams {
    [key: string]: Evaluable
}
