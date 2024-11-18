import { Block } from '../node/block.ts'
import { CodeFile } from '../type/code-file.ts'
import { FunctionTemplate } from '../type/function-template.ts'

export interface FunctionValue extends FunctionTemplate {
    declared: CodeFile
    body: Block
}
