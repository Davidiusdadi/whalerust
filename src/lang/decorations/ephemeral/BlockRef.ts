import { Decoration, WidgetType } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'
import { NodeNames } from 'src/lang/parser'
import HTMLElem from 'src/lang/decorations/GenericWIdget'
import { index } from 'src/store/core'
import { editor_modes, markdown_code_highlights, markdown_lang, wrBasicSetup } from 'src/lang/editor'
import snippet from 'src/lang/decorations/snippet'
import { WREditorView } from 'src/lang/view'


export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name === NodeNames.BlockRef) {
                let embeded_view: WREditorView | null = null
                const mark = Decoration.replace({
                    widget: new class HTMLElem extends WidgetType {
                        toDOM(view: EditorView): HTMLElement {
                            const e = document.createElement('div')
                            const block_id = view.state.doc.sliceString(from + 2, to - 2)
                            const block = index.block_refs[block_id]
                            e.className = 'wp-cm-embed'
                            if (block) {
                                embeded_view = block.file.giveC6(e, [
                                    markdown_lang,
                                    markdown_code_highlights,
                                    editor_modes.block_embed(),
                                    snippet(block.from, block.to_wo_ref)
                                ])
                                embeded_view.disconnect()
                            }
                            return e
                        }

                        eq(_widget: WidgetType): boolean {
                            return true
                        }

                        destroy(_dom: HTMLElement) {
                            if (embeded_view) {
                                embeded_view.disconnect()
                                embeded_view.destroy()
                            }
                            super.destroy(_dom)
                        }


                    }


                }).range(from, to)
                return [mark]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition