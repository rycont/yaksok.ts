import { FFIResulTypeIsNotForYaksokError } from '../error/ffi.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import { Executable, Position, ValueTypes } from './base.ts'
import { Keyword } from './index.ts'
import { IndexedValue } from './indexed.ts'
import { PrimitiveValue } from './primitive.ts'

export class FFIBody extends Keyword {
    constructor(public code: string, public position?: Position) {
        super(code, position)
    }
}

export class DeclareFFI extends Executable {
    constructor(
        public name: string,
        public body: string,
        public runtime: string,
        public paramNames: string[],
    ) {
        super()
    }

    execute(scope: Scope): void {
        scope.setFunction(this.name, this)
    }

    run(scope: Scope, _callFrame: CallFrame): ValueTypes {
        const params = this.getParams(scope)
        const result = scope.runtime!.runFFI(this.runtime, this.body, params)

        this.assertYaksokValue(result)
        return result
    }

    getParams(scope: Scope) {
        const params = Object.fromEntries(
            this.paramNames.map((param) => [param, scope.getVariable(param)]),
        )

        return params
    }

    assertYaksokValue(value: unknown): asserts value is ValueTypes {
        if (isYaksokValue(value)) return

        throw new FFIResulTypeIsNotForYaksokError({
            position: this.position,
            ffiName: this.name,
            value,
        })
    }
}

function isYaksokValue(value: unknown): value is ValueTypes {
    return value instanceof PrimitiveValue || value instanceof IndexedValue
}
