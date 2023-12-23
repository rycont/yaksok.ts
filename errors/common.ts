import { Evaluable, Position } from '../node/base.ts'
import { Operator } from '../node/index.ts'
import { NODE_NAMES } from '../nodeNames.ts'

export class YaksokError<T = unknown> extends Error {
    position?: Position
    resource?: T

    constructor(props: { position?: Position; resource?: T }) {
        super()

        this.position = props.position
        this.resource = props.resource
    }

    show() {
        // console.log('─────\n')
        // console.log(`🚨  ${bold(`문제가 발생했어요`)}  🚨`)
        // if (this.position)
        //     console.log(
        //         `${this.position.line}번째 줄의 ${this.position.column}번째 글자\n`,
        //     )
        // console.log('> ' + this.message + '\n')
        // throw this
        // console.log('┌─────')
        // if (!this.callFrame || !this.callFrame.code || !this.position) return
        // this.printHintCode(this.callFrame.code, this.position)
        // console.log('└─────')
    }

    // printHintCode(code: string, position: Position) {
    //     let lines = code.split('\n')

    //     if (lines.length <= 3) {
    //         lines = [...lines, ...Array(3 - lines.length).fill('')]
    //     }

    //     lines = code.split('\n').slice(position.line - 2, position.line + 1)

    //     console.log(
    //         '│  \x1b[2m' + (position.line - 1) + '  ' + lines[0] + '\x1b[0m',
    //     )
    //     console.log('│  ' + position.line + '  ' + lines[1])
    //     console.log(
    //         '│      ' + ' '.repeat(position.column - 1) + '\x1b[33m^\x1b[0m',
    //     )
    //     console.log(
    //         '│  \x1b[2m' + (position.line + 1) + '  ' + lines[2] + '\x1b[0m',
    //     )
    // }
}

export function evaluableToText(evaluable: Evaluable) {
    let text =
        NODE_NAMES[evaluable.constructor.name] || evaluable.constructor.name

    try {
        text = bold(blue(evaluable.toPrint())) + dim(`(${text})`)
    } catch {}

    return text
}

export function operatorToText(operator: Operator) {
    let text =
        NODE_NAMES[operator.constructor.name] || operator.constructor.name

    const toPrint = operator.toPrint()
    if (toPrint !== 'unknown') text = blue(bold(toPrint)) + dim(`(${text})`)

    return text
}

export function bold(text: string) {
    return `\x1b[1m${text}\x1b[0m`
}

export function blue(text: string) {
    return `\x1b[34m${text}\x1b[0m`
}

export function dim(text: string) {
    return `\x1b[2m${text}\x1b[0m`
}
