import { CallFrame } from '../executer/callFrame.ts'
import { CannotParseError } from '../error/index.ts'
import type { Scope } from '../executer/scope.ts'
import { EOL } from './misc.ts'
import { Executable, type Node } from './base.ts'

export class Block extends Executable {
    static override friendlyName = '코드 덩어리'

    children: Node[]

    constructor(content: Node[]) {
        super()
        this.children = content
    }

    override async execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        for (const child of this.children) {
            if (child instanceof Executable) {
                await child.execute(scope, callFrame)
            } else if (child instanceof EOL) {
                continue
            } else {
                throw new CannotParseError({
                    position: child.position,
                    resource: {
                        part: child,
                    },
                })
            }
        }
    }
}

export class InlineParenthesisBlock extends Block {
    static override friendlyName = '괄호에 묶인 코드 덩어리'

    constructor(content: Node[]) {
        super(content)
    }
}

export class InlineBracketBlock extends Block {
    static override friendlyName = '대괄호에 묶인 코드 덩어리'

    constructor(content: Node[]) {
        super(content)
    }
}
