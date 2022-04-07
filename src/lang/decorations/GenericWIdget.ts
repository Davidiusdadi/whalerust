import { WidgetType } from '@codemirror/view'
import type { EditorView } from '@codemirror/basic-setup'


type HTMLElemCustomizer = (e: HTMLElement, w: WidgetType, view: EditorView) => void

export default class HTMLElem extends WidgetType {
    tag: string
    customizer: HTMLElemCustomizer

    constructor(tag: string, customizer: HTMLElemCustomizer) {
        super()
        this.tag = tag
        this.customizer = customizer
    }

    toDOM(view: EditorView): HTMLElement {
        const elem = document.createElement(this.tag)
        this.customizer(elem, this, view)
        return elem
    }
}
