import { CancellationToken, editor, languages, Position } from 'monaco-editor'
import { BaseProvider } from './base.ts'

export class CompletionItemProvider
    implements languages.CompletionItemProvider
{
    constructor(private base: BaseProvider) {}

    provideCompletionItems(
        model: editor.ITextModel,
        position: Position,
        context: languages.CompletionContext,
        token: CancellationToken,
    ): languages.ProviderResult<languages.CompletionList> {
        console.log(model, position, context, token)

        return {
            suggestions: [
                {
                    label: 'Hello',
                    kind: languages.CompletionItemKind.Text,
                    insertText: 'Hello',
                    range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column - 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    },
                },
            ],
        }
    }
}
