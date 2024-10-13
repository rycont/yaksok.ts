// import {
//     Identifier,
//     Expression,
//     Evaluable,
//     Node,
// } from '../../../../../node/base.ts'
// import { EOL } from '../../../../../node/misc.ts'
// import { Rule } from '../../../rule.ts'

// export const dynamicPatternDetector: (Omit<Rule, 'factory'> & {
//     name: 'variable' | 'list_loop'
// })[] = [
//     {
//         name: 'variable' as const,
//         pattern: [
//             {
//                 type: Identifier,
//             },
//             {
//                 type: Expression,
//                 value: ':',
//             },
//             {
//                 type: Evaluable,
//             },
//         ],
//     },
//     {
//         name: 'variable' as const,
//         pattern: [
//             {
//                 type: Identifier,
//             },
//             {
//                 type: Expression,
//                 value: ':',
//             },
//             {
//                 type: Expression,
//             },
//         ],
//     },
//     {
//         name: 'variable' as const,
//         pattern: [
//             {
//                 type: Identifier,
//             },
//             {
//                 type: Expression,
//                 value: ':',
//             },
//             {
//                 type: Identifier,
//             },
//         ],
//     },
//     {
//         name: 'list_loop' as const,
//         pattern: [
//             {
//                 type: Identifier,
//                 value: '의',
//             },
//             {
//                 type: Identifier,
//             },
//             {
//                 type: Identifier,
//                 value: '마다',
//             },
//             {
//                 type: EOL,
//             },
//         ],
//     },
// ]

// export const dynamicRuleFactory: Record<
//     'list_loop',
//     (substack: Node[]) => Rule
// > = {
//     list_loop: (substack: Node[]) => ({
//         pattern: [
//             {
//                 type: Identifier,
//                 value: (substack[1] as Identifier).name,
//             },
//         ],
//         factory: (tokens: Node[]) => {
//             const name = tokens[0] as Identifier
//             return new Variable(name.name)
//         },
//     }),
// }
