import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { IndexedValue } from './indexed.ts'
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
    execute(scope: Scope, callFrame: CallFrame) {
        throw new Error(`${this.constructor.name} has no execute method`)
    }
    toPrint(): string {
        throw new Error(`${this.constructor.name} has no toPrint method`)
    }
}

export class Evaluable extends Executable {
    execute(scope: Scope, callFrame: CallFrame): ValueTypes {
        throw new Error(`${this.constructor.name} has no execute method`)
    }
}

export class Keyword extends Node {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }
}

export class Operator extends Node {
    value?: string

    constructor(char?: string) {
        super()
        this.value = char
    }

    call(...operands: ValueTypes[]): ValueTypes {
        throw new Error(`${this.constructor.name} has no call method`)
    }
}

export class Expression extends Node {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }
}

export type PrimitiveTypes = NumberValue | StringValue | BooleanValue
export type ValueTypes = PrimitiveValue<unknown> | IndexedValue
