import { Rule } from '../prepare/parse/rule.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import { Evaluable, Executable, Keyword, ValueTypes } from './base.ts'

export class Mention extends Executable {
    value: string

    constructor(props: { name: Keyword }) {
        super()
        this.value = props.name.value
    }
}

export class MentioningScope extends Evaluable {
    originRule: Rule
    filename: string
    // childProps: Record<string, Node>
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

        this.childNode = new originRule.to(rest) as Evaluable
    }

    execute(_scope: Scope, _callFrame: CallFrame): ValueTypes {
        const runner = _scope.runtime!.getRunner(this.filename)
        const scope = runner.run()
        const result = this.childNode.execute(scope, _callFrame)

        return result
    }
}
