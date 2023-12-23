import { Position } from '../node/base.ts'
import { YaksokError } from './common.ts'

export class CannotUseReservedWordForVariableNameError extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            name: string
        }
    }) {
        super(props)
        this.message = `${props.resource.name}는 변수나 함수의 이름으로 사용할 수 없어요.`
    }
}
interface NotDefinedVariableErrorResource {
    name: string
}

export class NotDefinedVariableError extends YaksokError<NotDefinedVariableErrorResource> {
    constructor(props: {
        position?: Position
        resource: NotDefinedVariableErrorResource
    }) {
        super(props)
        this.message = `${props.resource.name}라는 변수를 찾을 수 없어요`
    }
}
