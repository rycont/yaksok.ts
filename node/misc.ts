import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'

import { Node, Executable, Evaluable } from './base.ts'

export class EOL extends Node {}

export class Indent extends Node {
    size: number
    constructor(size: number) {
        super()
        this.size = size
    }
}

export class Print extends Executable {
    value: Evaluable

    constructor(props: { value: Evaluable }) {
        super()
        this.value = props.value
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        console.log(this.value.execute(scope, _callFrame).toPrint())
    }
}
