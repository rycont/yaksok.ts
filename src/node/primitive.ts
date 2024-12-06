import type { CallFrame } from '../executer/callFrame.ts'
import { Evaluable, type Position } from './base.ts'
import type { Scope } from '../executer/scope.ts'

export class PrimitiveValue<T> extends Evaluable {
    static override friendlyName = '원시값'

    value: T

    constructor(content: T) {
        super()
        this.value = content
    }

    override execute(
        _scope: Scope,
        _callFrame: CallFrame,
    ): Promise<PrimitiveValue<T>> {
        return Promise.resolve(this)
    }
}

export class NumberValue extends PrimitiveValue<number> {
    static override friendlyName = '숫자'

    constructor(content: number, public override position?: Position) {
        super(content)
    }

    override toPrint(): string {
        return this.value.toString()
    }
}

export class StringValue extends PrimitiveValue<string> {
    static override friendlyName = '문자'

    constructor(content: string, public override position?: Position) {
        super(content)
    }

    override toPrint(): string {
        return this.value
    }
}

export class BooleanValue extends PrimitiveValue<boolean> {
    static override friendlyName = '참거짓'

    override toPrint(): string {
        return this.value ? '참' : '거짓'
    }
}
