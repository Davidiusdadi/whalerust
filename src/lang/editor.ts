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
import { extensions as markdown_extensions } from '../lang/parser'
import completion from './completion'
import { Index } from '../db/indexer'
import { ListMarkDecorationPlugin } from './decorations/list'
import { WikiLinkDecorationPlugin } from './decorations/wikilink'


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


const fixedHeightEditor = EditorView.theme({
    '&': { height: '80vh' },
    '.cm-scroller': { overflow: 'auto' }
})

export default (editor_div: Element, content: string, index: Index) => {
    return new EditorView({
        state: EditorState.create({
            doc: content,
            extensions: [
                basicSetup,
                keymap.of([indentWithTab]),
                markdown_lang,
                fixedHeightEditor,
                autocompletion({
                    override: [
                        completion(index).wiki_complete
                    ]
                }),
                ListMarkDecorationPlugin,
                WikiLinkDecorationPlugin
            ]
        }),
        parent: editor_div
    })
}