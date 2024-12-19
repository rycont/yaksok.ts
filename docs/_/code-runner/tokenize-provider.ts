import type { languages } from 'monaco-editor'
import { parse, CodeFile } from '@dalbit-yaksok/core'
import { nodeToColorTokens } from './ast-to-colorize.ts'
import { ColorPart } from './type.ts'

export class TokenizeProvider implements languages.TokensProvider {
    private colorPartsByLine: Map<number, ColorPart[]>
    private lines: string[]

    constructor(private code: string) {
        this.lines = code.split('\n')
        this.colorPartsByLine = this.createColorParts(code)
    }

    createColorParts(code: string) {
        const ast = parse(new CodeFile(code)).ast
        const colorParts = nodeToColorTokens(ast)

        const colorPartsByLine = new Map<number, ColorPart[]>(
            new Array(this.lines.length).fill(0).map((_, index) => [index, []]),
        )
        for (const colorPart of colorParts) {
            colorPartsByLine.get(colorPart.position.line - 1)!.push(colorPart)
        }

        console.log({ colorPartsByLine })

        return colorPartsByLine
    }

    updateCode(code: string) {
        this.code = code
        this.lines = code.split('\n')

        console.time('Parse')
        this.createColorParts(code)
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
                startIndex: part.position.column,
            }))

        return {
            tokens: colorParts,
            endState: state,
        }
    }
}
