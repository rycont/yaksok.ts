import { assertEquals, assertIsError, unreachable } from 'assert'
import { tokenize } from '../tokenize/index.ts'
import { parse } from '../parse/index.ts'
import {
    BinaryOperation,
    Block,
    SetVariable,
    EOL,
    Keyword,
    NumberValue,
    PlusOperator,
    Variable,
} from '../node/index.ts'

import { run } from '../runtime/run.ts'
import { YaksokError } from '../errors.ts'

Deno.test('Parse Variable', () => {
    const node = parse(tokenize('이름: 1'))

    assertEquals(
        node,
        new Block([
            new EOL(),
            new SetVariable({
                name: new Variable({ name: new Keyword('이름') }),
                value: new NumberValue(1),
            }),
            new EOL(),
        ]),
    )
})

Deno.test('Parse variable with 이전 keyword', () => {
    const code = `
나이: 1
나이: 이전 나이 + 1    
`
    const node = parse(tokenize(code))

    assertEquals(
        node,
        new Block([
            new EOL(),
            new SetVariable({
                name: new Variable({ name: new Keyword('나이') }),
                value: new NumberValue(1),
            }),
            new SetVariable({
                name: new Variable({ name: new Keyword('나이') }),
                value: new BinaryOperation({
                    left: new Variable({ name: new Keyword('나이') }),
                    operator: new PlusOperator(),
                    right: new NumberValue(1),
                }),
            }),
            new EOL(),
        ]),
    )
})

Deno.test('Evaluate and calculate variable', () => {
    const code = `
나이: 10
나이: 이전 나이 + 1
`
    const scope = run(parse(tokenize(code)))
    assertEquals(scope.getVariable('나이'), new NumberValue(11))
})

Deno.test('Reserved word cannot be used as variable name', () => {
    const code = `만약: 10`

    try {
        run(parse(tokenize(code)))
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'CANNOT_USE_RESERVED_WORD_FOR_VARIABLE_NAME')
    }
})
