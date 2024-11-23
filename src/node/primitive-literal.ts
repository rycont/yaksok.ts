import type { CallFrame } from '../executer/callFrame.ts'
import type { Scope } from '../executer/scope.ts'
import { Position } from '../type/position.ts'
import { Evaluable } from './base.ts'

export class PrimitiveLiteral<JSType> extends Evaluable {
    static override friendlyName = '원시값'

    value: JSType

    constructor(content: JSType) {
        super()
        this.value = content
    }

    override execute(
        _scope: Scope,
        _callFrame: CallFrame,
    ): PrimitiveLiteral<JSType> {
        return this
    }
}

export class NumberLiteral extends PrimitiveLiteral<number> {
    static override friendlyName = '숫자'

    constructor(content: number, public override position?: Position) {
        super(content)
    }

    override toPrint(): string {
        return this.value.toString()
    }
}

export class StringLiteral extends PrimitiveLiteral<string> {
    static override friendlyName = '문자'

    constructor(content: string, public override position?: Position) {
        super(content)
    }

    override toPrint(): string {
        return this.value
    }
}

export class BooleanLiteral extends PrimitiveLiteral<boolean> {
    static override friendlyName = '참거짓'

    override toPrint(): string {
        return this.value ? '참' : '거짓'
    }
}
