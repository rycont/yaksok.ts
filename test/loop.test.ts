import { assertEquals, assertIsError, unreachable } from 'assert'

import {
    NumberValue,
    StringValue,
    Block,
    Print,
    Loop,
    EOL,
} from '../node/index.ts'
import { BreakNotInLoopError } from '../error/index.ts'
import { tokenize } from '../prepare/tokenize/index.ts'
import { CannotParseError } from '../error/prepare.ts'
import { parse } from '../prepare/parse/index.ts'
import { yaksok } from '../index.ts'

Deno.test('Parse Loop', () => {
    const code = `
반복
    "Hello, World!" 보여주기
`
    const { ast } = parse(tokenize(code, true))

    assertEquals(
        ast,
        new Block([
            new EOL(),
            new Loop(
                new Block([
                    new Print(new StringValue('Hello, World!')),
                    new EOL(),
                ]),
            ),
            new EOL(),
        ]),
    )
})

Deno.test('Run loop', () => {
    const code = `
횟수: 500
반복
    횟수: 횟수 - 1
    만약 횟수 = 11 이면
        반복 그만
`
    const { scope } = yaksok(code).getRunner()
    assertEquals(scope.getVariable('횟수'), new NumberValue(11))
})

Deno.test('Break outside loop', () => {
    const code = `
횟수: 500
반복 그만
`

    try {
        yaksok(code)
        unreachable()
    } catch (e) {
        assertIsError(e, BreakNotInLoopError)
    }
})

Deno.test('Loop with broken body', () => {
    const code = `
반복
    숫자 보여주 기
        `
    try {
        yaksok(code)
        unreachable()
    } catch (e) {
        assertIsError(e, CannotParseError)
    }
})
