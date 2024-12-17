import type { CallFrame } from '../executer/callFrame.ts'
import type { Scope } from '../executer/scope.ts'
import { Position } from '../type/position.ts'

import { Node, Executable, type Evaluable } from './base.ts'

export class EOL extends Node {
    static override friendlyName = '줄바꿈'

    constructor(public override position?: Position) {
        super()
    }
}

export class Indent extends Node {
    static override friendlyName = '들여쓰기'

    constructor(public size: number, public override position?: Position) {
        super()
    }
}

export class Print extends Executable {
    static override friendlyName = '보여주기'

    constructor(public value: Evaluable, public override position?: Position) {
        super()
    }

    override async execute(scope: Scope, _callFrame: CallFrame): Promise<void> {
        const printFunction = scope.codeFile?.runtime?.stdout || console.log
        const evaluated = await this.value.execute(scope, _callFrame)

        printFunction(evaluated.toPrint())
    }
}
