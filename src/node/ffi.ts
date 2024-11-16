import type { FunctionParams } from '../constant/type.ts'
import { FFIResultTypeIsNotForYaksokError } from '../error/ffi.ts'
import type { CallFrame } from '../executer/callFrame.ts'
import type { Scope } from '../executer/scope.ts'
import { Position } from '../type/position.ts'
import { Evaluable, Executable, Identifier, type ValueTypes } from './base.ts'

export class FFIBody extends Identifier {
    static override friendlyName = '번역할 내용'

    constructor(public code: string, public override position?: Position) {
        super(code, position)
    }
}

export class DeclareFFI extends Executable {
    static override friendlyName = '번역 만들기'

    public name: string
    public body: string
    public runtime: string
    public paramNames: string[]

    constructor(props: {
        name: string
        body: string
        runtime: string
        paramNames: string[]
        position?: Position
    }) {
        super()
        this.name = props.name
        this.body = props.body
        this.runtime = props.runtime
        this.paramNames = props.paramNames
        this.position = props.position
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

    getParams(scope: Scope): FunctionParams {
        const params = Object.fromEntries(
            this.paramNames.map((param) => [param, scope.getVariable(param)]),
        )

        return params
    }

    assertEvaluable(value: unknown): asserts value is Evaluable {
        if (value instanceof Evaluable) return

        throw new FFIResultTypeIsNotForYaksokError({
            position: this.position,
            ffiName: this.name,
            value,
        })
    }
}
