import { NotEvaluableParameterError } from '../error/function.ts'
import { Rule } from '../prepare/parse/rule.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import { Evaluable, Executable, Keyword, ValueTypes } from './base.ts'
import { FunctionInvoke } from './function.ts'
import { Node } from './index.ts'

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

    execute(originScope: Scope, _callFrame: CallFrame): ValueTypes {
        if (this.childNode instanceof FunctionInvoke) {
            this.childNode.computedParams = getParamsInOriginScope(
                this.childNode.params,
                originScope,
                _callFrame,
            )
        }

        const runner = originScope.runtime!.getRunner(this.filename)
        const mentioningScope = runner.run()

        const result = this.childNode.execute(mentioningScope, _callFrame)
        return result
    }
}

function getParamsInOriginScope(
    params: { [key: string]: Node },
    scope: Scope,
    callFrame: CallFrame,
) {
    const computedParams: { [key: string]: ValueTypes } = {}

    for (const key in params) {
        const node = params[key]

        if (!(node instanceof Evaluable))
            throw new NotEvaluableParameterError({
                position: node.position,
                resource: {
                    node,
                },
            })

        computedParams[key] = node.execute(scope, callFrame)
    }

    return computedParams
}
