import { assertEquals, assertIsError, unreachable } from 'assert'
import { Keyword, Variable, EOL, StringValue } from '../node/index.ts'
import { lexFunctionArgument } from '../prepare/tokenize/lexFunctionArgument.ts'
import {
    FunctionCannotHaveArgumentsInARowError,
    FunctionMustHaveOneOrMoreStringPartError,
} from '../error/index.ts'
import { Expression } from '../node/base.ts'

Deno.test('Preprocess tokens', () => {
    const tokens = [
        new Keyword('약속'),
        new Expression(','),
        new Expression('['),
        new Keyword('이름'),
        new Expression(']'),
        new Keyword('나이'),
    ]

    const result = lexFunctionArgument(tokens)

    assertEquals(result, {
        tokens: [
            new Keyword('약속'),
            new Expression(','),
            new Expression('['),
            new Variable('이름'),
            new Expression(']'),
            new Keyword('나이'),
        ],
        functionHeaders: [
            [
                new Expression('['),
                new Variable('이름'),
                new Expression(']'),
                new Keyword('나이'),
            ],
        ],
        ffiHeaders: [],
    })
})

Deno.test('Preprocess tokens with broken declaration: No static part', () => {
    const tokens = [
        new Keyword('약속'),
        new Expression(','),
        new Expression('['),
        new Keyword('이름'),
        new Expression(']'),
    ]

    try {
        lexFunctionArgument(tokens)
        unreachable()
    } catch (error) {
        assertIsError(error, FunctionMustHaveOneOrMoreStringPartError)
    }
})

Deno.test(
    'Preprocess tokens with broken declaration: Arguments in a row',
    () => {
        const tokens = [
            new Keyword('약속'),
            new Expression(','),
            new Expression('['),
            new Keyword('이름'),
            new Expression(']'),
            new Expression('['),
            new Keyword('나이'),
            new Expression(']'),
        ]

        try {
            lexFunctionArgument(tokens)
            unreachable()
        } catch (error) {
            assertIsError(error, FunctionCannotHaveArgumentsInARowError)
        }
    },
)
