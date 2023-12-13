import { YaksokError } from '../errors.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Evaluable, Keyword, ValueTypes } from './index.ts'

export class Variable extends Evaluable {
    name: string

    constructor(args: { name: Keyword | Variable }) {
        super()

        if (args.name instanceof Keyword) {
            this.name = args.name.value
        } else {
            this.name = args.name.name
        }
    }

    execute(scope: Scope) {
        return scope.getVariable(this.name)
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

        if (name === '결과') {
            if (callFrame.hasEvent('returnValue'))
                callFrame.invokeEvent('returnValue', result)
            else throw new YaksokError('CANNOT_RETURN_OUTSIDE_FUNCTION')
            return result
        } else if (RESERVED_WORDS.includes(name)) {
            throw new YaksokError(
                'CANNOT_USE_RESERVED_WORD_FOR_VARIABLE_NAME',
                {},
                { name },
            )
        } else {
            scope.setVariable(name, result)
            return result
        }
    }
}
