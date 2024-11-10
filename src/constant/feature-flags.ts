export enum FEATURE_FLAG {
    /**
     * 약속 호출에서 신문법 사용을 강제합니다. 신문법에서는 인자에 괄호를 사용해야만 합니다. 예를 들어, `("치킨")먹기`는 가능하지만 `"치킨" 먹기`는 불가능합니다.
     */
    FUTURE_FUNCTION_INVOKE_SYNTAX = 'future-function-invoke-syntax',
}

export type EnabledFlags = Partial<Record<FEATURE_FLAG, boolean>>
