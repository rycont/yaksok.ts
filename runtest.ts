import { yaksok } from './index.ts'
import { getQuickJS } from 'npm:quickjs-emscripten'
import { NumberValue, StringValue, type PrimitiveTypes } from './node/index.ts'

const quickJSRuntime = await getQuickJS()

yaksok(
    `
번역(QuickJS), (문자열)을 (횟수)번 반복하기
***
    return 문자열.repeat(횟수)
***

("*")을 (3)번 반복하기 보여주기
`,
    {
        runFFI(runtime, bodyCode, args) {
            if (runtime !== 'QuickJS') {
                throw new Error(`Unknown runtime: ${runtime}`)
            }

            const wrappedCode = createWrapperCodeFromFFICall(bodyCode, args)

            const vm = quickJSRuntime.newContext()
            const result = vm.evalCode(wrappedCode)

            if (result.error) {
                console.log(vm.dump(result.error))
                result.error.dispose()
            } else {
                const resultValue = vm.dump(result.value)
                result.value.dispose()

                if (typeof resultValue === 'string') {
                    return new StringValue(resultValue)
                } else if (typeof resultValue === 'number') {
                    return new NumberValue(resultValue)
                }
            }
        },
    },
)

function createWrapperCodeFromFFICall(
    bodyCode: string,
    args: Record<string, any>,
) {
    const parameters = Object.keys(args)
    const parameterValues = Object.values(args).map(
        convertYaksokDataIntoQuickJSData,
    )

    return `((${parameters.join(
        ', ',
    )}) => {${bodyCode}})(${parameterValues.join(', ')})`
}

function convertYaksokDataIntoQuickJSData(data: PrimitiveTypes) {
    if (data instanceof StringValue) {
        return `"${data.value}"`
    } else {
        return data.value
    }
}
