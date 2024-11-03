import type { Yaksok } from '../../../../index.ts'
import type { Node } from '../../../../node/base.ts'
import type { Evaluable } from '../../../../node/index.ts'
import { Mention, MentionScope } from '../../../../node/mention.ts'
import type { Rule } from '../../rule.ts'
import { getMentionedNames } from './getMentionedNames.ts'

export function getDynamicRulesFromMention(tokens: Node[], yaksok: Yaksok) {
    const rules = getMentionedNames(tokens).flatMap((fileName) =>
        getMentioningRules(yaksok, fileName),
    )

    return rules
}

function getMentioningRules(yaksok: Yaksok, fileName: string) {
    const runner = yaksok.getRunner(fileName)
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
