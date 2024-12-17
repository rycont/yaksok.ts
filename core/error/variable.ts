import type { Position } from '../type/position.ts'
import { YaksokError } from './common.ts'

export class CannotUseReservedWordForIdentifierNameError extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            name: string
        }
    }) {
        super(props)
        this.message = `${props.resource.name}는 변수나 약속의 이름으로 사용할 수 없어요.`
    }
}

interface NotDefinedIdentifierErrorResource {
    name: string
}

export class NotDefinedIdentifierError extends YaksokError<NotDefinedIdentifierErrorResource> {
    constructor(props: {
        position?: Position
        resource: NotDefinedIdentifierErrorResource
    }) {
        super(props)
        this.message = `${props.resource.name}라는 변수나 약속을 찾을 수 없어요`
    }
}
