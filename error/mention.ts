import { Position } from '../node/index.ts'
import { YaksokError, blue, bold } from './common.ts'

export class ErrorInModuleError extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            filename: string
        }
    }) {
        super(props)

        this.message = `다른 약속 파일 ${blue(
            bold(props.resource.filename),
        )}에서 오류가 발생했어요.`
    }
}
