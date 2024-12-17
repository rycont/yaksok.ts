import type { Node } from '../node/index.ts'

export class CallFrame {
    event: Record<string, (...args: any[]) => void> = {}
    constructor(
        public node: Node,
        public parent?: CallFrame | undefined,
    ) {}
}
