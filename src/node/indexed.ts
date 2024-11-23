import type { Scope } from '../executer/scope.ts'
import type { CallFrame } from '../executer/callFrame.ts'
import { Evaluable } from './base.ts'
import { ValueType } from '../value/index.ts'

export abstract class IndexedValue extends Evaluable {
    static override friendlyName = '인덱스가 있는 값'

    abstract getItem(
        index: ValueType,
        scope: Scope,
        callFrame: CallFrame,
    ): ValueType
    abstract setItem(
        index: ValueType,
        value: ValueType,
        scope: Scope,
        callFrame: CallFrame,
    ): void
}
