import { Mention, MentionScope } from '../../../../node/mention.ts'
import { FunctionInvoke } from '../../../../node/function.ts'
import { Identifier, Node } from '../../../../node/base.ts'
import { Rule } from '../../rule.ts'

export function createMentioningRule(
    fileName: string,
    originalRule: Rule,
): Rule {
    const mergedPattern = [
        {
            type: Mention,
            value: fileName,
        },
        ...originalRule.pattern,
    ]

    return {
        pattern: mergedPattern,
        config: originalRule.config,
        factory: createFactory(fileName, originalRule),
    }
}

function createFactory(fileName: string, rule: Rule) {
    return (nodes: Node[]) => {
        const child = rule.factory(nodes.slice(1)) as
            | Identifier
            | FunctionInvoke
        child.position = nodes[1].position

        return new MentionScope(fileName, child)
    }
}
