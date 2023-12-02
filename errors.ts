const ERRORS = [
    "INDENT_NOT_DIVIDED_BY_4",
    "UNKNOWN_TOKEN",
] as const;

interface ErrorOccurrence {
    line?: number;
    column?: number;
}

export class YaksokError extends Error {
    occursAt: ErrorOccurrence;

    constructor(errorCode: typeof ERRORS[number], occursAt: ErrorOccurrence) {
        super();
        this.name = errorCode || "YaksokError";
        this.occursAt = occursAt
    }
} 