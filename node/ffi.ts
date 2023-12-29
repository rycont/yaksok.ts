import { FFIResulTypeIsNotForYaksokError } from '../error/ffi.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import { Executable, Position, ValueTypes } from './base.ts'
import { Params, getParams } from './function.ts'
import { Keyword } from './index.ts'
import { IndexedValue } from './indexed.ts'
import { PrimitiveValue } from './primitive.ts'

export class FFIBody extends Keyword {
    constructor(
        public code: string,
        public position?: Position,
    ) {
        super(code, position)
    }
}

export class DeclareFFI extends Executable {
    public name: string
    public body: string
    public runtime: string
    public params: Params

    constructor(props: { body: FFIBody; name: string; runtime: Keyword }) {
        super()

        const { name, body, runtime, ...rest } = props

        this.name = name
        this.body = body.code
        this.runtime = runtime.value
        this.params = rest
    }

    execute(scope: Scope): void {
        scope.setFunction(this.name, this)
    }

    run(scope: Scope, _callFrame: CallFrame): ValueTypes {
        const yaksokArgs = getParams(this.params, scope, _callFrame)

        const result = scope.runtime!.runFFI(
            this.runtime,
            this.body,
            yaksokArgs,
        )

        if (
            !(result instanceof PrimitiveValue) &&
            !(result instanceof IndexedValue)
        ) {
            throw new FFIResulTypeIsNotForYaksokError({
                position: this.position,
                ffiName: this.name,
                value: result,
            })
        }

        return result
    }
}
