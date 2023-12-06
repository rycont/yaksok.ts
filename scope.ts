import { Pattern } from './pattern.ts'
import { BlockPiece, ValuePiece } from './piece/index.ts'

export class Scope {
    variables: Record<string, ValuePiece> = {}
    localPattern: Pattern[] = []
    block: BlockPiece

    constructor(block: BlockPiece) {
        this.block = block
    }

    setVariable(name: string, value: ValuePiece) {
        this.variables[name] = value
    }

    getVariable<VariableType extends ValuePiece>(name: string) {
        return this.variables[name] as VariableType
    }
}
