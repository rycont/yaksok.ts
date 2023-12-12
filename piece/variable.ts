import { YaksokError } from '../errors.ts'
import { Scope, CallFrame } from '../scope.ts'
import { EvaluatablePiece, KeywordPiece, ValueTypes } from './index.ts'

export class VariablePiece extends EvaluatablePiece {
    name: string

    constructor(args: { name: KeywordPiece | VariablePiece }) {
        super()

        if (args.name instanceof KeywordPiece) {
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

export class DeclareVariablePiece extends EvaluatablePiece {
    name: string
    value: EvaluatablePiece

    constructor(props: { name: VariablePiece; value: EvaluatablePiece }) {
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
