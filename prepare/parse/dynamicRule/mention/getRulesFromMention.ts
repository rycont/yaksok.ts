import { Yaksok } from '../../../../index.ts'
import { Expression, Keyword, Node } from '../../../../node/base.ts'
import { DeclareFunction } from '../../../../node/function.ts'
import { Evaluable } from '../../../../node/index.ts'
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
            .filter((rule) => rule.pattern[0].value !== '약속')
            .map((rule) => {
                return {
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
                    factory(nodes: Node[]) {
                        const child = rule.factory(nodes.slice(1))
                        child.position = nodes[1].position

                        if (!(child instanceof Evaluable))
                            throw new Error('child is not Evaluable')

                        return new MentionScope({
                            filename: name,
                            child,
                        })
                    },
                }
            })

        rules = rules.concat(exportedRules)
    }

    return rules
}
