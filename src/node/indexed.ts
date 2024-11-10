import type { Scope } from '../executer/scope.ts'
import type { CallFrame } from '../executer/callFrame.ts'
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
