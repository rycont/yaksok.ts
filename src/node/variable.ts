import { CallFrame } from '../runtime/callFrame.ts'
import type { Scope } from '../runtime/scope.ts'
import { CannotUseReservedWordForIdentifierNameError } from '../error/index.ts'
import { Evaluable, ValueTypes } from './base.ts'

export const RESERVED_WORDS = [
    '약속',
    '만약',
    '이고',
    '고',
    '거나',
    '이거나',
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

    override execute(scope: Scope, _callFrame: CallFrame): ValueTypes {
        const { name, value } = this
        const callFrame = new CallFrame(this, _callFrame)

        const result = value.execute(scope, callFrame)

        scope.setVariable(name, result)
        return result
    }

    assertValidName() {
        if (!RESERVED_WORDS.includes(this.name)) return

        throw new CannotUseReservedWordForIdentifierNameError({
            position: this.position,
            resource: {
                name: this.name,
            },
        })
    }
}
