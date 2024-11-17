import { Evaluable, Operator } from '../node/base.ts'
import { evaluableToText, operatorToText, YaksokError } from './common.ts'

import type { Position } from '../type/position.ts'

export class InvalidTypeForCompareError extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            left: Evaluable
            right: Evaluable
        }
    }) {
        super(props)

        const leftText = evaluableToText(props.resource.left)
        const rightText = evaluableToText(props.resource.right)

        this.message = `${leftText}와 ${rightText}는 비교할 수 없어요.`
    }
}

export class InvalidTypeForOperatorError extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            operator: Operator
            operands: Evaluable[]
        }
    }) {
        super(props)

        const operandsText = props.resource.operands
            .map(evaluableToText)
            .join('와 ')
        this.message = `${operandsText}는 ${operatorToText(
            props.resource.operator,
        )}할 수 없어요.`
    }
}
