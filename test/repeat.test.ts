import { assertEquals, unreachable } from 'assert'
import { tokenizer } from '../tokenizer.ts'
import { preprocessor } from '../preprocessor.ts'
import { parse } from '../parser.ts'
import {
    BlockPiece,
    EOLPiece,
    NumberPiece,
    PrintPiece,
    RepeatPiece,
    StringPiece,
} from '../piece/index.ts'
import { run } from '../runtime.ts'

Deno.test('Parse Loop', () => {
    const code = `
반복
    "Hello, World!" 보여주기
`
    const ast = parse(tokenizer(preprocessor(code)))

    assertEquals(
        ast,
        new BlockPiece([
            new EOLPiece(),
            new RepeatPiece({
                body: new BlockPiece([
                    new PrintPiece({
                        value: new StringPiece('Hello, World!'),
                    }),
                    new EOLPiece(),
                    new EOLPiece(),
                ]),
            }),
            new EOLPiece(),
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
    try {
        const result = run(parse(tokenizer(preprocessor(code))))
        assertEquals(result.getVariable('횟수'), new NumberPiece(11))
    } catch (_) {
        unreachable()
    }
})
