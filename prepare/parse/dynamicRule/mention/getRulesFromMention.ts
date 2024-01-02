import { Yaksok } from '../../../../index.ts'
import { Keyword, Node } from '../../../../node/base.ts'
import { Evaluable } from '../../../../node/index.ts'
import { Mention, MentionScope } from '../../../../node/mention.ts'
import { Rule } from '../../rule.ts'
import { getMentionedNames } from './getMentionedNames.ts'

export function getDynamicRulesFromMention(tokens: Node[], yaksok: Yaksok) {
    const rules = getMentionedNames(tokens).flatMap(
        getMentioningRules.bind(null, yaksok),
    )

    return rules
}

function getMentioningRules(yaksok: Yaksok, fileName: string) {
    const runner = yaksok.getRunner(fileName)
    const rules = runner.exports

    return rules
        .filter(isNotFunctionDeclareRule)
        .map(createMentioningRuleFromExportedRule.bind(null, fileName))
}

function isNotFunctionDeclareRule(rule: Rule) {
    const firstNode = rule.pattern[0]

    const isKeyword = firstNode instanceof Keyword
    if (!isKeyword) return true

    const isDeclare = ['약속'].includes(firstNode.value)
    return !isDeclare
}

function createMentioningRuleFromExportedRule(fileName: string, rule: Rule) {
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

        if (!(child instanceof Evaluable))
            throw new Error('child is not Evaluable')

        return new MentionScope(fileName, child)
    }
}
