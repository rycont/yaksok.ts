import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { EvaluatablePiece } from './index.ts'

export class PrimitiveValuePiece<T> extends EvaluatablePiece {
    value: T

    constructor(content: T) {
        super()
        this.value = content
    }

    execute(scope: Scope, _callFrame: CallFrame): PrimitiveValuePiece<T> {
        return this
    }
}

export class NumberPiece extends PrimitiveValuePiece<number> {
    toPrint() {
        return this.value.toString()
    }
}

export class StringPiece extends PrimitiveValuePiece<string> {
    toPrint() {
        return this.value
    }
}

export class BooleanPiece extends PrimitiveValuePiece<boolean> {
    toPrint() {
        return this.value ? '참' : '거짓'
    }
}
