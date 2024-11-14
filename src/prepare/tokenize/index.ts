import { UnexpectedCharError } from '../../error/prepare.ts'
import { RULES } from './rules.ts'
import { NotAcceptableSignal } from './signal.ts'
import { Token } from './token.ts'

class Tokenizer {
    private tokens: Token[] = []
    private code: string[]

    private column = 1
    private line = 1

    constructor(code: string) {
        this.code = code.split('')
    }

    tokenize() {
        while (this.code) {
            const char = this.code[0]

            if (!char) {
                break
            }

            const starterMatchedRules = RULES.filter((rule) => {
                if (Array.isArray(rule.starter)) {
                    return rule.starter.includes(char)
                }

                return char.match(rule.starter)
            })

            if (starterMatchedRules.length === 0) {
                throw new UnexpectedCharError({
                    resource: {
                        char,
                        parts: 'tokenizer',
                    },
                    position: {
                        column: this.column,
                        line: this.line,
                    },
                })
            }

            let accepted = false

            for (const rule of starterMatchedRules) {
                const codeCheckpoint = [...this.code]

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
                    char,
                    parts: 'tokenizer',
                },
                position: {
                    column: this.column,
                    line: this.line,
                },
            })
        }

        return this.tokens
    }
}

export function tokenize(code: string) {
    return new Tokenizer(code).tokenize()
}
