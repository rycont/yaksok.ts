import { assertEquals, assertIsError, unreachable } from 'assert'
import { run } from '../runtime/run.ts'
import { parse } from '../prepare/parse/index.ts'
import { tokenize } from '../prepare/tokenize/index.ts'

import {
    Block,
    SetVariable,
    Evaluable,
    DeclareFunction,
    FunctionInvoke,
    Keyword,
    NumberValue,
    Variable,
} from '../node/index.ts'
import { Scope } from '../runtime/scope.ts'
import {
    CannotReturnOutsideFunctionError,
    FunctionMustHaveNameError,
    NotEvaluableParameterError,
} from '../error/index.ts'
import { CallFrame } from '../runtime/callFrame.ts'

Deno.test('Function that returns value', () => {
    const code = `
약속 가"와" 나"를 더하기"
    결과: 가 + 나

더한결과: 10와 20를 더하기
`
    const result = run(parse(tokenize(code)))
    assertEquals(result.getVariable('더한결과'), new NumberValue(30))
})

Deno.test('Function that returns nothing', () => {
    const code = `
약속 가"와" 나"를 더하기"
    아무것도아닌거: 가 + 나

더한결과: 10와 20를 더하기
`
    const result = run(parse(tokenize(code)))
    assertEquals(result.getVariable('더한결과'), new NumberValue(0))
})

Deno.test('Function invoke argument is not evaluable', async (context) => {
    const scope = new Scope()

    await context.step('Create function', () => {
        const testFunction = new DeclareFunction({
            name: '주문하기',
            body: new Block([
                new SetVariable({
                    name: new Variable({
                        name: new Keyword('나이'),
                    }),
                    value: new NumberValue(20),
                }),
                new SetVariable({
                    name: new Variable({
                        name: new Keyword('결과'),
                    }),
                    value: new NumberValue(10),
                }),
            ]),
        })

        testFunction.execute(scope)
    })

    await context.step('Invoke function with broken arguments', () => {
        const functionInvokation = new FunctionInvoke({
            음식: new Keyword('사과') as unknown as Evaluable,
            name: '주문하기',
        } as unknown as Record<string, Evaluable> & { name: string })

        try {
            functionInvokation.execute(scope, new CallFrame(functionInvokation))
            unreachable()
        } catch (e) {
            assertIsError(e, NotEvaluableParameterError)
        }
    })

    await context.step('Invoke function with no name', () => {
        try {
            new FunctionInvoke({
                음식: new Keyword('사과') as unknown as Evaluable,
            } as unknown as Record<string, Evaluable> & { name: string })
            unreachable()
        } catch (e) {
            assertIsError(e, FunctionMustHaveNameError)
        }
    })
})

Deno.test('Return outside function', () => {
    const code = `
결과: 10
약속 그만
`

    try {
        run(parse(tokenize(code)))
        unreachable()
    } catch (e) {
        assertIsError(e, CannotReturnOutsideFunctionError)
    }
})
