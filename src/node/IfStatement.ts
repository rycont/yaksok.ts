import { Executable, type Evaluable } from './base.ts'
import type { Block } from './block.ts'

import { isTruthy } from '../runtime/internal/isTruthy.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import type { Scope } from '../runtime/scope.ts'

interface Case {
    condition?: Evaluable
    body: Block
}

export class IfStatement extends Executable {
    constructor(public cases: Case[]) {
        super()
    }

    override execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        for (const { condition, body } of this.cases) {
            const shouldStop = this.shouldStop(condition, scope, callFrame)
            if (!shouldStop) continue

            body.execute(scope, callFrame)
            break
        }
    }

    shouldStop(
        condition: Evaluable | undefined,
        scope: Scope,
        _callFrame: CallFrame,
    ) {
        const callFrame = new CallFrame(this, _callFrame)
        return !condition || isTruthy(condition.execute(scope, callFrame))
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
