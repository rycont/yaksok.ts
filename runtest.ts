import { parse } from './src/prepare/parse/index.ts'
import { convertTokensToNodes } from './src/prepare/tokenize/convert-tokens-to-nodes.ts'
import { tokenize } from './src/prepare/tokenize/index.ts'
import { Runtime } from './src/runtime/index.ts'

const code = `약속, 키가 (키)cm이고 몸무게가 (몸무게)kg일 때 비만도
    결과: 몸무게 / (키 / 100 * 키 / 100)

비만도: 키가 (177)cm이고 몸무게가 (68)kg일 때 비만도
비만도 보여주기`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

parse(tokenize(code), runtime)
