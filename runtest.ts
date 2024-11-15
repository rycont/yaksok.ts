import { parse } from './src/prepare/parse/index.ts'
import { tokenize } from './src/prepare/tokenize/index.ts'
import { Runtime } from './src/runtime/index.ts'

const code = `약속, 키가 (키)cm이고 몸무게가 (몸무게)kg일 때 비만도
    결과: 몸무게 / (키 / 100 * 키 / 100)

비만도: 키가 (177)cm이고 몸무게가 (68)kg일 때 비만도
비만도 보여주기

번역(자바스크립트), (A)와 (B) 사이 랜덤한 정수
***
아진짜요
***

약속, (음식)을/를 (사람)와/과 먹기
    "맛있는 " + 음식 + ", " + 사람 + "의 입으로 모두 들어갑니다." 보여주기

"피자"를 "철수"와 먹기
`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

console.log(parse(tokenize(code), runtime).ast)
