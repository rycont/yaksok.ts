import { Executable, ValueTypes, Evaluable } from './base.ts'
import { CallFrame } from '../runtime/callFrame.ts'

import { YaksokError } from '../errors.ts'
import { Scope } from '../runtime/scope.ts'
import { NumberValue } from './primitive.ts'
import { Block } from './block.ts'
import { RETURN } from '../runtime/signals.ts'

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
            if (e !== RETURN) {
                throw e
            }
        }

        return this.getReturnValue(scope)
    }

    getReturnValue(scope: Scope) {
        try {
            return scope.getVariable('결과')
        } catch (e) {
            if (this.isNotDefinedVariable(e)) {
                return DEFAULT_RETURN_VALUE
            }

            throw e
        }
    }

    isNotDefinedVariable(e: unknown) {
        return e instanceof YaksokError && e.name === 'NOT_DEFINED_VARIABLE'
    }
}

export class FunctionInvoke extends Evaluable {
    #name: string
    params: { [key: string]: Evaluable }

    constructor(props: Record<string, Evaluable> & { name?: string }) {
        super()
        if (!props.name) throw new YaksokError('FUNCTION_MUST_HAVE_NAME')

        this.#name = props.name!
        delete props['name']

        this.params = props
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        const name = this.#name

        const args: { [key: string]: ValueTypes } = {}

        for (const key in this.params) {
            const value = this.params[key]
            if (value instanceof Evaluable) {
                args[key] = value.execute(scope, callFrame)
            } else {
                throw new YaksokError(
                    'NOT_EVALUABLE_EXPRESSION',
                    {},
                    { node: JSON.stringify(value) },
                )
            }
        }

        const func = scope.getFunction(name)

        const childScope = new Scope(scope, args)
        const result = func.run(childScope, callFrame)

        return result || DEFAULT_RETURN_VALUE
    }
}
