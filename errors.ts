import { Evaluable, Node, Position } from './node/base.ts'
import { Operator } from './node/index.ts'
import { NODE_NAMES } from './nodeNames.ts'
import { CallFrame } from './runtime/callFrame.ts'

export class YaksokError extends Error {
    position?: Position

    constructor(props: { position?: Position }) {
        super()

        this.position = props.position
    }

    show() {
        console.log('─────\n')
        console.log(`🚨  ${bold(`문제가 발생했어요`)}  🚨`)

        if (this.position)
            console.log(
                `${this.position.line}번째 줄의 ${this.position.column}번째 글자\n`,
            )

        console.log('> ' + this.message + '\n')
        console.log('┌─────')

        // if (!this.callFrame || !this.callFrame.code || !this.position) return

        // this.printHintCode(this.callFrame.code, this.position)

        // console.log('└─────')
    }

    // printHintCode(code: string, position: Position) {
    //     let lines = code.split('\n')

    //     if (lines.length <= 3) {
    //         lines = [...lines, ...Array(3 - lines.length).fill('')]
    //     }

    //     lines = code.split('\n').slice(position.line - 2, position.line + 1)

    //     console.log(
    //         '│  \x1b[2m' + (position.line - 1) + '  ' + lines[0] + '\x1b[0m',
    //     )
    //     console.log('│  ' + position.line + '  ' + lines[1])
    //     console.log(
    //         '│      ' + ' '.repeat(position.column - 1) + '\x1b[33m^\x1b[0m',
    //     )
    //     console.log(
    //         '│  \x1b[2m' + (position.line + 1) + '  ' + lines[2] + '\x1b[0m',
    //     )
    // }
}

export class UnexpectedCharError extends YaksokError {
    constructor(props: {
        resource: {
            char: string
            parts: string
        }
        position?: Position
    }) {
        super(props)
        this.message = `문자 ${props.resource.char}는 ${props.resource.parts}에 사용할 수 없어요.`
    }
}

export class UnexpectedTokenError extends YaksokError {
    constructor(props: {
        resource: {
            node: Node
            parts: string
        }
        position?: Position
    }) {
        super(props)

        this.message = `토큰 ${
            props.resource.node.constructor.name
        }(${JSON.stringify(props.resource.node)})는 ${
            props.resource.parts
        }에 사용할 수 없어요.`
    }
}

export class UnexpectedEndOfCodeError extends YaksokError {
    constructor(props: {
        resource: {
            parts: string
        }
        position?: Position
    }) {
        super(props)
        this.message = `${props.resource.parts}가 끝나지 않았어요.`
    }
}

export class IndentIsNotMultipleOf4Error extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            indent: number
        }
    }) {
        super(props)
        this.message = `들여쓰기는 4의 배수여야 해요. ${props.resource.indent}는 4의 배수가 아니에요.`
    }
}

export class CannotParseError extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            part: Node
        }
    }) {
        super(props)

        if (
            'toPrint' in props.resource.part &&
            typeof props.resource.part.toPrint === 'function'
        ) {
            this.message = `${bold(
                '"' + props.resource.part.toPrint() + '"',
            )}는 실행할 수 있는 코드가 아니에요.`
        } else {
            this.message = `${
                '"' +
                bold(NODE_NAMES[props.resource.part.constructor.name]) +
                '"'
            }는 실행할 수 있는 코드가 아니에요.`
        }
    }
}

export class InvalidTypeForOperatorError extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            operator: Operator
            operands: Evaluable[]
        }
    }) {
        super(props)

        const operandsText = props.resource.operands
            .map(evaluableToText)
            .join('와 ')
        this.message = `${operandsText}는 ${operatorToText(
            props.resource.operator,
        )}할 수 없어요.`
    }
}

export class InvalidNumberOfOperandsError extends YaksokError {
    constructor(props: {
        position?: Position

        resource: {
            operator: Operator
            expected: number
            actual: number
        }
    }) {
        super(props)
        this.message = `${props.resource.operator.toPrint()}(${
            NODE_NAMES[props.resource.operator.constructor.name]
        })는 ${props.resource.expected}개의 값을 계산할 수 있는데, ${
            props.resource.actual
        }개의 값이 주어졌어요.`
    }
}

export class FunctionMustHaveNameError extends YaksokError {
    constructor(props: { position?: Position }) {
        super(props)
        this.message = `함수는 이름을 가져야 해요.`
    }
}

export class NotDefinedVariableError extends YaksokError {
    constructor(props: {
        position?: Position

        resource: {
            name: string
        }
    }) {
        super(props)
        this.message = `${props.resource.name}라는 변수를 찾을 수 없어요`
    }
}

export class NotEvaluableParameterError extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            node: Node
        }
    }) {
        super(props)

        if (
            'toPrint' in props.resource.node &&
            typeof props.resource.node.toPrint === 'function'
        ) {
            this.message = `${props.resource.node.toPrint()}(${
                props.resource.node.constructor.name
            })는 함수의 인자로 사용할 수 없어요.`
        } else {
            this.message = `${props.resource.node.constructor.name}는 함수의 인자로 사용할 수 없어요.`
        }
    }
}

export class InvalidTypeForCompareError extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            left: Evaluable
            right: Evaluable
        }
    }) {
        super(props)

        const leftText = evaluableToText(props.resource.left)
        const rightText = evaluableToText(props.resource.right)

        this.message = `${leftText}와 ${rightText}는 비교할 수 없어요.`
    }
}

export class BreakNotInLoopError extends YaksokError {
    constructor(props: { position?: Position }) {
        super(props)
        this.message = `"반복 그만"은 반복문 안에서만 사용할 수 있어요.`
    }
}

export class TargetIsNotIndexedValueError extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            target: Evaluable
        }
    }) {
        super(props)
        this.message = `${evaluableToText(
            props.resource.target,
        )}는 인덱스로 값을 가져올 수 없어요.`
    }
}

export class ListIndexMustBeGreaterThan1Error extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            index: Evaluable
        }
    }) {
        super(props)
        this.message = `리스트의 인덱스는 1보다 크거나 같아야 해요. ${evaluableToText(
            props.resource.index,
        )}는 그렇지 않아요.`
    }
}

export class NotDefinedFunctionError extends YaksokError {
    constructor(props: {
        position?: Position

        resource: {
            name: string
        }
    }) {
        super(props)
        this.message = `${props.resource.name}라는 함수를 찾을 수 없어요.`
    }
}

export class ListNotEvaluatedError extends YaksokError {
    constructor(props: { position?: Position }) {
        super(props)
        this.message = `아직 실행되지 않은 리스트는 사용할 수 없어요.`
    }
}

export class RangeStartMustBeNumberError extends YaksokError {
    constructor(props: {
        position?: Position

        resource: {
            start: Evaluable
        }
    }) {
        super(props)
        this.message = `범위의 시작은 숫자여야 해요. ${evaluableToText(
            props.resource.start,
        )}는 숫자가 아니에요.`
    }
}

export class RangeEndMustBeNumberError extends YaksokError {
    constructor(props: {
        position?: Position

        resource: {
            end: Evaluable
        }
    }) {
        super(props)
        this.message = `범위의 끝은 숫자여야 해요. ${evaluableToText(
            props.resource.end,
        )}는 숫자가 아니에요.`
    }
}

export class RangeStartMustBeLessThanEndError extends YaksokError {
    constructor(props: {
        position?: Position

        resource: {
            start: number
            end: number
        }
    }) {
        super(props)
        this.message = `범위의 시작은 끝보다 작아야 해요. ${props.resource.start}는 ${props.resource.end}보다 크거나 같아요.`
    }
}

export class ListIndexTypeError extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            index: Evaluable
        }
    }) {
        super(props)
        this.message = `리스트의 인덱스는 숫자나 리스트여야 해요. ${evaluableToText(
            props.resource.index,
        )}는 숫자나 리스트가 아니에요.`
    }
}

export class CannotReturnOutsideFunctionError extends YaksokError {
    constructor(props: { position?: Position }) {
        super(props)
        this.message = `"약속 그만"은 약속 안에서만 사용할 수 있어요.`
    }
}

export class CannotUseReservedWordForVariableNameError extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            name: string
        }
    }) {
        super(props)
        this.message = `${props.resource.name}는 변수나 함수의 이름으로 사용할 수 없어요.`
    }
}

export class ListIndexOutOfRangeError extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            index: Evaluable
        }
    }) {
        super(props)
        this.message = `인덱스 ${evaluableToText(
            props.resource.index,
        )}는 목록의 범위를 벗어났어요.`
    }
}

export class UnknownOperatorPrecedenceError extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            operator: Operator
        }
    }) {
        super(props)
        this.message = `${props.resource.operator.toPrint()}(${
            NODE_NAMES[props.resource.operator.constructor.name]
        })는 알 수 없는 연산자에요.`
    }
}

export class NotEnumerableValueForListLoopError extends YaksokError {
    constructor(props: {
        position?: Position
        callFrame: CallFrame
        resource: {
            value: Evaluable
        }
    }) {
        super(props)
        this.message = `${evaluableToText(
            props.resource.value,
        )}는 목록 반복문에서 사용할 수 없어요. 목록 반복문에서는 목록을 사용해야 해요.`
    }
}

function evaluableToText(evaluable: Evaluable) {
    let text =
        NODE_NAMES[evaluable.constructor.name] || evaluable.constructor.name

    try {
        text = bold(blue(evaluable.toPrint())) + dim(`(${text})`)
    } catch {}

    return text
}

function operatorToText(operator: Operator) {
    let text =
        NODE_NAMES[operator.constructor.name] || operator.constructor.name

    const toPrint = operator.toPrint()
    if (toPrint !== 'unknown') text = blue(bold(toPrint)) + dim(`(${text})`)

    return text
}

function bold(text: string) {
    return `\x1b[1m${text}\x1b[0m`
}

function blue(text: string) {
    return `\x1b[34m${text}\x1b[0m`
}

function dim(text: string) {
    return `\x1b[2m${text}\x1b[0m`
}
