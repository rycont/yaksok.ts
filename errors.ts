const ERRORS = [
    'UNEXPECTED_CHAR',
    'UNEXPECTED_END_OF_CODE',
    'INDENT_IS_NOT_MULTIPLE_OF_4',
    'CANNOT_PARSE',
    'INVALID_TYPE_FOR_PLUS_OPERATOR',
    'INVALID_TYPE_FOR_MINUS_OPERATOR',
    'INVALID_TYPE_FOR_MULTIPLY_OPERATOR',
    'INVALID_TYPE_FOR_DIVIDE_OPERATOR',
] as const

interface ErrorOccurrence {
    line?: number
    column?: number
}

export class YaksokError extends Error {
    occursAt?: ErrorOccurrence
    resource: Record<string, string | number>

    constructor(
        errorCode: (typeof ERRORS)[number],
        occursAt?: ErrorOccurrence,
        resource: Record<string, string | number> = {},
    ) {
        super(JSON.stringify({ errorCode, occursAt, resource }, null, 2))
        this.name = errorCode || 'YaksokError'
        this.occursAt = occursAt
        this.resource = resource
    }
}
