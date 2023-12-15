import { IndexedValue } from './indexed.ts'

import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import {
    NumberValue,
    StringValue,
    BooleanValue,
    PrimitiveValue,
} from './primitive.ts'

export class Node {
    [key: string]: unknown
    toJSON() {
        return {
            type: this.constructor.name,
            ...this,
        }
    }
}
export class Executable extends Node {
    execute(_scope: Scope, _callFrame: CallFrame) {
        throw new Error(`${this.constructor.name} has no execute method`)
    }
    toPrint(): string {
        throw new Error(`${this.constructor.name} has no toPrint method`)
    }
}

export class Evaluable extends Executable {
    execute(_scope: Scope, _callFrame: CallFrame): ValueTypes {
        throw new Error(`${this.constructor.name} has no execute method`)
    }
}

export class Keyword extends Node {
    constructor(public value: string) {
        super()
    }
}

export class Operator extends Node {
    constructor(public value?: string) {
        super()
    }

    call(..._operands: ValueTypes[]): ValueTypes {
        throw new Error(`${this.constructor.name} has no call method`)
    }
}

export class Expression extends Node {
    constructor(public value: string) {
        super()
    }
}

export type PrimitiveTypes = NumberValue | StringValue | BooleanValue
export type ValueTypes = PrimitiveValue<unknown> | IndexedValue
