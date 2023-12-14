export function isValidCharForKeyword(char: string) {
    if ('가' <= char && char <= '힣') return true
    if ('ㄱ' <= char && char <= 'ㆉ') return true
    if ('0' <= char && char <= '9') return true
    if ('A' <= char && char <= 'Z') return true
    if ('a' <= char && char <= 'z') return true
    if (char === '_') return true

    return false
}

export function isValidFirstCharForKeyword(char: string) {
    if ('가' <= char && char <= '힣') return true
    if ('ㄱ' <= char && char <= 'ㆉ') return true
    if ('A' <= char && char <= 'Z') return true
    if ('a' <= char && char <= 'z') return true
    if (char === '_') return true

    return false
}
