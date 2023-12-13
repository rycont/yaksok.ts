import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Evaluable } from './index.ts'

export class PrimitiveValue<T> extends Evaluable {
    value: T

    constructor(content: T) {
        super()
        this.value = content
    }

    execute(scope: Scope, _callFrame: CallFrame): PrimitiveValue<T> {
        return this
    }
}

export class NumberValue extends PrimitiveValue<number> {
    toPrint() {
        return this.value.toString()
    }
}

export class StringValue extends PrimitiveValue<string> {
    toPrint() {
        return this.value
    }
}

export class BooleanValue extends PrimitiveValue<boolean> {
    toPrint() {
        return this.value ? '참' : '거짓'
    }
}
