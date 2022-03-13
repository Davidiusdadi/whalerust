import { MarkdownConfig, parser, GFM, Subscript, Emoji, Superscript } from '@lezer/markdown'
import { styleTags, tags as t } from '@codemirror/highlight'

const BO = 91 /* [  bracket open */
const BC = 93 /* ] bracken close */
// our custom extension (that currently ONLY works because the forked/modified @lezer/markdown and @lezer/lang-markdown )
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

export const extensions = [GFM, Subscript, Superscript, Emoji, WikiLink]

//  based on @lezer/lang-markdown cofiguration
const extended = parser.configure([...extensions, {
    props: [
        styleTags({
            'TableDelimiter SubscriptMark SuperscriptMark StrikethroughMark': t.processingInstruction,
            'TableHeader/...': t.heading,
            'Strikethrough/...': t.strikethrough,
            TaskMarker: t.atom,
            Task: t.list,
            Emoji: t.character,
            'Subscript Superscript': t.special(t.content),
            TableCell: t.content
        })
    ]
}])


export default extensions
export const whalerust_parser = parser.configure(extensions)