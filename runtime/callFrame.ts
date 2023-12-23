import { Node } from '../node/index.ts'

export class CallFrame {
    event: Record<string, (...args: any[]) => void> = {}
    code: string | null

    constructor(
        public node: Node,
        public parent?: CallFrame | undefined,
        code?: string,
    ) {
        if (parent?.code) {
            this.code = parent.code
        } else if (code) {
            this.code = code
        } else {
            this.code = null
        }
    }
}
