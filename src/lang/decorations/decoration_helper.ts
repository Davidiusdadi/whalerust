import type { NodeType, SyntaxNode } from '@lezer/common/dist/tree'
import type { EditorView } from '@codemirror/view'
import { Decoration } from '@codemirror/view'
import type { Range } from '@codemirror/rangeset'
import { syntaxTree } from '@codemirror/language'


export type SyntaxTreeDecorationDefinition = (view: EditorView) => {
    before?(): void
    after?(): Range<Decoration>[]
    enter?(type: NodeType, from: number, to: number, get: () => SyntaxNode): Range<Decoration>[] | void
    leave?(type: NodeType, from: number, to: number, get: () => SyntaxNode): Range<Decoration>[] | void;
}

export function decorateFromSyntaxTree(view: EditorView, syntax_decorators: SyntaxTreeDecorationDefinition[], ranges = view.visibleRanges) {
    const deco_ranges: Range<Decoration>[] = []
    const decorators = syntax_decorators.map(sd => sd(view))
    for (const { from, to } of ranges) {
        decorators.forEach(d => d.before && d.before())
        syntaxTree(view.state).iterate({
            from, to,
            enter: (type, from, to, get) => {
                decorators.forEach(d => d.enter && deco_ranges.push(...d.enter(type, from, to, get) ?? []))
            },
            leave(type, from, to, get) {
                decorators.forEach(d => d.leave && deco_ranges.push(...d.leave(type, from, to, get) ?? []))
            }
        })
        decorators.forEach(d => d.after && deco_ranges.push(...d.after()))
    }
    return Decoration.set(deco_ranges, true)
}
