import { yaksok } from '@yaksok-ts/core'
import { QuickJS } from '@yaksok-ts/quickjs'

const quickJS = new QuickJS({
    prompt: () => {
        return '10'
    },
})

await quickJS.init()

await yaksok({
    아두이노: `
약속, 이름
    결과: "아두이노" / 2
`,
    main: '(@아두이노 이름) 보여주기',
})
