import { CallFrame } from '../runtime/callFrame.ts'
import { BREAK } from '../runtime/signals.ts'
import { Scope } from '../runtime/scope.ts'
import { Executable } from './index.ts'
import { Block } from './block.ts'

export class Loop extends Executable {
    body: Block
    constructor(props: { body: Block }) {
        super()
        this.body = props.body
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        while (true) {
            try {
                this.body.execute(scope, callFrame)
            } catch (e) {
                if (e === BREAK) break
                throw e
            }
        }
    }
}

export class Break extends Executable {
    execute(_scope: Scope, _callFrame: CallFrame) {
        throw BREAK
    }
}
