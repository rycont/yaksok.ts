import type { Position, Evaluable } from '../node/base.ts'
import { YaksokError, evaluableToText } from './common.ts'

export class ListIndexOutOfRangeError extends YaksokError {
    constructor(props: {
        position?: Position
        resource: {
            index: number
        }
    }) {
        super(props)
        this.message = `인덱스 ${props.resource.index}는 목록의 범위를 벗어났어요.`
    }
}

export class NotEnumerableValueForListLoopError extends YaksokError {
    constructor(props: {
        position?: Position

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
export class ListIndexMustBeGreaterThan1Error extends YaksokError {
    constructor(props: {
        position?: Position

        resource: {
            index: number
        }
    }) {
        super(props)
        this.message = `목록의 인덱스는 1보다 크거나 같아야 해요. ${props.resource.index}는 그렇지 않아요.`
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

export class ListIndexError extends YaksokError {
    constructor(props: {
        position?: Position

        resource: {
            index: Evaluable
        }
    }) {
        super(props)

        this.message = `목록의 인덱스는 정수나 목록여야 해요. ${evaluableToText(
            props.resource.index,
        )}는 정수나 목록가 아니에요.`
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
export class TargetIsNotIndexedValueError extends YaksokError {
    constructor(props: {
        position?: Position

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
