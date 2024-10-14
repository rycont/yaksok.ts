import {
    getQuickJS,
    type QuickJSWASMModule,
    type QuickJSContext,
} from 'npm:quickjs-emscripten'
import type { Params } from '../../node/function.ts'
import {
    List,
    NumberValue,
    StringValue,
    type PrimitiveTypes,
    type ValueTypes,
} from '../../node/index.ts'

export class QuickJS {
    instance: QuickJSWASMModule | null = null

    constructor(private functions: Record<string, (args: any[]) => any>) {}

    async init() {
        this.instance = await getQuickJS()
    }

    run(bodyCode: string, args: Params) {
        const wrappedCode = createWrapperCodeFromFFICall(bodyCode, args)
        const vm = this.createContext()

        const result = vm.evalCode(wrappedCode)

        if (result.error) {
            const error = vm.dump(result.error)
            result.error.dispose()
            console.error(error)
        } else {
            const resultValue = vm.dump(result.value)
            result.value.dispose()

            const yaksokValue = convertJSDataIntoYaksok(resultValue)

            return yaksokValue
        }
    }

    private createContext() {
        if (!this.instance) {
            throw new Error('QuickJS instance is not initialized yet')
        }

        const context = this.instance.newContext()

        for (const [name, func] of Object.entries(this.functions)) {
            const handle = context.newFunction(name, (...args: any[]) => {
                const nativeArgs = args.map(context.dump)
                const result = func(nativeArgs)

                return convertJSDataIntoQuickJSData(result, context)
            })
            context.setProp(context.global, name, handle)
        }

        return context
    }
}

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

function convertJSDataIntoQuickJSData(data: any, context: QuickJSContext) {
    if (typeof data === 'string') {
        return context.newString(data)
    } else if (typeof data === 'number') {
        return context.newNumber(data)
    } else if (Array.isArray(data)) {
        const arrayData = [...data]

        const array = context.newArray()
        for (const item in arrayData) {
            context.setProp(
                array,
                item,
                convertJSDataIntoQuickJSData(item, context),
            )
        }

        return array
    } else if (typeof data === 'object') {
        const object = context.newObject()

        for (const [key, value] of Object.entries(data)) {
            context.setProp(
                object,
                key,
                convertJSDataIntoQuickJSData(value, context),
            )
        }

        return object
    }

    throw new Error('Unsupported data type: ' + typeof data)
}

function convertJSDataIntoYaksok(data: unknown): ValueTypes {
    if (typeof data === 'string') {
        return new StringValue(data)
    } else if (typeof data === 'number') {
        return new NumberValue(data)
    } else if (Array.isArray(data)) {
        return new List(data.map(convertJSDataIntoYaksok))
    }

    throw new Error('Unsupported data type: ' + typeof data)
}
