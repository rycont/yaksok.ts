import { NotDefinedIdentifierError } from '../error/variable.ts'
import { CallFrame } from '../executer/callFrame.ts'
import { NumberValue } from '../node/primitive.ts'
import { Scope } from '../executer/scope.ts'

import type { CodeFile } from '../type/code-file.ts'
import type { ValueTypes } from '../node/base.ts'
import type { Block } from '../node/block.ts'

const RESULT_VARIABLE_NAME = '결과'
const DEFAULT_RESULT_VALUE = new NumberValue(0)

export class FunctionObject {
    constructor(
        public name: string,
        public body: Block,
        public delcaredIn?: CodeFile,
    ) {}

    public run(args: Record<string, ValueTypes>) {
        this.delcaredIn?.run()

        const fileScope = new Scope({
            parent: this.delcaredIn?.runResult?.scope,
        })

        const functionScope = new Scope({
            parent: fileScope,
            initialVariable: args,
        })

        const callFrame = new CallFrame(this.body)
        this.body.execute(functionScope, callFrame)

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
