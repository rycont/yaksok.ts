import { getFunctionDeclareRanges } from '../util/get-function-declare-ranges.ts'
import { executer, type ExecuteResult } from '../executer/index.ts'
import { tokenize } from '../prepare/tokenize/index.ts'
import { parse } from '../prepare/parse/index.ts'

import type { Token } from '../prepare/tokenize/token.ts'
import type { Rule } from '../prepare/parse/rule.ts'
import type { Runtime } from '../runtime/index.ts'
import type { Evaluable } from '../node/base.ts'
import type { Block } from '../node/block.ts'
import { mergeArgumentBranchingTokens } from '../prepare/tokenize/merge-argument-branching-tokens.ts'

export class CodeFile {
    private tokenized: Token[] | null = null
    private parsed: Block | null = null
    private functionDeclareRangesCache: [number, number][] | null = null
    private exportedRulesCache: Rule[] | null = null

    public runResult: ExecuteResult<Block> | null = null
    public runtime: Runtime | null = null

    constructor(public text: string, public fileName: string = '<이름 없음>') {}

    mount(runtime: Runtime) {
        this.runtime = runtime
    }

    get mounted() {
        return this.runtime !== null
    }

    get tokens(): Token[] {
        if (this.tokenized === null) {
            this.tokenized = tokenize(this)
        }

        return this.tokenized
    }

    get ast() {
        if (!this.parsed) {
            this.parse()
        }

        return this.parsed as Block
    }

    get functionDeclareRanges(): [number, number][] {
        if (this.functionDeclareRangesCache === null) {
            this.functionDeclareRangesCache = getFunctionDeclareRanges(
                this.tokens,
            )
        }

        return this.functionDeclareRangesCache
    }

    get exportedRules(): Rule[] {
        if (!this.exportedRulesCache) {
            this.parse()
        }

        return this.exportedRulesCache as Rule[]
    }

    private parse() {
        const parseResult = parse(this)
        this.parsed = parseResult.ast
        this.exportedRulesCache = parseResult.exportedRules
    }

    public run() {
        if (this.runResult) return

        const result = executer(this.ast, this)
        this.runResult = result

        return result
    }

    public evaluate(node: Evaluable) {
        this.run()
        return executer(node, this)
    }
}
