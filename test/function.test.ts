import { assertEquals, assertIsError, unreachable } from 'assert'
import { run } from '../runtime.ts'
import { parse } from '../parser/index.ts'
import { tokenize } from '../tokenize/index.ts'

import {
    BlockPiece,
    DeclareVariablePiece,
    EvaluatablePiece,
    FunctionDeclarationPiece,
    FunctionInvokePiece,
    KeywordPiece,
    NumberPiece,
    VariablePiece,
} from '../piece/index.ts'
import { CallFrame, Scope } from '../scope.ts'
import { YaksokError } from '../errors.ts'

Deno.test('Function that returns value', () => {
    const code = `
약속 가"와" 나"를 더하기"
    결과: 가 + 나

더한결과: 10와 20를 더하기
`
    const result = run(parse(tokenize(code)))
    assertEquals(result.getVariable('더한결과'), new NumberPiece(30))
})

Deno.test('Function that returns nothing', () => {
    const code = `
약속 가"와" 나"를 더하기"
    아무것도아닌거: 가 + 나

더한결과: 10와 20를 더하기
`
    const result = run(parse(tokenize(code)))
    assertEquals(result.getVariable('더한결과'), new NumberPiece(0))
})

Deno.test('Function invoke argument is not evaluable', async (context) => {
    const scope = new Scope()

    await context.step('Create function', () => {
        const testFunction = new FunctionDeclarationPiece({
            name: '주문하기',
            body: new BlockPiece([
                new DeclareVariablePiece({
                    name: new VariablePiece({
                        name: new KeywordPiece('나이'),
                    }),
                    value: new NumberPiece(20),
                }),
                new DeclareVariablePiece({
                    name: new VariablePiece({
                        name: new KeywordPiece('결과'),
                    }),
                    value: new NumberPiece(10),
                }),
            ]),
        })

        testFunction.execute(scope)
    })

    await context.step('Invoke function with broken arguments', () => {
        const functionInvokation = new FunctionInvokePiece({
            음식: new KeywordPiece('사과') as unknown as EvaluatablePiece,
            name: '주문하기',
        } as unknown as Record<string, EvaluatablePiece> & { name: string })

        try {
            functionInvokation.execute(scope, new CallFrame(functionInvokation))
            unreachable()
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'NOT_EVALUABLE_EXPRESSION')
        }
    })

    await context.step('Invoke function with no name', () => {
        const functionInvokation = new FunctionInvokePiece({
            음식: new KeywordPiece('사과') as unknown as EvaluatablePiece,
        } as unknown as Record<string, EvaluatablePiece> & { name: string })

        try {
            functionInvokation.execute(scope, new CallFrame(functionInvokation))
            unreachable()
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.name, 'FUNCTION_MUST_HAVE_NAME')
        }
    })
})
