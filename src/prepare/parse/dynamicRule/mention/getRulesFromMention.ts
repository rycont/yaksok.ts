import { getMentionedNames } from './getMentionedNames.ts'
import { Mention, MentionScope } from '../../../../node/mention.ts'

import type { Evaluable } from '../../../../node/index.ts'
import type { Runtime } from '../../../../runtime/index.ts'
import type { Node } from '../../../../node/base.ts'
import type { Rule } from '../../rule.ts'
import { Token } from '../../../tokenize/token.ts'

export function getDynamicRulesFromMention(tokens: Token[], runtime: Runtime) {
    const rules = getMentionedNames(tokens).flatMap((fileName) =>
        getMentioningRules(runtime, fileName),
    )

    return rules
}

function getMentioningRules(runtime: Runtime, fileName: string) {
    const runner = runtime.getFileRunner(fileName)
    runner.prepare()

    const rules = runner.exportedRules

    const mentioningRules = rules
        .filter((r) => r.config?.exported)
        .map((rule) => createMentioningRuleFromExportedRule(fileName, rule))

    return mentioningRules
}

function createMentioningRuleFromExportedRule(
    fileName: string,
    rule: Rule,
): Rule {
    return {
        pattern: [
            {
                type: Mention,
                value: fileName,
            },
            ...rule.pattern,
        ],
        config: {
            ...rule.config,
            __internal: {
                originRule: rule,
                fileName: fileName,
            },
        },
        factory: createFactory(fileName, rule),
    }
}

function createFactory(fileName: string, rule: Rule) {
    return (nodes: Node[]) => {
        const child = rule.factory(nodes.slice(1))
        child.position = nodes[1].position

        return new MentionScope(fileName, child as Evaluable)
    }
}
