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


function makeSimpleBracket({ tag, tag_open, tag_close, char_open, char_close }: {
    tag: string,
    tag_open: string
    tag_close: string,
    char_open: number,
    char_close: number,
}) {

// our custom extension (that currently ONLY works because the forked/modified @lezer/markdown and @lezer/lang-markdown )
    return {
        defineNodes: [tag, tag_open, tag_close],
        parseInline: [{
            name: tag,
            before: 'Link',
            parse: function WikiLink(cx, next, pos) {
                if (next === char_open && cx.char(pos + 1) === char_open) {
                    const elts = [cx.elt(tag_open, pos, pos + 2)]
                    for (let i = pos + 2; i < cx.end; i++) {
                        const next = cx.char(i)
                        if (next == 13 /* newline */) {
                            break
                        }
                        if (next == char_close && cx.char(i + 1) == char_close) {
                            return cx.addElement(cx.elt(tag, pos, i + 2, elts.concat(cx.elt(tag_close, i, i + 2))))
                        }
                    }
                }
                return -1
            }
        }],
        props: [
            styleTags({
                    [`${tag}/...`]: t.link,
                    [`${tag_open} ${tag_close}`]: t.processingInstruction
                }
            )
        ]
    } as MarkdownConfig
}

const WikiLink = makeSimpleBracket({
    tag: 'WikiLink',
    tag_open: 'WikiLinkMarkStart',
    tag_close: 'WikiLinkMarkEnd',
    char_open: 91, /* [  bracket open */
    char_close: 93 /* ]  bracket open */
})

const Embed = makeSimpleBracket({
    tag: 'Embed',
    tag_open: 'EmbedMarkStart',
    tag_close: 'EmbedMarkEnd',
    char_open: '{'.charCodeAt(0), /* {  bracket open */
    char_close: '}'.charCodeAt(0) /* } bracken close */
})

const BlockRef = makeSimpleBracket({
    tag: 'BlockRef',
    tag_open: 'BlockRefMarkStart',
    tag_close: 'BlockRefMarkEnd',
    char_open: '('.charCodeAt(0), /* {  bracket open */
    char_close: ')'.charCodeAt(0) /* } bracken close */
})


const BM = '^'.charCodeAt(0)
const BlockId = {
    defineNodes: ['BlockId', 'BlockIdMark', 'BlockIdValue'],
    parseInline: [{
        name: 'BlockId',
        parse: function WikiLink(cx, next, pos) {
            if (next === BM && is_a_space(cx.char(pos - 1))) {
                const elts = [cx.elt('BlockIdMark', pos, pos + 1)]
                let eof_mark_found = false
                let eof_mark = pos + 1
                console.log('BlockId canditate:', cx.text)
                for (let i = pos + 1; ; i++) {
                    const next = cx.char(i)

                    if (next === BM) {
                        return -1
                    }

                    if (next == 13 || next === -1) {
                        if (!eof_mark_found) {
                            eof_mark = i
                        }
                        if (eof_mark - (pos + 1) < 1) {
                            return -1
                        }
                        return cx.addElement(
                            cx.elt('BlockId', pos, eof_mark,
                                elts.concat(cx.elt('BlockIdValue', pos + 1, eof_mark))
                            )
                        )
                    }

                    if (eof_mark_found) {
                        if (!not_a_tag_char(next)) {
                            return -1
                        }
                    } else if (!is_ref_id(next)) {
                        if (not_a_tag_char(next)) {
                            eof_mark_found = true
                            eof_mark = i
                        } else {
                            break
                        }
                    }
                }
            }
            return -1
        }
    }],
    props: [
        styleTags({
                [`BlockId/...`]: t.link,
                [`BlockIdMark BlockIdValue`]: t.processingInstruction
            }
        )
    ]
} as MarkdownConfig

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

function is_a_space(ch: number) {
    return ch == 32 /* space */ || ch == 9 /* tab */
}

export function not_a_tag_char(ch: number) {
    // spaces or invalid char
    return is_a_space(ch) || ch == 10 || ch == 13 || ch == -1
}

export function is_hex(ch: number) {
    const n0 = '0'.charCodeAt(0)
    const n9 = '9'.charCodeAt(0)
    const a = 'a'.charCodeAt(0)
    const z = 'z'.charCodeAt(0)
    const A = 'A'.charCodeAt(0)
    const Z = 'Z'.charCodeAt(0)
    return (
        ch >= n0 && ch <= n9
        || ch >= a && ch <= z
        || ch >= A && ch <= Z
    )
}

function is_ref_id(ch: number) {
    return is_hex(ch) || ch === '_'.charCodeAt(0) || ch === '-'.charCodeAt(0)
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
export const extensions = [
    GFM, Subscript, Superscript, Emoji, WikiLink, Embed, BlockRef, InlineURL, HashTag, BlockId,
    {
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