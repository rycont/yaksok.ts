export enum FEATURE_FLAG {
    FUTURE_FUNCTION_INVOKE_SYNTAX = 'future-function-invoke-syntax',
}

export type EnabledFlags = Partial<Record<FEATURE_FLAG, boolean>>
