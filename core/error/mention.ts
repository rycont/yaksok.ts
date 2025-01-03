import type { Position } from '../type/position.ts'
import { YaksokError, blue, bold } from './common.ts'

export class ErrorInModuleError extends YaksokError<{
    fileName: string
}> {
    constructor(props: {
        position?: Position
        resource: {
            fileName: string
        }
        child: YaksokError
    }) {
        super(props)
        this.child = props.child

        this.message = `다른 약속 파일 ${blue(
            bold(props.resource.fileName),
        )}에서 오류가 발생했어요.`
    }
}
