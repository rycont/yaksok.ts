import { isTruthy } from '../internal/isTruthy.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Executable, Evaluable } from './base.ts'
import { Block } from './block.ts'

export class IfStatement extends Executable {
    condition: Evaluable
    ifBody: Block
    elseBody?: Block

    constructor(
        props:
            | { condition: Evaluable; body: Block }
            | {
                  ifBody: IfStatement
                  elseBody: Block
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
