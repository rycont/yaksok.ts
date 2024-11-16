import type { Evaluable, Operator } from '../node/base.ts'
import type { Position } from '../type/position.ts'

export class YaksokError<T = unknown> extends Error {
    position?: Position
    resource?: T

    constructor(props: { position?: Position; resource?: T }) {
        super()

        this.position = props.position
        this.resource = props.resource
    }
}

export function evaluableToText(evaluable: Evaluable) {
    let text =
        (evaluable.constructor as typeof Evaluable).friendlyName ||
        evaluable.constructor.name

    try {
        text = bold(blue(evaluable.toPrint())) + dim(`(${text})`)
    } catch {
        // If toPrint() is not implemented, ignore
    }

    return text
}

export function operatorToText(operator: Operator) {
    let text =
        (operator.constructor as typeof Operator).friendlyName ||
        operator.constructor.name

    const toPrint = operator.toPrint()
    if (toPrint !== 'unknown') text = blue(bold(toPrint)) + dim(`(${text})`)

    return text
}

export function bold(text: string | number) {
    return `\x1b[1m${text}\x1b[0m`
}

export function blue(text: string | number) {
    return `\x1b[34m${text}\x1b[0m`
}

export function dim(text: string | number) {
    return `\x1b[2m${text}\x1b[0m`
}
