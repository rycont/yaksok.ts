import { assertEquals } from 'assert'
import { parse } from '../parser.ts'
import { BlockPiece } from '../piece/block.ts'
import { BinaryCalculationPiece } from '../piece/calculation.ts'
import { EOLPiece } from '../piece/misc.ts'
import { EqualOperatorPiece } from '../piece/operator.ts'
import { NumberPiece } from '../piece/primitive.ts'

import { tokenize } from '../tokenize.ts'
import {
    ConditionPiece,
    DeclareVariablePiece,
    KeywordPiece,
    VariablePiece,
} from '../piece/index.ts'

Deno.test('Parse with indent', () => {
    const code = `
만약 1 = 1 이면
    만약 2 = 2 이면
        값: 5
    아니면
        값: 6
아니면
    값: 3
`

    const result = parse(tokenize(code))

    assertEquals(
        result,
        new BlockPiece([
            new EOLPiece(),
            new ConditionPiece({
                ifBody: new ConditionPiece({
                    condition: new BinaryCalculationPiece({
                        left: new NumberPiece(1),
                        operator: new EqualOperatorPiece(),
                        right: new NumberPiece(1),
                    }),
                    body: new BlockPiece([
                        new ConditionPiece({
                            ifBody: new ConditionPiece({
                                condition: new BinaryCalculationPiece({
                                    left: new NumberPiece(2),
                                    operator: new EqualOperatorPiece(),
                                    right: new NumberPiece(2),
                                }),
                                body: new BlockPiece([
                                    new DeclareVariablePiece({
                                        name: new VariablePiece({
                                            name: new KeywordPiece('값'),
                                        }),
                                        value: new NumberPiece(5),
                                    }),
                                    new EOLPiece(),
                                ]),
                            }),
                            elseBody: new BlockPiece([
                                new DeclareVariablePiece({
                                    name: new VariablePiece({
                                        name: new KeywordPiece('값'),
                                    }),
                                    value: new NumberPiece(6),
                                }),
                                new EOLPiece(),
                            ]),
                        }),
                        new EOLPiece(),
                    ]),
                }),

                elseBody: new BlockPiece([
                    new DeclareVariablePiece({
                        name: new VariablePiece({
                            name: new KeywordPiece('값'),
                        }),
                        value: new NumberPiece(3),
                    }),
                    new EOLPiece(),
                ]),
            }),
            new EOLPiece(),
        ]),
    )
})
