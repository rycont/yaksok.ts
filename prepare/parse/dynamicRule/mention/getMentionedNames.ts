import { Expression, Keyword, Node } from '../../../../node/base.ts'

export function getMentionedNames(tokens: Node[]) {
    const names = new Set<string>()

    for (let i = 0; i < tokens.length; i++) {
        const header = tokens[i]
        const name = tokens[i + 1]

        if (!isMention(header, name)) continue
        const fileName = name.value

        names.add(fileName)
    }

    return [...names]
}

function isMention(a: Node, b: Node): b is Keyword {
    const hasMentionHeader = a instanceof Expression && a.value === '@'
    if (!hasMentionHeader) return false

    const hasName = b instanceof Keyword
    if (!hasName) return false

    return true
}
