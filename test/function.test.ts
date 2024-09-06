import { assert, assertEquals, assertIsError, unreachable } from 'assert'

import {
    CannotReturnOutsideFunctionError,
    NotEvaluableParameterError,
    FunctionMustHaveOneOrMoreStringPartError,
    CannotParseError,
} from '../error/index.ts'
import { yaksok } from '../index.ts'
import {
    Block,
    DeclareFunction,
    Evaluable,
    FunctionInvoke,
    Keyword,
    NumberValue,
    SetVariable,
} from '../node/index.ts'
import { run } from '../runtime/run.ts'
import { Scope } from '../runtime/scope.ts'

Deno.test('Function that returns value', () => {
    const code = `
약속 가"와" 나"를 더하기"
    결과: 가 + 나

더한결과: 10와 20를 더하기
`
    const { scope } = yaksok(code).getRunner()

    assert('가 와 나 를 더하기' in scope.functions)
    assertEquals(scope.getVariable('더한결과'), new NumberValue(30))
})

Deno.test('Function that returns nothing', () => {
    const code = `
약속 가"와" 나"를 더하기"
    아무것도아닌거: 가 + 나

더한결과: 10와 20를 더하기
`
    const { scope: result } = yaksok(code).getRunner()
    assertEquals(result.getVariable('더한결과'), new NumberValue(0))
})

Deno.test('Function invoke argument is not evaluable', async (context) => {
    const scope = new Scope()

    await context.step('Create function', () => {
        const testFunction = new DeclareFunction({
            name: '주문하기',
            body: new Block([
                new SetVariable('나이', new NumberValue(20)),
                new SetVariable('결과', new NumberValue(10)),
            ]),
        })

        testFunction.execute(scope)
    })

    await context.step('Invoke function with broken arguments', () => {
        const functionInvokation = new FunctionInvoke({
            name: '주문하기',
            params: {
                음식: new Keyword('사과') as unknown as Evaluable,
            },
        })

        try {
            run(functionInvokation, scope)
            unreachable()
        } catch (e) {
            assertIsError(e, NotEvaluableParameterError)
        }
    })
})

Deno.test('Return outside function', () => {
    const code = `
결과: 10
약속 그만
"이건 약속 선언이 아니야" 보여주기
`

    try {
        yaksok(code)
        unreachable()
    } catch (e) {
        assertIsError(e, CannotReturnOutsideFunctionError)
    }
})

Deno.test('Function with broken body', () => {
    const code = `
약속 "숫자보여주기"
    숫자 보여주 기
    
숫자보여주기
        `
    try {
        yaksok(code)
        unreachable()
    } catch (e) {
        assertIsError(e, CannotParseError)
    }
})

Deno.test('Function with no valid string part', () => {
    const code = `
약속 놀기
    결과: "똥"

놀기 보여주기`

    try {
        yaksok(code)
        unreachable()
    } catch (e) {
        assertIsError(e, FunctionMustHaveOneOrMoreStringPartError)
    }
})
