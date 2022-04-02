import { Decoration, WidgetType } from '@codemirror/view'
import type { SyntaxTreeDecorationDefinition } from 'src/lang/decorations/decoration_helper'
import type { EditorView } from '@codemirror/basic-setup'
import { NodeNames } from 'src/lang/parser'

class HTMLHRElementWidget extends WidgetType {
    toDOM(view: EditorView): HTMLElement {
        return document.createElement('hr')
    }
}

export default ((view: EditorView) => {
    return {
        enter(type, from, to) {
            if (type.name == NodeNames.HorizontalRule) {
                return [Decoration.replace({
                    widget: new HTMLHRElementWidget()
                }).range(from, to)]
            }
        }
    }
}) as SyntaxTreeDecorationDefinition