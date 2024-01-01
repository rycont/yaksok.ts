import { Yaksok } from '../../../../index.ts'
import { Expression, Keyword, Node } from '../../../../node/base.ts'
import { DeclareFunction } from '../../../../node/function.ts'
import { Mention, MentionScope } from '../../../../node/mention.ts'
import { Rule } from '../../rule.ts'

export function getMentionedNames(tokens: Node[]) {
    const names = new Set<string>()

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        if (token instanceof Expression && token.value === '@') {
            const name = tokens[i + 1]

            if (name instanceof Keyword) {
                names.add(name.value)
            }
        }
    }

    return names
}

export function getDynamicRulesFromMention(tokens: Node[], yaksok: Yaksok) {
    let rules: Rule[] = []

    for (const name of getMentionedNames(tokens)) {
        const runner = yaksok.getRunner(name)
        const exportedRules = runner.exports
            .filter((rule) => !(rule._to instanceof DeclareFunction))
            .map((rule) => ({
                _to: MentionScope,
                pattern: [
                    {
                        type: Mention,
                        value: name,
                    },
                    ...rule.pattern,
                ],
                config: {
                    ...rule.config,
                    __internal: {
                        originRule: rule,
                        filename: name,
                    },
                },
            }))

        rules = rules.concat(exportedRules)
    }

    return rules
}
