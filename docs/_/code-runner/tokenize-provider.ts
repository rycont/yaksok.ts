import type { languages } from 'monaco-editor'
import { tokenize, parse, CodeFile } from '@dalbit-yaksok/core'
import { mergeSyntax } from './merge-syntax.ts'

export class TokenizeProvider implements languages.TokensProvider {
    constructor(private code: string) {}

    updateCode(code: string) {
        console.log(parse(new CodeFile(code)))
        this.code = code
    }

    getInitialState() {
        return {
            clone() {
                return this
            },
            equals() {
                return false
            },
        }
    }

    tokenize(line: string, state: any) {
        const tokenized = mergeSyntax(tokenize(line))
        const tokens = tokenized.map((token) => {
            const scopes =
                token.scope ||
                (
                    {
                        STRING: 'string',
                        OPERATOR: 'operator',
                        NUMBER: 'number',
                        SPACE: 'whitespace',
                        INDENT: 'whitespace',
                        COMMA: 'punctuation',
                        OPENING_PARENTHESIS: 'punctuation',
                        CLOSING_PARENTHESIS: 'punctuation',
                        OPENING_BRACKET: 'punctuation',
                        CLOSING_BRACKET: 'punctuation',
                        FFI_BODY: 'string',
                        NEW_LINE: 'whitespace',
                        COLON: 'punctuation',
                        LINE_COMMENT: 'comment',
                        MENTION: 'tag',
                        UNKNOWN: 'invalid',
                    } as Record<string, string>
                )[token.type] ||
                'invalid'

            return {
                startIndex: token.position.column - 1,
                scopes,
            }
        })

        return {
            tokens,
            endState: state,
        }
    }
}
