import { DeclareFunction, ValueTypes } from '../node/index.ts'
import {
    NotDefinedFunctionError,
    NotDefinedVariableError,
    YaksokError,
} from '../errors.ts'

export class Scope {
    variables: Record<string, ValueTypes>
    functions: Record<string, DeclareFunction> = {}
    parent: Scope | undefined

    constructor(parent?: Scope, initialVariable = {}) {
        this.variables = initialVariable
        this.parent = parent
    }

    setVariable(name: string, value: ValueTypes) {
        if (this.parent?.askSetVariable(name, value)) return
        this.variables[name] = value
    }

    askSetVariable(name: string, value: ValueTypes): boolean {
        if (name in this.variables) {
            this.variables[name] = value
            return true
        }

        if (this.parent) return this.parent.askSetVariable(name, value)
        return false
    }

    getVariable(name: string): ValueTypes {
        if (name in this.variables) {
            return this.variables[name]
        }
        if (this.parent) {
            return this.parent.getVariable(name)
        }

        throw new NotDefinedVariableError({
            resource: {
                name,
            },
        })
    }

    setFunction(name: string, functionBody: DeclareFunction) {
        this.functions[name] = functionBody
    }

    getFunction(name: string): DeclareFunction {
        const fetched = this.functions[name]
        if (fetched) return fetched

        if (this.parent) {
            return this.parent.getFunction(name)
        }

        throw new NotDefinedFunctionError({
            resource: {
                name,
            },
        })
    }
}
