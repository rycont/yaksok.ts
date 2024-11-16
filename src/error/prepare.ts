import { Node } from '../node/base.ts'
import type { Position } from '../type/position.ts'
import { YaksokError, bold, dim } from './common.ts'

export class CannotParseError extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            part: Node
        }
    }) {
        super(props)

        try {
            this.message = `${bold(
                '"' + props.resource.part.toPrint() + '"',
            )}는 실행할 수 있는 코드가 아니에요.`
        } catch {
            const nodeConstructor = props.resource.part
                .constructor as typeof Node
            this.message = `${
                '"' + bold(nodeConstructor.friendlyName) + '"'
            }는 실행할 수 있는 코드가 아니에요.`
        }
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
interface UnexpectedCharErrorResource {
    char: string
    parts: string
}

export class UnexpectedCharError extends YaksokError<UnexpectedCharErrorResource> {
    constructor(props: {
        resource: UnexpectedCharErrorResource
        position?: Position
    }) {
        super(props)
        this.message = `문자 ${props.resource.char}는 ${props.resource.parts}에 사용할 수 없어요.`
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

export class FileForRunNotExistError extends YaksokError {
    constructor(props: {
        resource: {
            entryPoint: string
            files: string[]
        }
    }) {
        super(props)

        if (props.resource.files.length === 0) {
            this.message = '실행할 코드가 없어요.'
        } else {
            this.message = `주어진 코드(${dim(
                props.resource.files.join(', '),
            )})에서 ${bold(props.resource.entryPoint)} 파일을 찾을 수 없어요. `
        }
    }
}
