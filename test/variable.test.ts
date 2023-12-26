import { assertEquals, assertIsError, unreachable } from 'assert'
import { tokenize } from '../prepare/tokenize/index.ts'
import { _LEGACY__parse } from '../prepare/parse/index.ts'
import {
    Block,
    SetVariable,
    EOL,
    Keyword,
    NumberValue,
    PlusOperator,
    Variable,
} from '../node/index.ts'

import { run } from '../runtime/run.ts'
import { CannotUseReservedWordForVariableNameError } from '../error/index.ts'
import { Formula } from '../node/calculation.ts'
import { Print } from '../node/misc.ts'
import { NotDefinedVariableError } from '../error/variable.ts'

Deno.test('Parse Variable', () => {
    const node = _LEGACY__parse(tokenize('이름: 1', true))

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
    const node = _LEGACY__parse(tokenize(code, true))

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
                value: new Formula({
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
    const scope = run(_LEGACY__parse(tokenize(code)))
    assertEquals(scope.getVariable('나이'), new NumberValue(11))
})

Deno.test('Reserved word cannot be used as variable name', () => {
    const code = `만약: 10`

    try {
        run(_LEGACY__parse(tokenize(code)))
        unreachable()
    } catch (e) {
        assertIsError(e, CannotUseReservedWordForVariableNameError)
    }
})

Deno.test("Get not defined variable's value", () => {
    const ast = new Block([
        new Print({
            value: new Variable({ name: new Keyword('나이') }),
        }),
    ])

    try {
        run(ast)
        unreachable()
    } catch (e) {
        assertIsError(e, NotDefinedVariableError)
        assertEquals(e.resource?.name, '나이')
    }
})
