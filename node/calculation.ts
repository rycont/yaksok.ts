import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import {
    AndOperator,
    DivideOperator,
    GreaterThanOperator,
    GreaterThanOrEqualOperator,
    LessThanOperator,
    LessThanOrEqualOperator,
    MinusOperator,
    MultiplyOperator,
    PlusOperator,
} from './operator.ts'
import { Evaluable, Operator, ValueTypes } from './base.ts'
import { EqualOperator } from './index.ts'
import { UnknownOperatorPrecedenceError } from '../error/index.ts'
import { RangeOperator } from './list.ts'

const OPERATOR_PRECEDENCES: Array<(typeof Operator)[]> = [
    [
        EqualOperator,
        LessThanOperator,
        GreaterThanOperator,
        LessThanOrEqualOperator,
        GreaterThanOrEqualOperator,
        AndOperator,
        RangeOperator,
    ],
    [MinusOperator, PlusOperator],
    [MultiplyOperator, DivideOperator],
]

export class ValueGroup extends Evaluable {
    value: Evaluable

    constructor(props: { value: Evaluable }) {
        super()
        this.value = props.value
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        return this.value.execute(scope, callFrame)
    }

    toPrint() {
        return '(' + this.value.toPrint() + ')'
    }
}

export class Formula extends Evaluable {
    terms: (Evaluable | Operator)[]

    constructor(props: {
        left: Evaluable
        operator: Operator
        right: Evaluable
    }) {
        super()

        let terms: (Evaluable | Operator)[] = []

        if (props.left instanceof Formula) {
            terms = terms.concat(props.left.terms)
        } else {
            terms.push(props.left)
        }

        terms.push(props.operator)

        if (props.right instanceof Formula) {
            terms = terms.concat(props.right.terms)
        } else {
            terms.push(props.right)
        }

        this.terms = terms
    }

    execute(scope: Scope, _callFrame: CallFrame): ValueTypes {
        const callFrame = new CallFrame(this, _callFrame)
        const terms = [...this.terms]

        for (
            let currentPrecedence = OPERATOR_PRECEDENCES.length - 1;
            currentPrecedence >= 0;
            currentPrecedence--
        ) {
            this.calculateOperatorWithPrecedence(
                terms,
                currentPrecedence,
                scope,
                callFrame,
            )
        }

        if (terms.length === 1) return terms[0] as ValueTypes

        const [operator] = terms.filter(
            (term): term is Operator => term instanceof Operator,
        )

        throw new UnknownOperatorPrecedenceError({
            position: operator.position,
            resource: {
                operator,
            },
        })
    }

    calculateOperatorWithPrecedence(
        terms: (Evaluable | Operator)[],
        precedence: number,
        scope: Scope,
        callFrame: CallFrame,
    ) {
        const currentOperators = OPERATOR_PRECEDENCES[precedence]

        for (let i = 0; i < terms.length; i++) {
            const term = terms[i]

            const isOperator = term instanceof Operator
            const isCurrentPrecedence = currentOperators.includes(
                term.constructor as typeof Operator,
            )

            if (!isOperator || !isCurrentPrecedence) continue

            const leftTerm: Evaluable = terms[i - 1] as Evaluable
            const rightTerm: Evaluable = terms[i + 1] as Evaluable

            const left = leftTerm.execute(scope, callFrame)
            const right = rightTerm.execute(scope, callFrame)

            const result = term.call(left, right)
            terms.splice(i - 1, 3, result)

            i--
        }
    }

    toPrint(): string {
        return this.terms.map((term) => term.toPrint()).join(' ')
    }
}
