import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Evaluable, ValueTypes } from './index.ts'

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
