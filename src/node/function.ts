import { NotDefinedIdentifierError } from '../error/index.ts'
import { CallFrame } from '../executer/callFrame.ts'
import { Scope } from '../executer/scope.ts'
import { ReturnSignal } from '../executer/signals.ts'
import { Evaluable, Executable, type ValueTypes } from './base.ts'
import { NumberValue } from './primitive.ts'

import type { FunctionParams } from '../constant/type.ts'
import type { Block } from './block.ts'

const DEFAULT_RETURN_VALUE = new NumberValue(0)

export class DeclareFunction extends Executable {
    static override friendlyName = '새 약속 만들기'

    name: string
    body: Block

    constructor(props: { body: Block; name: string }) {
        super()

        this.name = props.name
        this.body = props.body
    }

    override execute(scope: Scope) {
        scope.setFunction(this.name, this)
    }

    run(scope: Scope, _callFrame: CallFrame): ValueTypes {
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

    getReturnValue(scope: Scope): ValueTypes {
        try {
            return scope.getVariable('결과')
        } catch (e) {
            if (e instanceof NotDefinedIdentifierError) {
                return DEFAULT_RETURN_VALUE
            }

            throw e
        }
    }
}
export class FunctionInvoke extends Evaluable {
    static override friendlyName = '약속 사용하기'

    private name: string
    private params: FunctionParams

    constructor(props: { name: string; params: FunctionParams }) {
        super()

        this.name = props.name!
        this.params = props.params
    }

    override async execute(
        scope: Scope,
        _callFrame: CallFrame,
    ): Promise<ValueTypes> {
        const callFrame = new CallFrame(this, _callFrame)
        const args = await getParams(this.params, scope, callFrame)

        const result = await this.invoke(scope, callFrame, args)
        return result
    }

    async invoke(
        scope: Scope,
        callFrame: CallFrame,
        args: { [key: string]: ValueTypes } | null,
    ): Promise<ValueTypes> {
        const func = scope.getFunction(this.name)
        const childScope = new Scope({
            parent: scope,
            initialVariable: args,
        })

        const result = await func.run(childScope, callFrame)

        return result
    }
}

export async function getParams(
    params: FunctionParams,
    scope: Scope,
    callFrame: CallFrame,
): Promise<{ [key: string]: ValueTypes }> {
    const args: { [key: string]: ValueTypes } = {}

    for (const key in params) {
        const value = params[key]
        args[key] = await value.execute(scope, callFrame)
    }

    return args
}
