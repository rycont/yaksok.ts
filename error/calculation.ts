import { Position, Operator, Evaluable } from '../node/index.ts'
import { NODE_NAMES } from './nodeNames.ts'
import { YaksokError, evaluableToText, operatorToText } from './common.ts'

export class UnknownOperatorPrecedenceError extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            operator: string
        }
    }) {
        super(props)

        this.message = `${props.resource.operator}(${
            NODE_NAMES[props.resource.operator]
        })는 알 수 없는 연산자에요.`
    }
}

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
