import { yaksok } from './index.ts'

yaksok({
    main: `
번역(javascript) 숫자1"와/과" 숫자2 "사이의 랜덤 수"
***
    return Math.floor(Math.random() * (숫자2 - 숫자1 + 1)) + 숫자1
***

10과 20 사이의 랜덤 수 보여주기
`,
})
