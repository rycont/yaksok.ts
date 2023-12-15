import { assertEquals } from 'assert'
import { Keyword, Variable, EOL, Expression } from '../node/index.ts'
import { convertKeywordToVariable } from '../prepare/tokenize/convertKeywordToVariable.ts'

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

    const result = convertKeywordToVariable(tokens)

    assertEquals(result, {
        tokens: [
            new Keyword('약속'),
            new Variable({ name: new Keyword('이름') }),
            new Variable({ name: new Keyword('나이') }),
            new EOL(),
            new Keyword('약속'),
            new Variable({ name: new Keyword('나이') }),
            new EOL(),
        ],
        functionHeaders: [
            [
                new Variable({ name: new Keyword('이름') }),
                new Variable({ name: new Keyword('나이') }),
            ],
        ],
    })
})

Deno.test('Preprocess tokens with broken variable declaration', () => {
    const tokens = [new Keyword('약속'), new Expression(':')]

    const result = convertKeywordToVariable(tokens)

    assertEquals(result, {
        tokens: [new Keyword('약속'), new Expression(':')],
        functionHeaders: [[new Expression(':')]],
    })
})
