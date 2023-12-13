import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Piece, ExecutablePiece, EvaluatablePiece } from './basement.ts'

export class EOLPiece extends Piece {}

export class IndentPiece extends Piece {
    size: number
    constructor(size: number) {
        super()
        this.size = size
    }
}

export class PrintPiece extends ExecutablePiece {
    value: EvaluatablePiece

    constructor(props: { value: EvaluatablePiece }) {
        super()
        this.value = props.value
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        console.log(this.value.execute(scope, _callFrame).toPrint())
    }
}
