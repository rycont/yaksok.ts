import type { CallFrame } from '../runtime/callFrame.ts'
import type { Scope } from '../runtime/scope.ts'

import { Node, Executable, type Evaluable, type Position } from './base.ts'

export class EOL extends Node {
    constructor(public override position?: Position) {
        super()
    }
}

export class Indent extends Node {
    constructor(public size: number, public override position?: Position) {
        super()
    }
}

export class Print extends Executable {
    constructor(public value: Evaluable, public override position?: Position) {
        super()
    }

    override execute(scope: Scope, _callFrame: CallFrame) {
        const printFunction = scope.runtime?.stdout || console.log
        printFunction(this.value.execute(scope, _callFrame).toPrint())
    }
}
