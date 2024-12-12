import { mergeArgumentBranchingTokens } from './merge-argument-branching-tokens.ts'
import { UnexpectedCharError } from '../../error/prepare.ts'
import { NotAcceptableSignal } from './signal.ts'
import { RULES } from './rules.ts'

import type { Token } from './token.ts'
import { getFunctionDeclareRanges } from '../../util/get-function-declare-ranges.ts'
import { assertIndentValidity } from './indent-validity.ts'

class Tokenizer {
    private tokens: Token[] = []
    private code: string[]

    private column = 1
    private line = 1

    constructor(code: string) {
        this.code = preprocess(code).split('')
    }

    tokenize() {
        while (this.code) {
            const char = this.code[0]

            if (!char) {
                break
            }

            let accepted = false

            for (const rule of RULES) {
                const isStarterMatched = this.isStarterMatched(rule, char)
                if (!isStarterMatched) {
                    continue
                }

                const codeCheckpoint = this.code.slice()

                let columnCheckpoint = this.column
                let lineCheckpoint = this.line

                try {
                    const view = () => codeCheckpoint[0]
                    const shift = () => {
                        const shifted = codeCheckpoint.shift()

                        if (shifted === '\n') {
                            lineCheckpoint++
                            columnCheckpoint = 1
                        } else {
                            columnCheckpoint++
                        }

                        return shifted
                    }

                    const value = rule.parse(view, shift)

                    this.tokens.push({
                        type: rule.type,
                        value,
                        position: {
                            column: this.column,
                            line: this.line,
                        },
                    })

                    this.code = codeCheckpoint
                    this.column = columnCheckpoint
                    this.line = lineCheckpoint

                    accepted = true

                    break
                } catch (e) {
                    if (e instanceof NotAcceptableSignal) {
                        continue
                    }
                }
            }

            if (accepted) {
                continue
            }

            throw new UnexpectedCharError({
                resource: {
                    char: this.code.slice(0, 5).join(''),
                    parts: '코드',
                },
                position: {
                    column: this.column,
                    line: this.line,
                },
            })
        }

        return this.tokens
    }

    private isStarterMatched(rule: (typeof RULES)[number], char: string) {
        if (Array.isArray(rule.starter)) {
            return rule.starter.includes(char)
        }

        return char.match(rule.starter)
    }
}

export function tokenize(text: string): Token[] {
    const tokens = new Tokenizer(text).tokenize()
    const functionDeclareRanges = getFunctionDeclareRanges(tokens)
    const merged = mergeArgumentBranchingTokens(tokens, functionDeclareRanges)

    assertIndentValidity(merged)

    return merged
}

function preprocess(code: string) {
    return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}
