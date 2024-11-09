import type { CallFrame } from '../executer/callFrame.ts'
import { Evaluable, type Position } from './base.ts'
import type { Scope } from '../executer/scope.ts'

export class PrimitiveValue<T> extends Evaluable {
    value: T

    constructor(content: T) {
        super()
        this.value = content
    }

    override execute(_scope: Scope, _callFrame: CallFrame): PrimitiveValue<T> {
        return this
    }
}

export class NumberValue extends PrimitiveValue<number> {
    constructor(content: number, public override position?: Position) {
        super(content)
    }

    override toPrint() {
        return this.value.toString()
    }
}

export class StringValue extends PrimitiveValue<string> {
    constructor(content: string, public override position?: Position) {
        super(content)
    }

    override toPrint() {
        return this.value
    }
}

export class BooleanValue extends PrimitiveValue<boolean> {
    override toPrint() {
        return this.value ? '참' : '거짓'
    }
}
