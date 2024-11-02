import { Expression, Identifier, Node } from '../../../../node/base.ts'
import { Block } from '../../../../node/block.ts'

export function getMentionedNames(tokens: Node[]) {
    const names = new Set<string>()

    for (let i = 0; i < tokens.length; i++) {
        const header = tokens[i]

        if (header instanceof Block) {
            const nestedMention = getMentionedNames(header.children)
            nestedMention.forEach((name) => names.add(name))
        }

        const name = tokens[i + 1]

        if (!isMention(header, name)) continue
        const fileName = name.value

        names.add(fileName)
    }

    return [...names]
}

function isMention(a: Node, b: Node): b is Identifier {
    const hasMentionHeader = a instanceof Expression && a.value === '@'
    if (!hasMentionHeader) return false

    const hasName = b instanceof Identifier
    return hasName
}
