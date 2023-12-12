import { EvaluatablePiece, OperatorPiece, ValueTypes } from './index.ts'
import { CallFrame, Scope } from '../scope.ts'

const precedence: Array<string[]> = [
    [], // 0 (safety area)
    ['=', '<', '>', '<=', '>='], // 1
    ['-', '+'], // 2
    ['*', '/'], // 3
]

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

    getPieceArray(
        scope: Scope,
        _callFrame: CallFrame,
    ): Array<EvaluatablePiece | OperatorPiece> {
        const { left, right, operator } = this
        let leftValue: Array<EvaluatablePiece | OperatorPiece>
        let rightValue: Array<EvaluatablePiece | OperatorPiece>

        if (left instanceof BinaryCalculationPiece) {
            leftValue = left.getPieceArray(scope, _callFrame)
        } else {
            leftValue = [left]
        }

        if (right instanceof BinaryCalculationPiece) {
            rightValue = right.getPieceArray(scope, _callFrame)
        } else {
            rightValue = [right]
        }

        return [...leftValue, operator, ...rightValue]
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const underPieces = this.getPieceArray(scope, callFrame)

        let targetPrecedence = precedence.length - 1

        while (underPieces.length > 1) {
            for (let i = 0; i < underPieces.length; i++) {
                const piece = underPieces[i]
                if (!(piece instanceof OperatorPiece)) continue
                let currentPrecedence = precedence.findIndex((p) => {
                    return p.includes((piece as OperatorPiece).value)
                })
                if (currentPrecedence === -1) currentPrecedence = 0

                if (targetPrecedence === currentPrecedence) {
                    const left = underPieces[i - 1] as EvaluatablePiece
                    const right = underPieces[i + 1] as EvaluatablePiece
                    const operator = piece as OperatorPiece

                    const leftValue = left.execute(scope, callFrame)
                    const rightValue = right.execute(scope, callFrame)

                    const result = operator.call(leftValue, rightValue)

                    underPieces.splice(i - 1, 3, result)

                    i--
                }
            }
            targetPrecedence--
        }

        return underPieces[0] as ValueTypes
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
