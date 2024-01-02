import { assertEquals, assertIsError, unreachable } from 'assert'

import {
    InvalidTypeForCompareError,
    UnknownOperatorPrecedenceError,
} from '../error/calculation.ts'
import {
    InvalidNumberOfOperandsError,
    InvalidTypeForOperatorError,
} from '../error/index.ts'
import { yaksok } from '../index.ts'
import { Operator } from '../node/base.ts'
import {
    AndOperator,
    Block,
    BooleanValue,
    DivideOperator,
    EOL,
    EqualOperator,
    Expression,
    Formula,
    GreaterThanOperator,
    GreaterThanOrEqualOperator,
    Keyword,
    LessThanOperator,
    LessThanOrEqualOperator,
    MinusOperator,
    MultiplyOperator,
    NumberValue,
    PlusOperator,
    SetVariable,
    StringValue,
} from '../node/index.ts'
import { parse } from '../prepare/parse/index.ts'
import { tokenize } from '../prepare/tokenize/index.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'

Deno.test('Parse Binary Operation', () => {
    const code = `1 + 1`

    const { tokens } = tokenize(code, true)

    assertEquals(tokens, [
        new EOL(),
        new NumberValue(1),
        new Operator('+'),
        new NumberValue(1),
        new EOL(),
    ])
})

Deno.test('Parse Binary Operation with Parentheses', () => {
    const code = `(1 + 1) * 2`

    const { tokens } = tokenize(code, true)

    assertEquals(tokens, [
        new EOL(),
        new Expression('('),
        new NumberValue(1),
        new Operator('+'),
        new NumberValue(1),
        new Expression(')'),
        new Operator('*'),
        new NumberValue(2),
        new EOL(),
    ])
})

Deno.test('Run Binary Operation', () => {
    const code = `
계산: 1 + 1
`

    const result = tokenize(code, true)

    assertEquals(result.tokens, [
        new EOL(),
        new Keyword('계산'),
        new Expression(':'),
        new NumberValue(1),
        new Operator('+'),
        new NumberValue(1),
        new EOL(),
    ])

    const { ast } = parse(result)

    assertEquals(
        ast,
        new Block([
            new EOL(),
            new SetVariable(
                '계산',
                new Formula([
                    new NumberValue(1),
                    new PlusOperator(),
                    new NumberValue(1),
                ]),
            ),
            new EOL(),
        ]),
    )

    const { scope } = yaksok(code).getRunner()
    assertEquals(scope.getVariable('계산'), new NumberValue(2))
})

Deno.test('Operator String and String', async (context) => {
    await context.step('Plus', () => {
        const code = `
계산: "Hello" + " World" + "!"
        `

        const { scope } = yaksok(code).getRunner()

        assertEquals(scope.getVariable('계산'), new StringValue('Hello World!'))
    })

    await context.step('Plus Invalid', () => {
        const code = `
계산: "Hello" + [1, 2, 3]
        `

        try {
            yaksok(code).getRunner()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Minus', () => {
        try {
            const code = `
계산: "Hello" - " World" - "!"
            `
            yaksok(code).getRunner()
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Multiply', () => {
        try {
            const code = `
계산: "Hello" * " World"
            `
            yaksok(code).getRunner()
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Divide', () => {
        try {
            const code = `
계산: "Hello" / " World"
            `
            yaksok(code).getRunner()
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Equal', () => {
        const code = `
계산: "Hello" = " World"
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new BooleanValue(false))
    })

    await context.step('Less', () => {
        const code = `
계산: "Hello" < " World"
        `

        try {
            yaksok(code).getRunner()
        } catch (e) {
            assertIsError(e, InvalidTypeForCompareError)
        }
    })

    await context.step('Less or equal', () => {
        const code = `
계산: "Hello" <= " World"
        `
        try {
            yaksok(code).getRunner()
        } catch (e) {
            assertIsError(e, InvalidTypeForCompareError)
        }
    })

    await context.step('Greater', () => {
        const code = `
계산: "Hello" > " World"
        `

        try {
            yaksok(code).getRunner()
        } catch (e) {
            assertIsError(e, InvalidTypeForCompareError)
        }
    })

    await context.step('Greater or equal', () => {
        const code = `
계산: "Hello" >= " World"
        `

        try {
            yaksok(code).getRunner()
        } catch (e) {
            assertIsError(e, InvalidTypeForCompareError)
        }
    })
})

Deno.test('Operator Number and Number', async (context) => {
    await context.step('Plus', () => {
        const code = `
        계산: 1 + 2 + 3
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new NumberValue(6))
    })

    await context.step('Minus', () => {
        const code = `
        계산: 1 - 2 - 3
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new NumberValue(-4))
    })

    await context.step('Multiply', () => {
        const code = `
        계산: 1 * 2 * 3
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new NumberValue(6))
    })

    await context.step('Divide', () => {
        const code = `
        계산: 1 / 2 / 3
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new NumberValue(1 / 6))
    })

    await context.step('Equal', () => {
        const code = `
        계산: 1 = 2
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new BooleanValue(false))
    })

    await context.step('Less', () => {
        const code = `
        계산: 1 < 2
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new BooleanValue(true))
    })

    await context.step('Less or equal', () => {
        const code = `
        계산: 1 <= 2
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new BooleanValue(true))
    })

    await context.step('Greater', () => {
        const code = `
        계산: 1 > 2
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new BooleanValue(false))
    })

    await context.step('Greater or equal', () => {
        const code = `
        계산: 1 >= 2
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new BooleanValue(false))
    })
})

Deno.test('Operator Number and String', async (context) => {
    await context.step('Plus', () => {
        const code = `
        계산: 1 + " World"
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new StringValue('1 World'))
    })

    await context.step('Minus', () => {
        try {
            const code = `
            계산: 1 - " World"
            `
            yaksok(code).getRunner()
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Multiply', () => {
        const code = `
            계산: 2 * " World"
            `
        const { scope } = yaksok(code).getRunner()

        assertEquals(scope.getVariable('계산'), new StringValue(' World World'))
    })

    await context.step('Divide', () => {
        try {
            const code = `
            계산: 1 / " World"
            `
            yaksok(code).getRunner()
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })
})

Deno.test('Operator String and Number', async (context) => {
    await context.step('Plus', () => {
        const code = `
        계산: "Hello" + 1
        `

        const { scope } = yaksok(code).getRunner()
        assertEquals(scope.getVariable('계산'), new StringValue('Hello1'))
    })

    await context.step('Minus', () => {
        try {
            const code = `
            계산: "Hello" - 1
            `
            yaksok(code).getRunner()
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Multiply', () => {
        const code = `
            계산: "Hello" * 3
            `
        const { scope } = yaksok(code).getRunner()

        assertEquals(
            scope.getVariable('계산'),
            new StringValue('HelloHelloHello'),
        )
    })

    await context.step('Divide', () => {
        try {
            const code = `
            계산: "Hello" / 1
            `
            yaksok(code).getRunner()
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('And', () => {
        const code = `
계산: "Hello" 이고 1
            `
        try {
            yaksok(code).getRunner()
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })
})

Deno.test('Operator Boolean and Boolean', () => {
    const code = `
식1: 10 > 3
식2: 2 = 2

계산: 식1 이고 식2
    `

    const { scope } = yaksok(code).getRunner()
    assertEquals(scope.getVariable('계산'), new BooleanValue(true))
})

Deno.test('Binary operator operand exceedance', async (context) => {
    await context.step('Plus', () => {
        try {
            new PlusOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })

    await context.step('Minus', () => {
        try {
            new MinusOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })

    await context.step('Multiply', () => {
        try {
            new MultiplyOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })

    await context.step('Divide', () => {
        try {
            new DivideOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })

    await context.step('Equal', () => {
        try {
            new EqualOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })

    await context.step('Less', () => {
        try {
            new LessThanOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })

    await context.step('Less or equal', () => {
        try {
            new LessThanOrEqualOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })

    await context.step('Greater', () => {
        try {
            new GreaterThanOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })

    await context.step('Greater or equal', () => {
        try {
            new GreaterThanOrEqualOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })

    await context.step('And', () => {
        try {
            new AndOperator().call(
                new NumberValue(1),
                new NumberValue(2),
                new NumberValue(3),
            )
        } catch (e) {
            assertIsError(e, InvalidNumberOfOperandsError)
        }
    })
})

Deno.test('Compare equity list and list', () => {
    const code = `
목록1: [1, 2, 3]
목록2: [1, 2, 3]

계산: 목록1 = 목록2
    `

    try {
        yaksok(code).getRunner()
        unreachable()
    } catch (e) {
        assertIsError(e)
        assertEquals(
            e.message,
            "Evaluation equality between non-primitive values isn't supported yet.",
        )
    }
})

Deno.test('Raw Operator toPrint', () => {
    assertEquals(new Operator().toPrint(), 'unknown')
    assertEquals(new Operator('+').toPrint(), '+')
    assertEquals(new Operator('-').toPrint(), '-')
    assertEquals(new Operator('*').toPrint(), '*')
    assertEquals(new Operator('/').toPrint(), '/')
})

Deno.test('Unknown Operator', () => {
    const formula = new Formula([
        new NumberValue(1),
        new Operator('NICE'),
        new NumberValue(2),
    ])

    const scope = new Scope()
    const callFrame = new CallFrame(formula)

    try {
        formula.execute(scope, callFrame)
    } catch (e) {
        assertIsError(e, UnknownOperatorPrecedenceError)
    }
})
