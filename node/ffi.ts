import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import { Executable, Position, ValueTypes } from './base.ts'
import { Keyword } from './index.ts'
import { NumberValue } from './primitive.ts'

export class FFIBody extends Keyword {
    constructor(public code: string, public position?: Position) {
        super(code, position)
    }
}

export class DeclareFFI extends Executable {
    public name: string
    public body: string
    public runtime: string

    constructor(props: { body: FFIBody; name: string; runtime: Keyword }) {
        super()

        this.name = props.name
        this.body = props.body.code
        this.runtime = props.runtime.value
    }

    execute(scope: Scope): void {
        scope.setFunction(this.name, this)
    }

    run(scope: Scope, _callFrame: CallFrame): ValueTypes {
        return new NumberValue(0)
    }
}
