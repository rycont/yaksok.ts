import { Evaluable, ValueTypes } from './index.ts'

import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import {
    CannotUseReservedWordForVariableNameError,
    NotDefinedVariableError,
} from '../error/index.ts'

export class Variable extends Evaluable {
    constructor(public name: string) {
        super()
    }

    execute(scope: Scope) {
        try {
            return scope.getVariable(this.name)
        } catch (e) {
            if (e instanceof NotDefinedVariableError) {
                e.position = this.position
            }

            throw e
        }
    }

    toPrint(): string {
        return this.name
    }
}

export const RESERVED_WORDS = [
    '약속',
    '만약',
    '이고',
    '이면',
    '보여주기',
    '반복',
    '이전',
    '의',
    '마다',
    '훔쳐오기',
]

export class SetVariable extends Evaluable {
    constructor(public name: string, public value: Evaluable) {
        super()
        this.assertValidName()
    }

    execute(scope: Scope, _callFrame: CallFrame): ValueTypes {
        const { name, value } = this
        const callFrame = new CallFrame(this, _callFrame)

        const result = value.execute(scope, callFrame)

        scope.setVariable(name, result)
        return result
    }

    assertValidName() {
        if (!RESERVED_WORDS.includes(this.name)) return

        throw new CannotUseReservedWordForVariableNameError({
            position: this.position,
            resource: {
                name: this.name,
            },
        })
    }
}
