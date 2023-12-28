import { CallFrame } from '../runtime/callFrame.ts'
import { Evaluable, Position } from './base.ts'
import { Scope } from '../runtime/scope.ts'

export class PrimitiveValue<T> extends Evaluable {
    value: T

    constructor(content: T) {
        super()
        this.value = content
    }

    execute(_scope: Scope, _callFrame: CallFrame): PrimitiveValue<T> {
        return this
    }
}

export class NumberValue extends PrimitiveValue<number> {
    constructor(content: number, public position?: Position) {
        super(content)
    }

    toPrint() {
        return this.value.toString()
    }
}

export class StringValue extends PrimitiveValue<string> {
    constructor(content: string, public position?: Position) {
        super(content)
    }

    toPrint() {
        return this.value
    }
}

export class BooleanValue extends PrimitiveValue<boolean> {
    toPrint() {
        return this.value ? '참' : '거짓'
    }
}
