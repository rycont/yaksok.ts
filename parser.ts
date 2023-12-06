import { YaksokError } from './errors.ts'
import {
    MultiplyOperatorPiece,
    DeclareVariablePiece,
    DivideOperatorPiece,
    CalculationPiece,
    EvaluatablePiece,
    ConditionPiece,
    OperatorPiece,
    KeywordPiece,
    IndentPiece,
    BlockPiece,
    PrintPiece,
    EOLPiece,
    Piece,
} from './piece/index.ts'

interface Pattern {
    wrapper: typeof Piece<unknown>
    units: {
        type: typeof Piece<unknown>
        content?: Record<string, unknown> | string | number
        as?: string
    }[]
}

const patterns: Pattern[] = [
    {
        wrapper: DeclareVariablePiece,
        units: [
            {
                type: KeywordPiece,
                as: 'name',
            },
            {
                type: KeywordPiece,
                content: ':',
            },
            {
                type: EvaluatablePiece,
                as: 'content',
            },
            {
                type: EOLPiece,
            },
        ],
    },
    {
        wrapper: DivideOperatorPiece,
        units: [
            {
                type: KeywordPiece,
                content: '/',
            },
        ],
    },
    {
        wrapper: MultiplyOperatorPiece,
        units: [
            {
                type: KeywordPiece,
                content: '*',
            },
        ],
    },
    {
        wrapper: CalculationPiece,
        units: [
            {
                type: EvaluatablePiece,
                as: 'left',
            },
            {
                type: OperatorPiece,
                as: 'operator',
            },
            {
                type: EvaluatablePiece,
                as: 'right',
            },
        ],
    },
    {
        wrapper: CalculationPiece,
        units: [
            {
                type: KeywordPiece,
                as: 'left',
            },
            {
                type: OperatorPiece,
                as: 'operator',
            },
            {
                type: KeywordPiece,
                as: 'right',
            },
        ],
    },
    {
        wrapper: ConditionPiece,
        units: [
            {
                type: KeywordPiece,
                content: '만약',
            },
            {
                type: EvaluatablePiece,
                as: 'condition',
            },
            {
                type: KeywordPiece,
                content: '이면',
            },
            {
                type: EOLPiece,
            },
            {
                type: BlockPiece,
                as: 'body',
            },
        ],
    },
    {
        wrapper: PrintPiece,
        units: [
            {
                type: EvaluatablePiece,
                as: 'expression',
            },
            {
                type: KeywordPiece,
                content: '보여주기',
            },
        ],
    },
]

// 반지름: 10
// 만약 (반지름 > 5) 이면
//     "반지름이 5보다 크다" 보여주기

// make that code to

// BlockPiece {
//     content: [
//         KeywordPiece { content: '반지름' },
//         KeywordPiece { content: ':' },
//         NumberPiece { content: 10 },
//         EOLPiece {},
//         KeywordPiece { content: '만약' },
//         KeywordPiece { content: '(' },
//         KeywordPiece { content: '반지름' },
//         OperatorPiece { content: '>' },
//         NumberPiece { content: 5 },
//         KeywordPiece { content: ')' },
//         KeywordPiece { content: '이면' },
//         EOLPiece {},
//         BlockPiece {
//             content: [
//                 StringPiece { content: '반지름이 5보다 크다' },
//                 KeywordPiece { content: '보여주기' },
//                 EOLPiece {}
//             ]
//         },
//         EOLPiece {}
//     ]
// }

export function parse(_tokens: Piece<unknown>[], indent: number = 0) {
    const groups: Piece<unknown>[] = []
    const tokens = [..._tokens]

    while (tokens.length) {
        const token = tokens.shift()
        if (!token) break

        if (token instanceof IndentPiece) {
            if (token.content !== indent + 1) {
                continue
            }

            let blockTokens: Piece<unknown>[] = []

            while (tokens.length) {
                const currentToken = tokens.shift()
                if (!currentToken)
                    throw new YaksokError('UNEXPECTED_END_OF_CODE')

                // 다음 줄로 넘어갔는데
                if (currentToken instanceof EOLPiece) {
                    // 첫 토큰이 들여쓰기면
                    if (tokens[0] instanceof IndentPiece) {
                        // 들여쓰기가 같거나 더 깊으면
                        if (tokens[0].content >= token.content) {
                            blockTokens.push(currentToken)
                            continue
                        } else {
                            break
                        }
                    } else {
                        break
                    }
                } else {
                    blockTokens.push(currentToken)
                }
            }

            const blockContent = parse(blockTokens, indent + 1)
            groups.push(new BlockPiece(blockContent))
        } else {
            groups.push(token)
        }
    }

    const parsed = flatParser(groups)
    return parsed
}

function checkPattern(tokens: Piece<unknown>[], pattern: (typeof patterns)[0]) {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const unit = pattern.units[i]

        if (!(token instanceof unit.type)) return false
        if (unit.content) {
            if (typeof unit.content === 'object') {
                for (const key in unit.content) {
                    if (unit.content[key] !== token.content?.[key]) return false
                }
            }

            if (unit.content !== token.content) return false
        }
    }

    return true
}

export function flatParser(_tokens: Piece<unknown>[]): Piece<unknown>[] {
    const tokens = [..._tokens]
    const stack: typeof tokens = []

    while (tokens.length) {
        const token = tokens.shift()

        if (!token) {
            if (stack.length === 1) return stack

            console.log('Stack is not empty!')
            console.log(stack)

            break
        }

        stack.push(token)

        let patternHash = stack.map((token) => token.constructor.name)

        while (true) {
            for (const pattern of patterns) {
                if (stack.length < pattern.units.length) continue

                const substack = stack.slice(
                    stack.length - pattern.units.length,
                    stack.length,
                )

                if (checkPattern(substack, pattern)) {
                    const Wrapper = pattern.wrapper

                    const content: Record<string, unknown> = {}

                    for (let i = 0; i < pattern.units.length; i++) {
                        const unit = pattern.units[i]
                        const token = substack[i]

                        if (unit.as) content[unit.as] = token
                    }

                    const wrapper = new Wrapper(content)

                    stack.splice(
                        stack.length - pattern.units.length,
                        pattern.units.length,
                        wrapper,
                    )
                }
            }

            const newPatternHash = stack.map((token) => token.constructor.name)

            if (
                newPatternHash.length === patternHash.length &&
                newPatternHash.every(
                    (token, index) => token === patternHash[index],
                )
            )
                break

            patternHash = newPatternHash
        }
    }

    return stack
}
