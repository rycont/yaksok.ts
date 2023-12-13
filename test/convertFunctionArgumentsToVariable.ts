import { assertEquals } from 'assert'
import { Keyword, Variable, EOL, Expression } from '../nodes/index.ts'
import { convertFunctionArgumentsToVariable } from '../tokenize/convertFunctionArgumentsToVariable.ts'

Deno.test('Preprocess tokens', () => {
    const tokens = [
        new Keyword('약속'),
        new Keyword('이름'),
        new Keyword('나이'),
        new EOL(),
        new Keyword('약속'),
        new Keyword('나이'),
        new EOL(),
    ]

    const result = convertFunctionArgumentsToVariable(tokens)

    assertEquals(result, [
        new Keyword('약속'),
        new Variable({ name: new Keyword('이름') }),
        new Variable({ name: new Keyword('나이') }),
        new EOL(),
        new Keyword('약속'),
        new Variable({ name: new Keyword('나이') }),
        new EOL(),
    ])
})

Deno.test('Preprocess tokens with broken variable declaration', () => {
    const tokens = [new Keyword('약속'), new Expression(':')]

    const result = convertFunctionArgumentsToVariable(tokens)

    assertEquals(result, [new Keyword('약속'), new Expression(':')])
})
