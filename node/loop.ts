import { Executable } from './index.ts'
import { Block } from './block.ts'

import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'

export class Loop extends Executable {
    body: Block
    constructor(props: { body: Block }) {
        super()
        this.body = props.body
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        let running = true

        callFrame.event.break = () => {
            running = false
        }

        while (true) {
            if (!running) break
            this.body.execute(scope, callFrame)
        }
    }
}

export class Break extends Executable {
    execute(_scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        callFrame.invokeEvent('break')
    }
}
