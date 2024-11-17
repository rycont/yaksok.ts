import { QuickJS } from '@yaksok-ts/quickjs'
import { yaksok } from '@yaksok-ts/core'

const quickJS = new QuickJS()
await quickJS.init()

yaksok({
    유틸: `
약속, (질문) 물어보기
    결과: "황선형"
`,
    main: `
(@유틸 ("이름이 뭐에요?") 물어보기) 보여주기
        `,
})
