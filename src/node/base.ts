import type { IndexedValue } from './indexed.ts'

import type { CallFrame } from '../runtime/callFrame.ts'
import type { Scope } from '../runtime/scope.ts'
import type {
    NumberValue,
    StringValue,
    BooleanValue,
    PrimitiveValue,
} from './primitive.ts'
import { NotDefinedIdentifierError } from '../error/variable.ts'

export interface Position {
    line: number
    column: number
}

export class Node {
    [key: string]: unknown
    position?: Position

    toJSON(): object {
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
    override toPrint(): string {
        throw new Error(`${this.constructor.name} has no toPrint method`)
    }
}

export class Evaluable extends Executable {
    override execute(_scope: Scope, _callFrame: CallFrame): ValueTypes {
        throw new Error(`${this.constructor.name} has no execute method`)
    }
}

export class Identifier extends Evaluable {
    constructor(public value: string, override position?: Position) {
        super()
    }

    override toPrint() {
        return this.value
    }

    override execute(scope: Scope, _callFrame: CallFrame): ValueTypes {
        try {
            return scope.getVariable(this.value)
        } catch (e) {
            if (e instanceof NotDefinedIdentifierError) {
                e.position = this.position
            }

            throw e
        }
    }
}

export class Operator extends Node {
    constructor(public value?: string, public override position?: Position) {
        super()
    }

    override toPrint(): string {
        return this.value ?? 'unknown'
    }

    call(..._operands: ValueTypes[]): ValueTypes {
        throw new Error(`${this.constructor.name} has no call method`)
    }
}

export class Expression extends Node {
    constructor(public value: string, public override position?: Position) {
        super()
    }

    override toPrint() {
        return this.value
    }
}

export type PrimitiveTypes = NumberValue | StringValue | BooleanValue
export type ValueTypes = PrimitiveValue<unknown> | IndexedValue
