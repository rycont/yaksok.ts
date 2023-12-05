const ERRORS = [
    "UNEXPECTED_CHAR",
    "UNEXPECTED_END_OF_CODE",
    "INDENT_IS_NOT_MULTIPLE_OF_4",
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
