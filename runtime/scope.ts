import { YaksokError } from '../errors.ts'
import { Piece } from '../piece/basement.ts'
import { FunctionDeclarationPiece, ValueTypes } from '../piece/index.ts'

export class Scope {
    variables: Record<string, ValueTypes>
    functions: Record<string, FunctionDeclarationPiece> = {}
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

        throw new YaksokError('NOT_DEFINED_VARIABLE', {}, { name })
    }

    setFunction(name: string, pattern: FunctionDeclarationPiece) {
        this.functions[name] = pattern
    }

    getFunction(name: string): FunctionDeclarationPiece {
        const fetched = this.functions[name]
        if (fetched) return fetched

        if (this.parent) {
            return this.parent.getFunction(name)
        }

        throw new YaksokError('NOT_DEFINED_FUNCTION')
    }
}
