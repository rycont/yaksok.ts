import { Evaluable, Keyword, ValueTypes } from './index.ts'

import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import {
    CannotUseReservedWordForVariableNameError,
    NotDefinedVariableError,
} from '../error/index.ts'

export class Variable extends Evaluable {
    name: string

    constructor(args: { name: Keyword | Variable } | string) {
        super()

        if (typeof args === 'string') {
            this.name = args
            return
        } else if (args.name instanceof Keyword) {
            this.name = args.name.value
            return
        }

        this.name = args.name.name
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
    name: string
    value: Evaluable

    constructor(props: { name: Variable; value: Evaluable }) {
        super()

        this.name = props.name.name
        this.value = props.value
    }
    execute(scope: Scope, _callFrame: CallFrame): ValueTypes {
        const callFrame = new CallFrame(this, _callFrame)

        const { name, value } = this
        const result = value.execute(scope, callFrame)

        if (RESERVED_WORDS.includes(name)) {
            throw new CannotUseReservedWordForVariableNameError({
                position: this.position,
                resource: {
                    name,
                },
            })
        } else {
            scope.setVariable(name, result)
            return result
        }
    }
}
