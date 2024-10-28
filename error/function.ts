import { Position, Node } from '../node/base.ts'
import { YaksokError } from './common.ts'

export class CannotReturnOutsideFunctionError extends YaksokError {
    constructor(props: { position?: Position }) {
        super(props)
        this.message = `"약속 그만"은 약속 안에서만 사용할 수 있어요.`
    }
}

export class FunctionMustHaveNameError extends YaksokError {
    constructor(props: { position?: Position }) {
        super(props)
        this.message = `함수는 이름을 가져야 해요.`
    }
}

export class FunctionMustHaveOneOrMoreStringPartError extends YaksokError {
    constructor(props: { position?: Position }) {
        super(props)
        this.message = `함수를 선언할 때엔 적어도 하나의 고정되는 부분이 있어야 해요.`
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
export class NotEvaluableParameterError extends YaksokError {
    constructor(props: {
        position?: Position
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
