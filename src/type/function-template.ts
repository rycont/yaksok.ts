export interface FunctionTemplate {
    name: string
    parts: {
        type: 'static' | 'value'
        name: string
    }[]
}
