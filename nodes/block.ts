import { Executable, Node } from './index.ts'
import { YaksokError } from '../errors.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { EOL } from './misc.ts'

export class Block extends Executable {
    children: Node[]

    constructor(content: Node[]) {
        super()
        this.children = content
    }

    execute(scope: Scope, _callFrame?: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i]
            if (child instanceof Executable) {
                child.execute(scope, callFrame)
            } else if (child instanceof EOL) {
                continue
            } else {
                throw new YaksokError(
                    'CANNOT_PARSE',
                    {},
                    {
                        child: JSON.stringify(child),
                    },
                )
            }
        }
    }
}
