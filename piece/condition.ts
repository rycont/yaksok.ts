import { isTruthy } from '../internal/isTruthy.ts'
import { Scope, CallFrame } from '../scope.ts'
import { ExecutablePiece, EvaluatablePiece } from './basement.ts'
import { BlockPiece } from './block.ts'

export class ConditionPiece extends ExecutablePiece {
    condition: EvaluatablePiece
    ifBody: BlockPiece
    elseBody?: BlockPiece

    constructor(
        props:
            | { condition: EvaluatablePiece; body: BlockPiece }
            | {
                  ifBody: ConditionPiece
                  elseBody: BlockPiece
              },
    ) {
        super()

        if ('ifBody' in props) {
            this.condition = props.ifBody.condition
            this.ifBody = props.ifBody.ifBody
            this.elseBody = props.elseBody
        } else {
            this.condition = props.condition
            this.ifBody = props.body
        }
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        const { condition, ifBody: body } = this

        if (isTruthy(condition.execute(scope, callFrame))) {
            body.execute(scope, callFrame)
        } else {
            if (this.elseBody) {
                this.elseBody.execute(scope, callFrame)
            }
        }
    }
}
