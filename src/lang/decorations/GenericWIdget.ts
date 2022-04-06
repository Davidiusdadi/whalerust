import { WidgetType } from '@codemirror/view'
import type { EditorView } from '@codemirror/basic-setup'

export default class HTMLElem extends WidgetType {
    tag: string
    customizer: (e: HTMLElement) => void

    constructor(tag: string, customizer: (e: HTMLElement) => void) {
        super()
        this.tag = tag
        this.customizer = customizer
    }

    toDOM(view: EditorView): HTMLElement {
        const elem = document.createElement(this.tag)
        this.customizer(elem)
        return elem
    }
}
