import { IndexedValue } from './indexed.ts'

import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import {
    NumberValue,
    StringValue,
    BooleanValue,
    PrimitiveValue,
} from './primitive.ts'

export interface Position {
    line: number
    column: number
}

export class Node {
    [key: string]: unknown
    position?: Position

    toJSON() {
        return {
            type: this.constructor.name,
            ...this,
        }
    }

    toPrint(): string {
        throw new Error(`${this.constructor.name} has no toPrint method`)
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
    constructor(public value: string, public position?: Position) {
        super()
    }
    toPrint() {
        return this.value
    }
}

export class Operator extends Node {
    constructor(public value?: string, public position?: Position) {
        super()
    }

    toPrint(): string {
        return this.value ?? 'unknown'
    }

    call(..._operands: ValueTypes[]): ValueTypes {
        throw new Error(`${this.constructor.name} has no call method`)
    }
}

export class Expression extends Node {
    constructor(public value: string, public position?: Position) {
        super()
    }
}

export type PrimitiveTypes = NumberValue | StringValue | BooleanValue
export type ValueTypes = PrimitiveValue<unknown> | IndexedValue
