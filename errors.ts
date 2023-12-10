const ERRORS = [
    'UNEXPECTED_CHAR',
    'UNEXPECTED_TOKEN',
    'UNEXPECTED_END_OF_CODE',
    'INDENT_IS_NOT_MULTIPLE_OF_4',
    'CANNOT_PARSE',
    'INVALID_TYPE_FOR_PLUS_OPERATOR',
    'INVALID_TYPE_FOR_MINUS_OPERATOR',
    'INVALID_TYPE_FOR_MULTIPLY_OPERATOR',
    'INVALID_TYPE_FOR_DIVIDE_OPERATOR',
    'INVALID_NUMBER_OF_OPERANDS',
    'INVALID_TYPE_FOR_AND_OPERATOR',
    'FUNCTION_MUST_HAVE_NAME',
    'NOT_DEFINED_VARIABLE',
    'NOT_EVALUABLE_EXPRESSION',
    'INVALID_TYPE_FOR_GREATER_THAN_OPERATOR',
    'INVALID_TYPE_FOR_LESS_THAN_OPERATOR',
    'BREAK_NOT_IN_LOOP',
    'EVENT_NOT_FOUND',
    'INVALID_TYPE_FOR_EVALUATABLE_SEQUENCE',
    'LIST_INDEX_MUST_BE_NUMBER',
    'INVALID_TYPE_FOR_INDEX_FETCH',
    'LIST_INDEX_MUST_BE_GREATER_THAN_0',
    'INVALID_SEQUENCE_TYPE_FOR_INDEX_FETCH',
    'NOT_DEFINED_FUNCTION',
    'LIST_NOT_EVALUATED',
    'RANGE_START_MUST_BE_NUMBER',
    'RANGE_END_MUST_BE_NUMBER',
    'RANGE_START_MUST_BE_LESS_THAN_END',
    'INVALID_TYPE_FOR_GREATER_THAN_OR_EQUAL_OPERATOR',
    'LIST_INDEX_TYPE_MUST_BE_NUMBER_OR_LIST',
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
