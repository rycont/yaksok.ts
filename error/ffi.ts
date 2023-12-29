import { Position } from '../node/base.ts'
import { YaksokError, blue, bold } from './common.ts'

export class FFIResulTypeIsNotForYaksokError extends YaksokError {
    constructor(props: { position?: Position; value: any; ffiName: string }) {
        super(props)

        let stringValue = ''

        if (typeof props.value === 'string') {
            stringValue = props.value
        } else if (props.value.__proto__ && props.value.__proto__.toString) {
            stringValue = props.value.toString()
        } else {
            stringValue = JSON.stringify(props.value)
        }

        this.message = `번역 ${bold(props.ffiName)}의 결과값 ${bold(
            blue(stringValue),
        )}는 약속에서 사용할 수 있는 값이 아니에요. IndexedValue, 혹은 PrimitiveValue를 사용해주세요.`
    }
}
