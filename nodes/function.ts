import { YaksokError } from '../errors.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Executable, ValueTypes, Evaluable } from './base.ts'
import { Block, NumberValue } from './index.ts'

export class FunctionDeclaration extends Executable {
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

        let returnValue: ValueTypes

        callFrame.event.returnValue = (value: ValueTypes) => {
            returnValue = value
        }
        this.body.execute(scope, callFrame)

        return returnValue!
    }
}

export class FunctionInvoke extends Evaluable {
    #name: string
    props: { [key: string]: Evaluable }

    constructor(props: Record<string, Evaluable> & { name: string }) {
        super()

        this.props = {}

        for (const key in props) {
            if (key === 'name') continue
            this.props[key] = props[key]
        }

        this.#name = props.name
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        const name = this.#name

        if (!name || typeof name !== 'string') {
            throw new YaksokError('FUNCTION_MUST_HAVE_NAME')
        }

        const args: { [key: string]: ValueTypes } = {}

        for (const key in this.props) {
            const value = this.props[key]
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

        return result || new NumberValue(0)
    }
}
