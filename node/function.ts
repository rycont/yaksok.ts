import { Executable, ValueTypes, Evaluable } from './base.ts'
import { CallFrame } from '../runtime/callFrame.ts'

import {
    FunctionMustHaveNameError,
    NotDefinedFunctionError,
    NotDefinedVariableError,
    NotEvaluableParameterError,
} from '../error/index.ts'
import { Scope } from '../runtime/scope.ts'
import { NumberValue } from './primitive.ts'
import { Block } from './block.ts'
import { Node } from './index.ts'
import { ReturnSignal } from '../runtime/signals.ts'

const DEFAULT_RETURN_VALUE = new NumberValue(0)

export class DeclareFunction extends Executable {
    name: string
    body: Block

    constructor(props: { body: Block; name: string }) {
        super()

        this.name = props.name
        this.body = props.body
    }

    execute(scope: Scope) {
        scope.setFunction(this.name, this)
    }

    run(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        try {
            this.body.execute(scope, callFrame)
        } catch (e) {
            if (!(e instanceof ReturnSignal)) {
                throw e
            }
        }

        return this.getReturnValue(scope)
    }

    getReturnValue(scope: Scope) {
        try {
            return scope.getVariable('결과')
        } catch (e) {
            if (e instanceof NotDefinedVariableError) {
                return DEFAULT_RETURN_VALUE
            }

            throw e
        }
    }
}

export interface Params {
    [key: string]: Node
}

export class FunctionInvoke extends Evaluable {
    private name: string
    private params: Params | null

    constructor(props: { name: string; params?: Record<string, Evaluable> }) {
        super()

        if (!props.name) {
            throw new FunctionMustHaveNameError({
                position: this.position,
            })
        }

        this.name = props.name!
        this.params = props.params || null
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        const args = this.params && getParams(this.params, scope, callFrame)

        try {
            const result = this.invoke(scope, callFrame, args)
            return result || DEFAULT_RETURN_VALUE
        } catch (e) {
            if (e instanceof NotDefinedFunctionError) {
                e.position = this.position
            }

            throw e
        }
    }

    invoke(
        scope: Scope,
        callFrame: CallFrame,
        args: { [key: string]: ValueTypes } | null,
    ) {
        const func = scope.getFunction(this.name)
        const childScope = new Scope({
            parent: scope,
            initialVariable: args,
        })

        const result = func.run(childScope, callFrame)

        return result
    }
}

export function getParams(params: Params, scope: Scope, callFrame: CallFrame) {
    const args: { [key: string]: ValueTypes } = {}

    for (const key in params) {
        const value = params[key]

        if (value instanceof Evaluable) {
            args[key] = value.execute(scope, callFrame)
        } else {
            throw new NotEvaluableParameterError({
                position: value.position,
                resource: {
                    node: value,
                },
            })
        }
    }

    return args
}
