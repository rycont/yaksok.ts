import { Evaluable } from './base.ts'

import type { CallFrame } from '../executer/callFrame.ts'
import type { Scope } from '../executer/scope.ts'
import type { Position } from '../type/position.ts'
import type { ValueType } from '../value/index.ts'
import { BooleanValue, NumberValue, StringValue } from '../value/primitive.ts'

export class NumberLiteral extends Evaluable {
    static override friendlyName = '숫자'

    constructor(private content: number, public override position?: Position) {
        super()
    }

    override execute(_scope: Scope, _callFrame: CallFrame): ValueType {
        return new NumberValue(this.content)
    }

    override toPrint(): string {
        return this.content.toString()
    }
}

export class StringLiteral extends Evaluable {
    static override friendlyName = '문자'

    constructor(private content: string, public override position?: Position) {
        super()
    }

    override execute(_scope: Scope, _callFrame: CallFrame): ValueType {
        return new StringValue(this.content)
    }

    override toPrint(): string {
        return this.content
    }
}

export class BooleanLiteral extends Evaluable {
    static override friendlyName = '참거짓'

    constructor(private content: boolean, public override position?: Position) {
        super()
    }

    override execute(_scope: Scope, _callFrame: CallFrame): ValueType {
        return new BooleanValue(this.content)
    }

    override toPrint(): string {
        return this.content ? '참' : '거짓'
    }
}
