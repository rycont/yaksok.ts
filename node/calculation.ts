import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import {
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

const PRECEDENCE: Array<(typeof Operator)[]> = [
    [], // 0 (safety area)
    [
        EqualOperator,
        LessThanOperator,
        GreaterThanOperator,
        LessThanOrEqualOperator,
        GreaterThanOrEqualOperator,
    ], // 1
    [MinusOperator, PlusOperator], // 2
    [MultiplyOperator, DivideOperator], // 3
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
        let currentPrecedence = PRECEDENCE.length - 1

        const terms = [...this.terms]

        while (currentPrecedence > 0) {
            const currentOperators = PRECEDENCE[currentPrecedence]

            for (let i = 0; i < terms.length; i++) {
                const term = terms[i]
                if (
                    !(term instanceof Operator) ||
                    !currentOperators.includes(
                        term.constructor as typeof Operator,
                    )
                )
                    continue

                const left = (terms[i - 1] as Evaluable).execute(
                    scope,
                    callFrame,
                )
                const right = (terms[i + 1] as Evaluable).execute(
                    scope,
                    callFrame,
                )

                const result = term.call(left, right)
                terms.splice(i - 1, 3, result)

                i--
            }

            currentPrecedence--
        }

        return terms[0] as ValueTypes
    }
}

// 1 + 2 * 3 / (4 - 5) to be
/*
Formula {
    terms: [
        NumberValue { value: 1 },
        PlusOperator {},
        NumberValue { value: 2 },
        MultiplyOperator {},
        NumberValue { value: 3 },
        DivideOperator {},
        ValueGroup {
            value: Formula {
                terms: [
                    NumberValue { value: 4 },
                    MinusOperator {},
                    NumberValue { value: 5 }
                ]
            }
        }
    ]
}
*/
