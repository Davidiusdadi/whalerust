import { MarkdownConfig, parser } from '@lezer/markdown'
import { styleTags, tags as t } from '@codemirror/highlight'

const BO = 91 /* [ */
const BC = 93 /* ] */
export const WikiLink: MarkdownConfig = {
    defineNodes: ['WikiLink', 'WikiLinkMarkStart', 'WikiLinkMarkEnd'],
    parseInline: [{
        name: 'WikiLink',
        before: 'Link',
        parse: function WikiLink(cx, next, pos) {
            if (next === BO && cx.char(pos + 1) === BO) {
                let elts = [cx.elt('WikiLinkMarkStart', pos, pos + 2)]
                for (let i = pos + 2; i < cx.end; i++) {
                    let next = cx.char(i)
                    if (next == 13 /* newline */) {
                        break
                    }
                    if (next == BC && cx.char(i + 1) == BC) {
                        return cx.addElement(cx.elt('WikiLink', pos, i + 2, elts.concat(cx.elt('WikiLinkMarkEnd', i, i + 2))))
                    }
                }
            }
            return -1
        }
    }],
    props: [
        styleTags({
                'WikiLink/...': t.strong,
                'WikiLinkMarkStart WikiLinkMarkEnd': t.processingInstruction
            }
        )
    ]
}

export const whalerust_parser = parser.configure([
    WikiLink
])