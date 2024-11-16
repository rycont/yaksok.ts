import { Node } from '../../../../node/base.ts'
import { FunctionTemplate } from '../../../../type/function-template.ts'
import { PatternUnit } from '../../rule.ts'

export interface FunctionDeclareRulePreset {
    prefix: PatternUnit[]
    postfix: PatternUnit[]
    createFactory: (
        template: FunctionTemplate,
    ) => (matchedNodes: Node[]) => Node
}
