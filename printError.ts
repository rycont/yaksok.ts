import { YaksokError, bold } from './error/common.ts'
import { Position } from './node/base.ts'

export function printError(error: YaksokError, code: string) {
    console.error('─────\n')
    console.error(`🚨  ${bold(`문제가 발생했어요`)}  🚨`)

    if (error.position)
        console.error(
            `${error.position.line}번째 줄의 ${error.position.column}번째 글자\n`,
        )
    console.error('> ' + error.message + '\n')

    console.error('┌─────')
    if (!error.position) return

    printHintCode(error.position, code)
    console.error('└─────')
}

function printHintCode(position: Position, code: string) {
    const lines = code.split('\n')

    for (let i = 0; i < lines.length; i++) {
        if (i < position.line - 2 || i > position.line + 1) {
            continue
        }

        const lineText = lines[i]
        const lineNum = i + 1

        if (i === position.line - 1) {
            console.error('│  ' + lineNum + '  ' + lineText)
            console.error('│       ' + ' '.repeat(position.column) + '^')
            continue
        }

        console.error('│  \x1b[2m' + lineNum + '  ' + lineText + '\x1b[0m')
    }
}
