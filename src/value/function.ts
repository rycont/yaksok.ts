import { NotDefinedIdentifierError } from '../error/variable.ts'
import { CallFrame } from '../executer/callFrame.ts'
import { NumberValue } from '../node/primitive.ts'
import { Scope } from '../executer/scope.ts'

import type { ValueTypes } from '../node/base.ts'
import type { Block } from '../node/block.ts'
import { ReturnSignal } from '../executer/signals.ts'

const RESULT_VARIABLE_NAME = '결과'
const DEFAULT_RESULT_VALUE = new NumberValue(0)

export class FunctionObject implements RunnableObject {
    constructor(
        public name: string,
        private body: Block,
        private delcaredScope?: Scope,
    ) {}

    public run(
        args: Record<string, ValueTypes>,
        fileScope: Scope | undefined = this.delcaredScope,
    ) {
        const functionScope = new Scope({
            parent: fileScope,
            initialVariable: args,
        })

        const callFrame = new CallFrame(this.body)

        try {
            this.body.execute(functionScope, callFrame)
        } catch (e) {
            if (!(e instanceof ReturnSignal)) {
                throw e
            }
        }

        let result: ValueTypes = DEFAULT_RESULT_VALUE

        try {
            result = functionScope.getVariable(RESULT_VARIABLE_NAME)
        } catch (e) {
            if (!(e instanceof NotDefinedIdentifierError)) {
                throw e
            }
        }

        return result
    }
}

export interface RunnableObject {
    run(args: Record<string, ValueTypes>, fileScope?: Scope): ValueTypes
    name: string
}
