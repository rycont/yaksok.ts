import { Tokenizer } from './src/prepare/tokenize/index.ts'

const code = `"청량리부터 안동까지 KTX 이음을 타면" 보여주기
(@코레일 (@차종 KTX이음)으로 (@역간거리 ("청량리")부터 ("안동")까지)km을 이동할 때 운임) + "원" 보여주기

"판교부터 충주까지 무궁화호를 타면" 보여주기
(@코레일 (@차종 무궁화호)으로 (@역간거리 ("판교")부터 ("충주")까지)km을 이동할 때 운임) + "원" 보여주기

@코레일 출발하기`

const result = Tokenizer.run(code)

console.table(
    result.map((r) => ({ value: r.value.slice(0, 10), position: r.position })),
)
