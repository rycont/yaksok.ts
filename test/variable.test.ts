import { assertEquals, assertIsError, unreachable } from 'assert'
import { tokenize } from '../tokenize.ts'
import { parse } from '../parser.ts'
import {
    BinaryCalculationPiece,
    BlockPiece,
    DeclareVariablePiece,
    EOLPiece,
    KeywordPiece,
    NumberPiece,
    PlusOperatorPiece,
    VariablePiece,
} from '../piece/index.ts'

import { run } from '../runtime.ts'
import { YaksokError } from '../errors.ts'

Deno.test('Parse Variable', () => {
    const node = parse(tokenize('이름: 1'))

    assertEquals(
        node,
        new BlockPiece([
            new EOLPiece(),
            new DeclareVariablePiece({
                name: new VariablePiece({ name: new KeywordPiece('이름') }),
                value: new NumberPiece(1),
            }),
            new EOLPiece(),
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
        new BlockPiece([
            new EOLPiece(),
            new DeclareVariablePiece({
                name: new VariablePiece({ name: new KeywordPiece('나이') }),
                value: new NumberPiece(1),
            }),
            new DeclareVariablePiece({
                name: new VariablePiece({ name: new KeywordPiece('나이') }),
                value: new BinaryCalculationPiece({
                    left: new VariablePiece({ name: new KeywordPiece('나이') }),
                    operator: new PlusOperatorPiece(),
                    right: new NumberPiece(1),
                }),
            }),
            new EOLPiece(),
        ]),
    )
})

Deno.test('Evaluate and calculate variable', () => {
    const code = `
나이: 10
나이: 이전 나이 + 1
`
    const scope = run(parse(tokenize(code)))
    assertEquals(scope.getVariable('나이'), new NumberPiece(11))
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
