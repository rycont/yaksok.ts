import { CallFrame } from '../executer/callFrame.ts'
import type { Scope } from '../executer/scope.ts'
import type { Block } from './block.ts'
import { BreakSignal } from '../executer/signals.ts'
import { Executable } from './base.ts'

export class Loop extends Executable {
    constructor(public body: Block) {
        super()
    }

    override execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        try {
            while (true) {
                this.body.execute(scope, callFrame)
            }
        } catch (e) {
            if (!(e instanceof BreakSignal)) {
                throw e
            }
        }
    }
}

export class Break extends Executable {
    override execute(_scope: Scope, _callFrame: CallFrame) {
        throw new BreakSignal(this.position)
    }
}
