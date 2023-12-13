import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { IndexedValuePiece } from './indexed.ts'
import {
    NumberPiece,
    StringPiece,
    BooleanPiece,
    PrimitiveValuePiece,
} from './primitive.ts'

export class Piece {
    [key: string]: unknown
    toJSON() {
        return {
            type: this.constructor.name,
            ...this,
        }
    }
}
export class ExecutablePiece extends Piece {
    execute(scope: Scope, callFrame: CallFrame) {
        throw new Error(`${this.constructor.name} has no execute method`)
    }
    toPrint(): string {
        throw new Error(`${this.constructor.name} has no toPrint method`)
    }
}

export class EvaluatablePiece extends ExecutablePiece {
    execute(scope: Scope, callFrame: CallFrame): ValueTypes {
        throw new Error(`${this.constructor.name} has no execute method`)
    }
}

export class KeywordPiece extends Piece {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }
}

export class OperatorPiece extends Piece {
    value?: string

    constructor(char?: string) {
        super()
        this.value = char
    }

    call(...operands: ValueTypes[]): ValueTypes {
        throw new Error(`${this.constructor.name} has no call method`)
    }
}

export class ExpressionPiece extends Piece {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }
}

export type PrimitiveTypes = NumberPiece | StringPiece | BooleanPiece
export type ValueTypes = PrimitiveValuePiece<unknown> | IndexedValuePiece
