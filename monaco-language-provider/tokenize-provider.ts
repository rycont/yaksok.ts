import type { languages } from 'monaco-editor'
import { parse, CodeFile } from '@dalbit-yaksok/core'

import { nodeToColorTokens } from './ast-to-colorize/index.ts'
import { getCommentColorParts } from './ast-to-colorize/get-comment-color-part.ts'
import { ColorPart } from './type.ts'

export class MonacoDalbitYaksokProvider implements languages.TokensProvider {
    private colorPartsByLine: Map<number, ColorPart[]>
    private lines: string[]

    constructor(private code: string) {
        this.lines = code.split('\n')
        this.colorPartsByLine = this.createColorParts(code)
    }

    createColorParts(code: string): Map<number, ColorPart[]> {
        const codeFile = new CodeFile(code)
        const { ast } = parse(codeFile)

        const nodeColorParts = nodeToColorTokens(ast).toSorted(
            (a, b) => a.position.column - b.position.column,
        )
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

    getInitialState(): languages.IState {
        return {
            clone() {
                return this
            },
            equals() {
                return false
            },
        }
    }

    tokenize(line: string, state: any): languages.ILineTokens {
        const lineNumber = this.lines.indexOf(line)

        const colorParts = this.colorPartsByLine.get(lineNumber)

        if (!colorParts) {
            return {
                tokens: [],
                endState: state,
            }
        }

        const colorTokens = colorParts.map((part) => ({
            scopes: part.scopes,
            startIndex: part.position.column - 1,
        }))

        return {
            tokens: colorTokens,
            endState: state,
        }
    }
}
