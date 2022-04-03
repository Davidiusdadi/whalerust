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
import { defaultHighlightStyle, HighlightStyle, classHighlightStyle } from '@codemirror/highlight'
import { lintKeymap } from '@codemirror/lint'
import { EditorState, EditorView } from '@codemirror/basic-setup'
import { indentWithTab } from '@codemirror/commands'
import { markdown, commonmarkLanguage } from '@codemirror/lang-markdown'
import { extensions as markdown_extensions, tags } from '../lang/parser'
import completion from 'src/lang/completion'
import type { Index } from 'src/db/indexer'
import { ConsistentPlugin } from 'src/lang/decorations/consistent_plugin'
import { indentUnit } from '@codemirror/language'
import { tabSize } from 'src/store/defaults'
import { EmphemeralPlugin } from 'src/lang/decorations/emphemeral_plugin'


const basicSetup = [
    //lineNumbers(),
    //highlightActiveLineGutter(),
    //highlightSpecialChars(),
    history(),
    //foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(false),
    indentOnInput(),
    classHighlightStyle,
    defaultHighlightStyle.fallback,
    bracketMatching(),
    closeBrackets(),
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
    ]),
    // consider indent aware line warp https://gist.github.com/dralletje/058fe51415fe7dbac4709a65c615b52e
    EditorView.lineWrapping
]

const markdown_lang = markdown({
    base: commonmarkLanguage,
    extensions: markdown_extensions
})


const scroller = EditorView.theme({
    '.cm-scroller': { overflow: 'auto' }
})

const myHighlightStyle = HighlightStyle.define([
    { tag: tags.processingInstruction, 'color': 'gray', opacity: '0.5' },
    { tag: tags.link, 'color': '#0077be' },
    { tag: tags.strong, 'font-weight': 'bold' },
    { tag: tags.emphasis, 'font-style': 'italic' },
])

export default (editor_div: Element, content: string, index: Index) => {
    const editor = new EditorView({
        state: EditorState.create({
            doc: content,
            extensions: [
                basicSetup,
                indentUnit.of(' '.repeat(tabSize)),
                EditorState.tabSize.of(tabSize),
                keymap.of([indentWithTab]),
                markdown_lang,
                scroller,
                autocompletion({
                    override: [
                        completion(index).wiki_complete
                    ]
                }),
                ConsistentPlugin,
                EmphemeralPlugin,
                myHighlightStyle
            ]
        }),
        parent: editor_div
    })
    return editor
}