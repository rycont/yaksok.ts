import { Scope, CallFrame } from '../scope.ts'
import { EvaluatablePiece, KeywordPiece, ValueTypes } from './index.ts'

export class VariablePiece extends EvaluatablePiece {
    name: string

    constructor(args: { name: KeywordPiece }) {
        super()
        this.name = args.name.value
    }

    execute(scope: Scope) {
        return scope.getVariable(this.name)
    }
}

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
            callFrame.invokeEvent('returnValue', result)
            return result
        }

        scope.setVariable(name, result)
        return result
    }
}
