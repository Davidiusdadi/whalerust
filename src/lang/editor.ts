import { highlightSpecialChars, drawSelection, dropCursor, highlightActiveLine, keymap } from '@codemirror/view'
import { history, historyKeymap } from '@codemirror/history'
import { foldGutter, foldKeymap } from '@codemirror/fold'
import { indentOnInput } from '@codemirror/language'
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/gutter'
import { defaultKeymap } from '@codemirror/commands'
import { bracketMatching } from '@codemirror/matchbrackets'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { commentKeymap } from '@codemirror/comment'
import { rectangularSelection } from '@codemirror/rectangular-selection'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { lintKeymap } from '@codemirror/lint'
import { EditorState, EditorView } from '@codemirror/basic-setup'
import { indentWithTab } from '@codemirror/commands'
import { markdown, commonmarkLanguage } from '@codemirror/lang-markdown'
import { extensions as markdown_extensions} from '../lang/parser'


const basicSetup = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    defaultHighlightStyle.fallback,
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...commentKeymap,
        ...completionKeymap,
        ...lintKeymap
    ])
]

const markdown_lang = markdown({
    base: commonmarkLanguage,
    extensions: markdown_extensions
})


export default (editor_div: Element, content: string) => {
    return new EditorView({
        state: EditorState.create({
            doc: content,
            extensions: [
                basicSetup,
                keymap.of([indentWithTab]),
                markdown_lang
            ]
        }),
        parent: editor_div
    })
}