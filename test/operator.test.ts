import { assertEquals, assertIsError, unreachable } from 'assert'
import { tokenize } from '../prepare/tokenize/index.ts'
import {
    AndOperator,
    Formula,
    Block,
    BooleanValue,
    SetVariable,
    DivideOperator,
    EOL,
    EqualOperator,
    Expression,
    GreaterThanOperator,
    GreaterThanOrEqualOperator,
    Keyword,
    LessThanOperator,
    LessThanOrEqualOperator,
    MinusOperator,
    MultiplyOperator,
    NumberValue,
    PlusOperator,
    StringValue,
    Variable,
} from '../node/index.ts'
import { Operator } from '../node/base.ts'
import { parse } from '../prepare/parse/index.ts'
import { run } from '../runtime/run.ts'

import {
    InvalidNumberOfOperandsError,
    InvalidTypeForOperatorError,
} from '../error/index.ts'
import { InvalidTypeForCompareError } from '../error/calculation.ts'

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

    const node = parse(result)

    assertEquals(
        node,
        new Block([
            new EOL(),
            new SetVariable({
                name: new Variable({
                    name: new Keyword('계산'),
                }),
                value: new Formula({
                    left: new NumberValue(1),
                    operator: new PlusOperator(),
                    right: new NumberValue(1),
                }),
            }),
            new EOL(),
        ]),
    )

    const scope = run(node)
    assertEquals(scope.getVariable('계산'), new NumberValue(2))
})

Deno.test('Operator String and String', async (context) => {
    await context.step('Plus', () => {
        const code = `
계산: "Hello" + " World" + "!"
        `

        const result = run(parse(tokenize(code)))

        assertEquals(
            result.getVariable('계산'),
            new StringValue('Hello World!'),
        )
    })

    await context.step('Plus Invalid', () => {
        const code = `
계산: "Hello" + [1, 2, 3]
        `

        try {
            run(parse(tokenize(code)))
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Minus', () => {
        try {
            const code = `
계산: "Hello" - " World" - "!"
            `
            run(parse(tokenize(code)))
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
            run(parse(tokenize(code)))
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
            run(parse(tokenize(code)))
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Equal', () => {
        const code = `
계산: "Hello" = " World"
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanValue(false))
    })

    await context.step('Less', () => {
        const code = `
계산: "Hello" < " World"
        `

        try {
            run(parse(tokenize(code)))
        } catch (e) {
            assertIsError(e, InvalidTypeForCompareError)
        }
    })

    await context.step('Less or equal', () => {
        const code = `
계산: "Hello" <= " World"
        `
        try {
            run(parse(tokenize(code)))
        } catch (e) {
            assertIsError(e, InvalidTypeForCompareError)
        }
    })

    await context.step('Greater', () => {
        const code = `
계산: "Hello" > " World"
        `

        try {
            run(parse(tokenize(code)))
        } catch (e) {
            assertIsError(e, InvalidTypeForCompareError)
        }
    })

    await context.step('Greater or equal', () => {
        const code = `
계산: "Hello" >= " World"
        `

        try {
            run(parse(tokenize(code)))
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

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new NumberValue(6))
    })

    await context.step('Minus', () => {
        const code = `
        계산: 1 - 2 - 3
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new NumberValue(-4))
    })

    await context.step('Multiply', () => {
        const code = `
        계산: 1 * 2 * 3
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new NumberValue(6))
    })

    await context.step('Divide', () => {
        const code = `
        계산: 1 / 2 / 3
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new NumberValue(1 / 6))
    })

    await context.step('Equal', () => {
        const code = `
        계산: 1 = 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanValue(false))
    })

    await context.step('Less', () => {
        const code = `
        계산: 1 < 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanValue(true))
    })

    await context.step('Less or equal', () => {
        const code = `
        계산: 1 <= 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanValue(true))
    })

    await context.step('Greater', () => {
        const code = `
        계산: 1 > 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanValue(false))
    })

    await context.step('Greater or equal', () => {
        const code = `
        계산: 1 >= 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanValue(false))
    })
})

Deno.test('Operator Number and String', async (context) => {
    await context.step('Plus', () => {
        const code = `
        계산: 1 + " World"
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new StringValue('1 World'))
    })

    await context.step('Minus', () => {
        try {
            const code = `
            계산: 1 - " World"
            `
            run(parse(tokenize(code)))
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Multiply', () => {
        const code = `
            계산: 2 * " World"
            `
        const result = run(parse(tokenize(code)))

        assertEquals(
            result.getVariable('계산'),
            new StringValue(' World World'),
        )
    })

    await context.step('Divide', () => {
        try {
            const code = `
            계산: 1 / " World"
            `
            run(parse(tokenize(code)))
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

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new StringValue('Hello1'))
    })

    await context.step('Minus', () => {
        try {
            const code = `
            계산: "Hello" - 1
            `
            run(parse(tokenize(code)))
            unreachable()
        } catch (e) {
            assertIsError(e, InvalidTypeForOperatorError)
        }
    })

    await context.step('Multiply', () => {
        const code = `
            계산: "Hello" * 3
            `
        const result = run(parse(tokenize(code)))

        assertEquals(
            result.getVariable('계산'),
            new StringValue('HelloHelloHello'),
        )
    })

    await context.step('Divide', () => {
        try {
            const code = `
            계산: "Hello" / 1
            `
            run(parse(tokenize(code)))
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
            run(parse(tokenize(code)))
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

    const result = run(parse(tokenize(code)))
    assertEquals(result.getVariable('계산'), new BooleanValue(true))
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
리스트1: [1, 2, 3]
리스트2: [1, 2, 3]

계산: 리스트1 = 리스트2
    `

    try {
        run(parse(tokenize(code)))
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
