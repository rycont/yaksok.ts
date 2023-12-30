import { yaksok } from './index.ts'

const code = `
만약 "1031" = "1032" 이면
    "1.0.1" 보여주기
아니면 만약 "1033" = "1033" 이면
    "1.0.2" 보여주기
아니면
    "1.0.3" 보여주기
`

yaksok(code)
