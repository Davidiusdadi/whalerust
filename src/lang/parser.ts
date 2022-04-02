import { MarkdownConfig, parser, GFM, Subscript, Emoji, Superscript } from '@lezer/markdown'
import { styleTags, tags as t, Tag } from '@codemirror/highlight'


export const NodeNames = {
    'WikiLink': 'WikiLink',
    'WikiLinkMarkStart': 'WikiLinkMarkStart',
    'WikiLinkMarkEnd': 'WikiLinkMarkEnd',
    'InlineURL': 'InlineURL',
    'HashText': 'HashText',
    LinkMark: 'LinkMark',
    ListItem: 'ListItem',
    EmphasisMark: 'EmphasisMark',
    StrongEmphasis: 'StrongEmphasis',
    HeaderMark: 'HeaderMark',
    HorizontalRule: 'HorizontalRule',
    CodeText: 'CodeText',
    FencedCode: 'FencedCode',
    CodeMark: 'CodeMark',
    InlineCode: 'InlineCode'
}

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
                const elts = [cx.elt('WikiLinkMarkStart', pos, pos + 2)]
                for (let i = pos + 2; i < cx.end; i++) {
                    const next = cx.char(i)
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
                'WikiLink/...': t.link,
                'WikiLinkMarkStart WikiLinkMarkEnd': t.processingInstruction
            }
        )
    ]
}

// flexible yet naive url regex based on https://stackoverflow.com/a/1547940/1534894
const url_matcher = /^[a-z]{1,10}:\/\/[a-z0-9-._~:/?#[\]@!$&'()*+,;=%]+/i
const COL = ':'.charCodeAt(0)
const SL = '/'.charCodeAt(0)
export const InlineURL: MarkdownConfig = {
    defineNodes: ['InlineURL'],
    parseInline: [{
        name: 'InlineURL',
        parse: function InlineURL(cx, next, pos) {
            // matching for ://
            if (next === COL && cx.char(pos + 1) === SL && cx.char(pos + 1) === SL) {
                let i = 1
                let c = cx.char(pos - i)
                while (i < 10 && c !== -1) {
                    if ((c >= 65 /*A*/ && c <= 90 /*Z*/) || (c >= 97 /*a*/ && c <= 122 /*z*/)) {
                        // valid a-zAZ-Z
                    } else {
                        i--
                        break
                    }
                    i++
                    c = cx.char(pos - i)
                }
                if (i < 1) {
                    return -1 // eg: :://
                }
                const match_array = cx.slice(pos - i, cx.end).match(url_matcher)
                if (!match_array) {
                    return -1
                }
                return cx.addElement(cx.elt('InlineURL', pos - i, pos - i + match_array[0].length))

            }
            return -1
        }
    }],
    props: [
        styleTags({
                'InlineURL': t.link
            }
        )
    ]
}


export function not_a_tag_char(ch: number) {
    // spaces or invalid char
    return ch == 32 || ch == 9 || ch == 10 || ch == 13 || ch == -1
}

const HS = '#'.charCodeAt(0)
export const HashTag: MarkdownConfig = {
    defineNodes: ['HashTag', 'HashMark', 'HashText'],
    parseInline: [{
        name: 'HashTag',
        parse: function HashTag(cx, next, pos) {
            // matching for ://
            if (next === HS) {
                const elts = [cx.elt('HashMark', pos, pos + 1)]
                let i = 1
                for (; !not_a_tag_char(cx.char(pos + i)); i++) {
                    // jump
                }

                if (i < 1) {
                    return -1
                }
                return cx.addElement(cx.elt('HashTag', pos, pos + i, elts.concat(cx.elt('HashText', pos + 1, pos + i))))
            }
            return -1
        }
    }],
    props: [
        styleTags({
                'HashTag': t.link,
                'HashMark': t.processingInstruction,
                'HashText': t.link
            }
        )
    ]
}


export const tags = {
    ...t
}

//  based on @lezer/lang-markdown cofiguration
export const extensions = [...[GFM, Subscript, Superscript, Emoji, WikiLink, InlineURL, HashTag], {
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
}]


export const whalerust_parser = parser.configure(extensions)