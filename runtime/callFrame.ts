import { YaksokError } from '../errors.ts'
import { Node } from '../node/index.ts'

export class CallFrame {
    parent: CallFrame | undefined
    event: Record<string, (...args: any[]) => void> = {}

    constructor(_node: Node, parent?: CallFrame) {
        this.parent = parent
    }

    hasEvent(name: string): boolean {
        if (this.event[name]) return true
        if (this.parent) return this.parent.hasEvent(name)

        return false
    }

    invokeEvent(name: string, ...args: unknown[]) {
        if (this.event[name]) {
            this.event[name](...args)
        } else if (this.parent) {
            this.parent.invokeEvent(name, ...args)
        } else {
            throw new YaksokError('EVENT_NOT_FOUND', {}, { name })
        }
    }
}
