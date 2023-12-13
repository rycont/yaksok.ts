import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { EvaluatablePiece, ValueTypes } from './index.ts'

export abstract class IndexedValuePiece extends EvaluatablePiece {
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
