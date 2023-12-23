import { CallFrame } from '../runtime/callFrame.ts'
import { Executable, Node } from './index.ts'
import { Scope } from '../runtime/scope.ts'
import { CannotParseError } from '../errors.ts'
import { EOL } from './misc.ts'

export class Block extends Executable {
    children: Node[]

    constructor(content: Node[]) {
        super()
        this.children = content
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        for (const child of this.children) {
            if (child instanceof Executable) {
                child.execute(scope, callFrame)
            } else if (child instanceof EOL) {
                continue
            } else {
                throw new CannotParseError({
                    position: child.position,
                    callFrame,
                    resource: {
                        part: child,
                    },
                })
            }
        }
    }
}
