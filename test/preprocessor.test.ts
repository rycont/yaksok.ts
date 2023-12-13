import { assertEquals } from 'assert';
import { KeywordPiece, VariablePiece, EOLPiece, ExpressionPiece } from '../piece/index.ts';
import { parserPreprocessor } from "../parser/preprocessor.ts";

Deno.test('Preprocess tokens', () => {
    const tokens = [
        new KeywordPiece('약속'),
        new KeywordPiece('이름'),
        new KeywordPiece('나이'),
        new EOLPiece(),
        new KeywordPiece('약속'),
        new KeywordPiece('나이'),
        new EOLPiece(),
    ];

    const result = parserPreprocessor(tokens);

    assertEquals(result, [
        new KeywordPiece('약속'),
        new VariablePiece({ name: new KeywordPiece('이름') }),
        new VariablePiece({ name: new KeywordPiece('나이') }),
        new EOLPiece(),
        new KeywordPiece('약속'),
        new VariablePiece({ name: new KeywordPiece('나이') }),
        new EOLPiece(),
    ]);
});

Deno.test('Preprocess tokens with broken variable declaration', () => {
    const tokens = [
        new KeywordPiece('약속'),
        new ExpressionPiece(':'),
    ];

    const result = parserPreprocessor(tokens);

    assertEquals(result, [
        new KeywordPiece('약속'),
        new ExpressionPiece(':'),
    ]);
})
