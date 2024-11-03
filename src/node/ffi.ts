import { FFIResulTypeIsNotForYaksokError } from '../error/ffi.ts'
import type { CallFrame } from '../runtime/callFrame.ts'
import type { Scope } from '../runtime/scope.ts'
import {
    Evaluable,
    Executable,
    type Position,
    type ValueTypes,
} from './base.ts'
import { Identifier, type Params } from './index.ts'

export class FFIBody extends Identifier {
    constructor(public code: string, public override position?: Position) {
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

    override execute(scope: Scope): void {
        scope.setFunction(this.name, this)
    }

    run(scope: Scope, _callFrame: CallFrame): ValueTypes {
        const params = this.getParams(scope)
        const returnValue = scope.runtime!.runFFI(
            this.runtime,
            this.body,
            params,
        )

        this.assertEvaluable(returnValue)
        const executedResult = returnValue.execute(scope, _callFrame)

        return executedResult
    }

    getParams(scope: Scope): Params {
        const params = Object.fromEntries(
            this.paramNames.map((param) => [param, scope.getVariable(param)]),
        )

        return params
    }

    assertEvaluable(value: unknown): asserts value is Evaluable {
        if (value instanceof Evaluable) return

        throw new FFIResulTypeIsNotForYaksokError({
            position: this.position,
            ffiName: this.name,
            value,
        })
    }
}
