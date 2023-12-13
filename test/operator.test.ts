import { assertEquals, assertIsError, unreachable } from 'assert'
import { tokenize } from '../tokenize/index.ts'
import {
    AndOperatorPiece,
    BinaryCalculationPiece,
    BlockPiece,
    BooleanPiece,
    DeclareVariablePiece,
    DivideOperatorPiece,
    EOLPiece,
    EqualOperatorPiece,
    ExpressionPiece,
    GreaterThanOperatorPiece,
    GreaterThanOrEqualOperatorPiece,
    KeywordPiece,
    LessThanOperatorPiece,
    LessThanOrEqualOperatorPiece,
    MinusOperatorPiece,
    MultiplyOperatorPiece,
    NumberPiece,
    PlusOperatorPiece,
    StringPiece,
    VariablePiece,
} from '../piece/index.ts'
import { OperatorPiece } from '../piece/basement.ts'
import { parse } from '../parser/index.ts'
import { run } from '../runtime.ts'

import { YaksokError } from '../errors.ts'

Deno.test('Parse Binary Calculation', () => {
    const code = `1 + 1`

    const result = tokenize(code)

    assertEquals(result, [
        new EOLPiece(),
        new NumberPiece(1),
        new OperatorPiece('+'),
        new NumberPiece(1),
        new EOLPiece(),
    ])
})

Deno.test('Parse Binary Calculation with Parentheses', () => {
    const code = `(1 + 1) * 2`

    const result = tokenize(code)

    assertEquals(result, [
        new EOLPiece(),
        new ExpressionPiece('('),
        new NumberPiece(1),
        new OperatorPiece('+'),
        new NumberPiece(1),
        new ExpressionPiece(')'),
        new OperatorPiece('*'),
        new NumberPiece(2),
        new EOLPiece(),
    ])
})

Deno.test('Run Binary Calculation', () => {
    const code = `
계산: 1 + 1
`

    const tokens = tokenize(code)
    assertEquals(tokens, [
        new EOLPiece(),
        new KeywordPiece('계산'),
        new ExpressionPiece(':'),
        new NumberPiece(1),
        new OperatorPiece('+'),
        new NumberPiece(1),
        new EOLPiece(),
    ])

    const ast = parse(tokens)
    assertEquals(
        ast,
        new BlockPiece([
            new EOLPiece(),
            new DeclareVariablePiece({
                name: new VariablePiece({
                    name: new KeywordPiece('계산'),
                }),
                value: new BinaryCalculationPiece({
                    left: new NumberPiece(1),
                    operator: new PlusOperatorPiece(),
                    right: new NumberPiece(1),
                }),
            }),
            new EOLPiece(),
        ]),
    )

    const result = run(ast)
    assertEquals(result.getVariable('계산'), new NumberPiece(2))
})

Deno.test('Operator String and String', async (context) => {
    await context.step('Plus', () => {
        const code = `
계산: "Hello" + " World" + "!"
        `

        const result = run(parse(tokenize(code)))

        assertEquals(
            result.getVariable('계산'),
            new StringPiece('Hello World!'),
        )
    })

    await context.step('Plus Invalid', () => {
        const code = `
계산: "Hello" + [1, 2, 3]
        `

        try {
            run(parse(tokenize(code)))
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_PLUS_OPERATOR')
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
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_MINUS_OPERATOR')
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
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_MULTIPLY_OPERATOR')
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
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_DIVIDE_OPERATOR')
        }
    })

    await context.step('Equal', () => {
        const code = `
계산: "Hello" = " World"
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanPiece(false))
    })

    await context.step('Less', () => {
        const code = `
계산: "Hello" < " World"
        `

        try {
            run(parse(tokenize(code)))
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_LESS_THAN_OPERATOR')
        }
    })

    await context.step('Less or equal', () => {
        const code = `
계산: "Hello" <= " World"
        `
        try {
            run(parse(tokenize(code)))
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_LESS_OR_EQUAL_OPERATOR')
        }
    })

    await context.step('Greater', () => {
        const code = `
계산: "Hello" > " World"
        `

        try {
            run(parse(tokenize(code)))
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_GREATER_THAN_OPERATOR')
        }
    })

    await context.step('Greater or equal', () => {
        const code = `
계산: "Hello" >= " World"
        `

        try {
            run(parse(tokenize(code)))
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(
                e.name,
                'INVALID_TYPE_FOR_GREATER_THAN_OR_EQUAL_OPERATOR',
            )
        }
    })
})

Deno.test('Operator Number and Number', async (context) => {
    await context.step('Plus', () => {
        const code = `
        계산: 1 + 2 + 3
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new NumberPiece(6))
    })

    await context.step('Minus', () => {
        const code = `
        계산: 1 - 2 - 3
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new NumberPiece(-4))
    })

    await context.step('Multiply', () => {
        const code = `
        계산: 1 * 2 * 3
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new NumberPiece(6))
    })

    await context.step('Divide', () => {
        const code = `
        계산: 1 / 2 / 3
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new NumberPiece(1 / 6))
    })

    await context.step('Equal', () => {
        const code = `
        계산: 1 = 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanPiece(false))
    })

    await context.step('Less', () => {
        const code = `
        계산: 1 < 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanPiece(true))
    })

    await context.step('Less or equal', () => {
        const code = `
        계산: 1 <= 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanPiece(true))
    })

    await context.step('Greater', () => {
        const code = `
        계산: 1 > 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanPiece(false))
    })

    await context.step('Greater or equal', () => {
        const code = `
        계산: 1 >= 2
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new BooleanPiece(false))
    })
})

Deno.test('Operator Number and String', async (context) => {
    await context.step('Plus', () => {
        const code = `
        계산: 1 + " World"
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new StringPiece('1 World'))
    })

    await context.step('Minus', () => {
        try {
            const code = `
            계산: 1 - " World"
            `
            run(parse(tokenize(code)))
            unreachable()
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_MINUS_OPERATOR')
        }
    })

    await context.step('Multiply', () => {
        try {
            const code = `
            계산: 1 * " World"
            `
            run(parse(tokenize(code)))
            unreachable()
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_MULTIPLY_OPERATOR')
        }
    })

    await context.step('Divide', () => {
        try {
            const code = `
            계산: 1 / " World"
            `
            run(parse(tokenize(code)))
            unreachable()
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_DIVIDE_OPERATOR')
        }
    })
})

Deno.test('Operator String and Number', async (context) => {
    await context.step('Plus', () => {
        const code = `
        계산: "Hello" + 1
        `

        const result = run(parse(tokenize(code)))

        assertEquals(result.getVariable('계산'), new StringPiece('Hello1'))
    })

    await context.step('Minus', () => {
        try {
            const code = `
            계산: "Hello" - 1
            `
            run(parse(tokenize(code)))
            unreachable()
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_MINUS_OPERATOR')
        }
    })

    await context.step('Multiply', () => {
        const code = `
            계산: "Hello" * 3
            `
        const result = run(parse(tokenize(code)))

        assertEquals(
            result.getVariable('계산'),
            new StringPiece('HelloHelloHello'),
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
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_DIVIDE_OPERATOR')
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
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_TYPE_FOR_AND_OPERATOR')
        }
    })
})

Deno.test('Operator Boolean and Boolean', async (context) => {
    const code = `
식1: 10 > 3
식2: 2 = 2

계산: 식1 이고 식2
    `

    const result = run(parse(tokenize(code)))
    assertEquals(result.getVariable('계산'), new BooleanPiece(true))
})

Deno.test('Binary operator operand exceedance', async (context) => {
    await context.step('Plus', () => {
        try {
            new PlusOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })

    await context.step('Minus', () => {
        try {
            new MinusOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })

    await context.step('Multiply', () => {
        try {
            new MultiplyOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })

    await context.step('Divide', () => {
        try {
            new DivideOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })

    await context.step('Equal', () => {
        try {
            new EqualOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })

    await context.step('Less', () => {
        try {
            new LessThanOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })

    await context.step('Less or equal', () => {
        try {
            new LessThanOrEqualOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })

    await context.step('Greater', () => {
        try {
            new GreaterThanOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })

    await context.step('Greater or equal', () => {
        try {
            new GreaterThanOrEqualOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })

    await context.step('And', () => {
        try {
            new AndOperatorPiece().call(
                new NumberPiece(1),
                new NumberPiece(2),
                new NumberPiece(3),
            )
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'INVALID_NUMBER_OF_OPERANDS')
        }
    })
})

Deno.test('Compare equity list and list', async (context) => {
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
