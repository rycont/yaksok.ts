import type { Scope } from '../executer/scope.ts'
import type { CallFrame } from '../executer/callFrame.ts'
import { Evaluable, type ValueTypes } from './base.ts'

export abstract class IndexedValue extends Evaluable {
    static override friendlyName = '인덱스가 있는 값'

    abstract getItem(
        index: ValueTypes,
        scope: Scope,
        callFrame: CallFrame,
    ): Promise<ValueTypes>

    abstract setItem(
        index: ValueTypes,
        value: ValueTypes,
        scope: Scope,
        callFrame: CallFrame,
    ): Promise<void>
}
