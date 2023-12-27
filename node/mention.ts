import { assert } from 'assert'

import { Evaluable, Executable, Keyword, ValueTypes } from './base.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Rule } from '../prepare/parse/rule.ts'
import { Scope } from '../runtime/scope.ts'

export class Mention extends Executable {
    value: string

    constructor(props: { name: Keyword }) {
        super()
        this.value = props.name.value
    }

    toPrint(): string {
        return '@' + this.value
    }
}

export class MentionScope extends Evaluable {
    originRule: Rule
    filename: string
    childNode: Evaluable

    constructor(
        props: { __internal: { originRule: Rule; filename: string } } & Record<
            string,
            Evaluable
        >,
    ) {
        super()

        const {
            __internal: { originRule, filename },
            ...rest
        } = props

        this.originRule = originRule
        this.filename = filename

        const childNode = new originRule.to(rest)
        assert(childNode instanceof Evaluable)

        this.childNode = childNode
    }

    execute(_scope: Scope, _callFrame: CallFrame): ValueTypes {
        if (this.position) {
            this.childNode.position = {
                line: this.position.line,
                column: this.position.column + 1 + this.filename.length,
            }
        }

        const scope = _scope.createChild()
        const runner = _scope.runtime!.runOnce(this.filename)
        const moduleScope = runner.scope

        moduleScope.parent = scope

        const result = runner.evaluateFromExtern(this.childNode)

        moduleScope.parent = undefined

        return result
    }

    toPrint(): string {
        return '@' + this.filename + ' ' + this.childNode.toPrint()
    }
}
