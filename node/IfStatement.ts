import { Executable, Evaluable } from './base.ts'
import { Block } from './block.ts'

import { isTruthy } from '../runtime/internal/isTruthy.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'

interface Case {
    condition?: Evaluable
    body: Block
}

export class IfStatement extends Executable {
    constructor(public cases: Case[]) {
        super()
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        for (const { condition, body } of this.cases) {
            if (!condition || isTruthy(condition.execute(scope, callFrame))) {
                body.execute(scope, callFrame)
                break
            }
        }
    }
}

export class ElseStatement extends Executable {
    constructor(public body: Block) {
        super()
    }
}

export class ElseIfStatement extends Executable {
    constructor(public elseIfCase: Case) {
        super()
    }
}
