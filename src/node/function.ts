import { Evaluable, Executable, type ValueTypes } from './base.ts'
import { CallFrame } from '../executer/callFrame.ts'
import { Scope } from '../executer/scope.ts'

import type { FunctionParams } from '../constant/type.ts'
import type { Block } from './block.ts'
import { FunctionObject } from '../value/function.ts'
import { FFIResultTypeIsNotForYaksokError } from '../error/ffi.ts'

export class DeclareFunction extends Executable {
    static override friendlyName = '새 약속 만들기'

    name: string
    body: Block

    constructor(props: { body: Block; name: string }) {
        super()

        this.name = props.name
        this.body = props.body
    }

    override execute(scope: Scope, _callFrame: CallFrame) {
        const functionObject = new FunctionObject(this.name, this.body, scope)

        scope.addFunctionObject(functionObject)
    }
}

export class FunctionInvoke extends Evaluable {
    static override friendlyName = '약속 사용하기'

    public name: string
    public params: FunctionParams

    constructor(props: { name: string; params: FunctionParams }) {
        super()

        this.name = props.name!
        this.params = props.params
    }

    override execute(
        scope: Scope,
        callFrame: CallFrame,
        args: {
            [key: string]: ValueTypes
        } = evaluateParams(this.params, scope, callFrame),
    ): ValueTypes {
        const functionObject = scope.getFunctionObject(this.name)
        const returnValue = functionObject.run(args)

        assertValidReturnValue(this, returnValue)

        const evaluated = returnValue.execute(scope, callFrame)
        return evaluated
    }
}

export function evaluateParams(
    params: FunctionParams,
    scope: Scope,
    callFrame: CallFrame,
): { [key: string]: ValueTypes } {
    const args: { [key: string]: ValueTypes } = {}

    for (const key in params) {
        const value = params[key]
        args[key] = value.execute(scope, callFrame)
    }

    return args
}

function assertValidReturnValue(node: FunctionInvoke, returnValue: ValueTypes) {
    if (returnValue instanceof Evaluable) {
        return
    }

    throw new FFIResultTypeIsNotForYaksokError({
        ffiName: node.name,
        value: returnValue,
        position: node.position,
    })
}
