import { Evaluable, Node, Position } from './node/base.ts'
import { NODE_NAMES } from './nodeNames.ts'
import { CallFrame } from './runtime/callFrame.ts'

export class YaksokError extends Error {
    constructor(public occursAt: Position, public callFrame: CallFrame) {
        super()
        this.occursAt = occursAt
    }

    show() {
        console.log('─────\n')
        console.log(`🚨  ${bold(`문제가 발생했어요`)}  🚨`)
        console.log(
            `${this.occursAt.line}번째 줄의 ${this.occursAt.column}번째 글자\n`,
        )
        console.log('> ' + this.message + '\n')
        console.log('┌─────')

        if (!this.callFrame.code) return

        this.printHintCode(this.callFrame.code)

        console.log('└─────')
    }

    printHintCode(code: string) {
        let lines = code.split('\n')

        if (lines.length <= 3) {
            lines = [...lines, ...Array(3 - lines.length).fill('')]
        }

        lines = code
            .split('\n')
            .slice(this.occursAt.line - 2, this.occursAt.line + 1)

        console.log(
            '│  \x1b[2m' +
                (this.occursAt.line - 1) +
                '  ' +
                lines[0] +
                '\x1b[0m',
        )
        console.log('│  ' + this.occursAt.line + '  ' + lines[1])
        console.log(
            '│      ' +
                ' '.repeat(this.occursAt.column - 1) +
                '\x1b[33m^\x1b[0m',
        )
        console.log(
            '│  \x1b[2m' +
                (this.occursAt.line + 1) +
                '  ' +
                lines[2] +
                '\x1b[0m',
        )
    }
}

export class UnexpectedCharError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            char: string
            parts: string
        },
    ) {
        super(occursAt, callFrame)
        this.message = `문자 ${resource.char}는 ${resource.parts}에 사용할 수 없어요.`
    }
}

export class UnexpectedTokenError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            node: Node
            parts: string
        },
    ) {
        super(occursAt, callFrame)

        this.message = `토큰 ${resource.node.constructor.name}(${JSON.stringify(
            resource.node,
        )})는 ${resource.parts}에 사용할 수 없어요.`
    }
}

export class UnexpectedEndOfCodeError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            parts: string
        },
    ) {
        super(occursAt, callFrame)
        this.message = `${resource.parts}가 끝나지 않았어요.`
    }
}

export class IndentIsNotMultipleOf4Error extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            indent: number
        },
    ) {
        super(occursAt, callFrame)
        this.message = `들여쓰기는 4의 배수여야 해요. ${resource.indent}는 4의 배수가 아니에요.`
    }
}

export class CannotParseError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            part: Node
        },
    ) {
        super(occursAt, callFrame)

        if (
            'toPrint' in resource.part &&
            typeof resource.part.toPrint === 'function'
        ) {
            this.message = `${bold(
                '"' + resource.part.toPrint() + '"',
            )}는 실행할 수 있는 코드가 아니에요.`
        } else {
            this.message = `${
                '"' + bold(NODE_NAMES[resource.part.constructor.name]) + '"'
            }는 실행할 수 있는 코드가 아니에요.`
        }
    }
}

export class InvalidTypeForOperatorError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            operands: Evaluable[]
            operator: string
        },
    ) {
        super(occursAt, callFrame)

        const operandsText = resource.operands.map(evaluableToText).join('와 ')
        this.message = `${operandsText}는 ${resource.operator}할 수 없어요.`
    }
}

export class InvalidNumberOfOperandsError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            operator: string
            operands: Evaluable[]
        },
    ) {
        super(occursAt, callFrame)
        this.message = `${resource.operator}엔 ${resource.operands.length}개의 값을 계산할 수 있는데, ${resource.operands.length}개의 값이 주어졌어요.`
    }
}

export class FunctionMustHaveNameError extends YaksokError {
    constructor(public occursAt: Position, public callFrame: CallFrame) {
        super(occursAt, callFrame)
        this.message = `함수는 이름을 가져야 해요.`
    }
}

export class NotDefinedVariableError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            name: string
        },
    ) {
        super(occursAt, callFrame)
        this.message = `${resource.name}라는 변수를 찾을 수 없어요`
    }
}

export class NotEvaluableParameterError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            node: Node
        },
    ) {
        super(occursAt, callFrame)

        if (
            'toPrint' in resource.node &&
            typeof resource.node.toPrint === 'function'
        ) {
            this.message = `${resource.node.toPrint()}(${
                resource.node.constructor.name
            })는 함수의 인자로 사용할 수 없어요.`
        } else {
            this.message = `${resource.node.constructor.name}는 함수의 인자로 사용할 수 없어요.`
        }
    }
}

export class InvalidTypeForCompareError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            left: Evaluable
            right: Evaluable
        },
    ) {
        super(occursAt, callFrame)

        const leftText = evaluableToText(resource.left)
        const rightText = evaluableToText(resource.right)

        this.message = `${leftText}와 ${rightText}는 비교할 수 없어요.`
    }
}

export class BreakNotInLoopError extends YaksokError {
    constructor(public occursAt: Position, public callFrame: CallFrame) {
        super(occursAt, callFrame)
        this.message = `"반복 그만"은 반복문 안에서만 사용할 수 있어요.`
    }
}

export class TargetIsNotIndexedValueError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            target: Evaluable
        },
    ) {
        super(occursAt, callFrame)
        this.message = `${evaluableToText(
            resource.target,
        )}는 인덱스로 값을 가져올 수 없어요.`
    }
}

export class ListIndexMustBeGreaterThan1Error extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            index: Evaluable
        },
    ) {
        super(occursAt, callFrame)
        this.message = `리스트의 인덱스는 1보다 크거나 같아야 해요. ${evaluableToText(
            resource.index,
        )}는 그렇지 않아요.`
    }
}

export class NotDefinedFunctionError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            name: string
        },
    ) {
        super(occursAt, callFrame)
        this.message = `${resource.name}라는 함수를 찾을 수 없어요.`
    }
}

export class ListNotEvaluatedError extends YaksokError {
    constructor(public occursAt: Position, public callFrame: CallFrame) {
        super(occursAt, callFrame)
        this.message = `아직 실행되지 않은 리스트는 사용할 수 없어요.`
    }
}

export class RangeStartMustBeNumberError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            start: Evaluable
        },
    ) {
        super(occursAt, callFrame)
        this.message = `범위의 시작은 숫자여야 해요. ${evaluableToText(
            resource.start,
        )}는 숫자가 아니에요.`
    }
}

export class RangeEndMustBeNumberError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            end: Evaluable
        },
    ) {
        super(occursAt, callFrame)
        this.message = `범위의 끝은 숫자여야 해요. ${evaluableToText(
            resource.end,
        )}는 숫자가 아니에요.`
    }
}

export class RangeStartMustBeLessThanEndError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            start: Evaluable
            end: Evaluable
        },
    ) {
        super(occursAt, callFrame)
        this.message = `범위의 시작은 끝보다 작아야 해요. ${evaluableToText(
            resource.start,
        )}는 ${evaluableToText(resource.end)}보다 크거나 같아요.`
    }
}

export class ListIndexTypeError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            index: Evaluable
        },
    ) {
        super(occursAt, callFrame)
        this.message = `리스트의 인덱스는 숫자나 리스트여야 해요. ${evaluableToText(
            resource.index,
        )}는 숫자나 리스트가 아니에요.`
    }
}

export class CannotReturnOutsideFunctionError extends YaksokError {
    constructor(public occursAt: Position, public callFrame: CallFrame) {
        super(occursAt, callFrame)
        this.message = `"약속 그만"은 약속 안에서만 사용할 수 있어요.`
    }
}

export class CannotUseReservedWordForVariableNameError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            name: string
        },
    ) {
        super(occursAt, callFrame)
        this.message = `${resource.name}는 변수나 함수의 이름으로 사용할 수 없어요.`
    }
}

export class ListIndexOutOfRangeError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            index: Evaluable
            list: Evaluable
        },
    ) {
        super(occursAt, callFrame)
        this.message = `인덱스 ${evaluableToText(
            resource.index,
        )}는 목록의 범위를 벗어났어요.`
    }
}

export class UnknownOperatorPrecedenceError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            operator: string
        },
    ) {
        super(occursAt, callFrame)
        this.message = `${resource.operator}는 알 수 없는 연산자에요.`
    }
}

export class NotEnumerableValueForListLoopError extends YaksokError {
    constructor(
        public occursAt: Position,
        public callFrame: CallFrame,
        resource: {
            value: Evaluable
        },
    ) {
        super(occursAt, callFrame)
        this.message = `${evaluableToText(
            resource.value,
        )}는 목록 반복문에서 사용할 수 없어요. 목록 반복문에서는 목록을 사용해야 해요.`
    }
}

function evaluableToText(evaluable: Evaluable) {
    let text = evaluable.constructor.name

    try {
        text = evaluable.toPrint() + `(${text})`
    } catch {}

    return text
}

function bold(text: string) {
    return `\x1b[1m${text}\x1b[0m`
}
