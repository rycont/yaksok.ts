import { EvaluatablePiece, OperatorPiece } from './index.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'

export class BinaryCalculationPiece extends EvaluatablePiece {
    left: EvaluatablePiece
    right: EvaluatablePiece
    operator: OperatorPiece

    constructor(props: {
        left: EvaluatablePiece
        right: EvaluatablePiece
        operator: OperatorPiece
    }) {
        super()

        this.left = props.left
        this.right = props.right
        this.operator = props.operator
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        const { left, right, operator } = this

        const leftValue = left.execute(scope, callFrame)
        const rightValue = right.execute(scope, callFrame)

        return operator.call(leftValue, rightValue)
    }
}

export class ValueGroupPiece extends EvaluatablePiece {
    value: EvaluatablePiece

    constructor(props: { value: EvaluatablePiece }) {
        super()
        this.value = props.value
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        return this.value.execute(scope, callFrame)
    }
}
