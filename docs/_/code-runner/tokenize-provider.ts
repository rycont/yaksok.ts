import type { languages } from 'monaco-editor'
import { parse, CodeFile } from '@dalbit-yaksok/core'

import { ColorPart } from './type.ts'
import { nodeToColorTokens } from './ast-to-colorize/index.ts'
import { getCommentColorParts } from './ast-to-colorize/get-comment-color-part.ts'

export class TokenizeProvider implements languages.TokensProvider {
    private colorPartsByLine: Map<number, ColorPart[]>
    private lines: string[]

    constructor(private code: string) {
        this.lines = code.split('\n')
        this.colorPartsByLine = this.createColorParts(code)
    }

    createColorParts(code: string) {
        const codeFile = new CodeFile(code)
        const { ast } = parse(codeFile)

        const nodeColorParts = nodeToColorTokens(ast)
        const commentColorParts = getCommentColorParts(codeFile.tokens)

        const colorParts = nodeColorParts.concat(commentColorParts)

        const colorPartsByLine = new Map<number, ColorPart[]>(
            new Array(this.lines.length).fill(0).map((_, index) => [index, []]),
        )
        for (const colorPart of colorParts) {
            colorPartsByLine.get(colorPart.position.line - 1)!.push(colorPart)
        }

        return colorPartsByLine
    }

    updateCode(code: string) {
        this.code = code
        this.lines = code.split('\n')

        console.time('Parse')
        this.colorPartsByLine = this.createColorParts(code)
        console.timeEnd('Parse')
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
        const lineNumber = this.lines.indexOf(line)
        const colorParts = this.colorPartsByLine
            .get(lineNumber)!
            .map((part) => ({
                scopes: part.scopes,
                startIndex: part.position.column - 1,
            }))

        return {
            tokens: colorParts,
            endState: state,
        }
    }
}
