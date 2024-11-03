import { Evaluable, type ValueTypes } from './index.ts'

import type { Scope } from '../runtime/scope.ts'
import type { CallFrame } from '../runtime/callFrame.ts'

export abstract class IndexedValue extends Evaluable {
    abstract getItem(
        index: ValueTypes,
        scope: Scope,
        callFrame: CallFrame,
    ): ValueTypes
    abstract setItem(
        index: ValueTypes,
        value: ValueTypes,
        scope: Scope,
        callFrame: CallFrame,
    ): void
}
