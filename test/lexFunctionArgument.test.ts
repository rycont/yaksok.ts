import { assertEquals, assertIsError, unreachable } from 'assert'
import { Keyword, Variable, EOL, StringValue } from '../node/index.ts'
import { lexFunctionArgument } from '../prepare/tokenize/lexFunctionArgument.ts'
import {
    FunctionCannotHaveArgumentsInARowError,
    FunctionMustHaveOneOrMoreStringPartError,
} from '../error/index.ts'

Deno.test('Preprocess tokens', () => {
    const tokens = [
        new Keyword('약속'),
        new Keyword('이름'),
        new StringValue('나이'),
        new EOL(),
        new Keyword('약속'),
        new StringValue('나이'),
        new EOL(),
    ]

    const result = lexFunctionArgument(tokens)

    assertEquals(result, {
        tokens: [
            new Keyword('약속'),
            new Variable('이름'),
            new StringValue('나이'),
            new EOL(),
            new Keyword('약속'),
            new StringValue('나이'),
            new EOL(),
        ],
        functionHeaders: [[new Variable('이름'), new StringValue('나이')]],
        ffiHeaders: [],
    })
})

Deno.test('Preprocess tokens with broken declaration: No static part', () => {
    const tokens = [new Keyword('약속'), new Keyword('똥')]

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
            new Keyword('나이'),
            new Keyword('이름'),
        ]

        try {
            lexFunctionArgument(tokens)
            unreachable()
        } catch (error) {
            assertIsError(error, FunctionCannotHaveArgumentsInARowError)
        }
    },
)
