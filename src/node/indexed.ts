import type { Scope } from '../runtime/scope.ts'
import type { CallFrame } from '../runtime/callFrame.ts'
import { Evaluable, type ValueTypes } from './base.ts'

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
