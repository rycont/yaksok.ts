import { NotDefinedIdentifierError } from '../error/index.ts'
import type { DeclareFFI, DeclareFunction, ValueTypes } from '../node/index.ts'
import type { Runtime } from '../runtime/index.ts'

export class Scope {
    variables: Record<string, ValueTypes>
    functions: Record<string, DeclareFunction | DeclareFFI> = {}
    parent: Scope | undefined
    runtime?: Runtime

    constructor(
        config: {
            parent?: Scope
            runtime?: Runtime
            initialVariable?: Record<string, ValueTypes> | null
        } = {},
    ) {
        this.variables = config.initialVariable || {}
        this.parent = config.parent
        this.runtime = config.runtime

        if (config.parent?.runtime) {
            this.runtime = config.parent.runtime
        }
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

        throw new NotDefinedIdentifierError({
            resource: {
                name,
            },
        })
    }

    setFunction(name: string, functionBody: DeclareFunction | DeclareFFI) {
        this.functions[name] = functionBody
    }

    getFunction(name: string): DeclareFunction | DeclareFFI {
        const fetched = this.functions[name]
        if (fetched) return fetched

        return this.parent!.getFunction(name)
    }

    createChild(initialVariable?: Record<string, ValueTypes>): Scope {
        return new Scope({
            parent: this,
            initialVariable,
        })
    }
}
