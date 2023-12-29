export function getCombination<T>(arr: T[][]) {
    const result: T[][] = []

    function dfs(index: number, current: T[]) {
        if (index === arr.length) {
            result.push(current)
            return
        }

        for (const item of arr[index]) {
            dfs(index + 1, [...current, item])
        }
    }

    dfs(0, [])

    return result
}
