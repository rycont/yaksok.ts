import { type YaksokError, bold } from './common.ts'
import type { Position } from '../node/base.ts'
import type { CodeRunner } from '../index.ts'

interface PrintErrorProps {
    error: YaksokError
    code?: string
    runtime?: CodeRunner
}

export function printError({ error, code }: PrintErrorProps) {
    let output = ''

    output += '─────\n\n'
    output += `🚨  ${bold(`문제가 발생했어요`)}  🚨` + '\n'

    if (error.position)
        output +=
            `${error.position.line}번째 줄의 ${error.position.column}번째 글자\n` +
            '\n'

    output += '> ' + error.message + '\n\n'

    if (!code || !error.position) return output

    output += '┌─────\n'
    output += getHintCode(error.position, code)
    output += '└─────\n'

    return output
}

function getHintCode(position: Position, code: string) {
    let output = ''
    const lines = code.split('\n')

    for (let i = 0; i < lines.length; i++) {
        if (i < position.line - 2 || i > position.line + 1) {
            continue
        }

        const lineText = lines[i]
        const lineNum = i + 1

        if (i === position.line - 1) {
            output += '│  ' + lineNum + '  ' + lineText + '\n'
            output += '│       ' + ' '.repeat(position.column) + '^' + '\n'
            continue
        }

        output += '│  \x1b[2m' + lineNum + '  ' + lineText + '\x1b[0m' + '\n'
    }

    return output
}
