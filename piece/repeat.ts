import { Scope, CallFrame } from '../scope.ts'
import { BlockPiece } from './block.ts'
import { ExecutablePiece } from './index.ts'

export class RepeatPiece extends ExecutablePiece {
    body: BlockPiece
    constructor(props: { body: BlockPiece }) {
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

export class BreakPiece extends ExecutablePiece {
    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        callFrame.invokeEvent('break')
    }
}
