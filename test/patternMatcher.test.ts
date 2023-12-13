import { assertEquals } from 'assert'
import { parse } from '../parser/index.ts'

import { tokenize } from '../tokenize/index.ts'
import { KeywordPiece } from '../piece/basement.ts'
import { StringPiece } from '../piece/primitive.ts'
import {
    BinaryCalculationPiece,
    BlockPiece,
    DeclareVariablePiece,
    EOLPiece,
    PlusOperatorPiece,
    VariablePiece,
} from '../piece/index.ts'

Deno.test('Matching case: Wrapping class inherits from child class', () => {
    const code = `
이름: "홍길" + "동"    
`

    const result = parse(tokenize(code))

    assertEquals(
        result,
        new BlockPiece([
            new EOLPiece(),
            new DeclareVariablePiece({
                name: new VariablePiece({ name: new KeywordPiece('이름') }),
                value: new BinaryCalculationPiece({
                    left: new StringPiece('홍길'),
                    operator: new PlusOperatorPiece(),
                    right: new StringPiece('동'),
                }),
            }),
            new EOLPiece(),
        ]),
    )
})
