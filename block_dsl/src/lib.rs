extern crate pest;
#[macro_use]
extern crate pest_derive;

use pest::iterators::{Pair, Pairs};
use pest::Parser;
use serde::{Deserialize, Serialize};
use ts_rs::TS;


macro_rules! simple_type {
    ($name:ident, { $($field:ident : $type:ty),* } ) => {
            #[derive(TS)]
            #[ts(export)]
            #[derive(Debug, Serialize, Deserialize)]
            pub struct $name {
                pub start: u32,
                pub end: u32,
                $(
                    pub $field: $type
                ),*
            }

            impl $name {
                #[inline]
                fn make(start: u32, end: u32,  $($field: $type),*) -> Token {
                   Token::$name($name {
                       start: start,
                       end: end,
                       $($field: $field),*
                   })
                }
            }
    };
}


#[derive(Parser)]
#[grammar = "block.pest"]
pub struct BlockParser;


simple_type!(Plain, {
    value: String
});

simple_type!(Bold, {
    value: String
});

simple_type!(CodeInline, {
    value: String
});


#[derive(TS)]
#[ts(export)]
#[derive(Debug, Serialize, Deserialize)]
pub enum PageRefFormat {
    Normal,
    HashTag,
    HashRef,
}

simple_type!(PageRef, {
    value: String,
    format: PageRefFormat
});

simple_type!(Invocation, {
    value: String
});

simple_type!(BlockRef, {
    value: String
});

simple_type!(Italic, {
    value: String
});

simple_type!(Latex, {
    value: String
});

simple_type!(Highlight, {
    value: String
});

simple_type!(Strikethrough, {
    value: String
});

simple_type!(Link, {
    label: String,
    target: String
});

simple_type!(Image, {
    label: String,
    target: String
});

simple_type!(CodeEmbed, {
    lang: String,
    contents: String
});

#[derive(TS)]
#[ts(export)]
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Token {
    Plain(Plain),
    Link(Link),
    Image(Image),
    Bold(Bold),
    PageRef(PageRef),
    Invocation(Invocation),
    BlockRef(BlockRef),
    Italic(Italic),
    Latex(Latex),
    Highlight(Highlight),
    Strikethrough(Strikethrough),
    CodeInline(CodeInline),
    CodeEmbed(CodeEmbed),
}


pub fn parse_block(block: &str) -> Vec<Token> {
    let successful_parse: Pairs<Rule> = BlockParser::parse(Rule::main, block)
        .expect("failed to parse");

    let mut tokens: Vec<Token> = Vec::new();
    for pair in successful_parse.flatten().into_iter() {
        match pair.as_rule() {
            Rule::EOI => {}
            Rule::main => {}
            Rule::expression => {
                println!("EX: {:?}", pair);
            }
            Rule::formatted => {}
            Rule::reference => {}
            Rule::helper_brackets => {}
            Rule::invocation_full => {}
            Rule::highlight_full => {}
            Rule::highlight => {
                let span = pair.as_span();
                tokens.push(Highlight::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
            Rule::invocation => {
                let span = pair.as_span();
                tokens.push(Invocation::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
            Rule::link_full => {
                let span = pair.as_span();
                let mut inner = pair.into_inner();
                let label = inner.next().unwrap();
                let link = inner.next().unwrap();
                tokens.push(Link::make(
                    span.start() as u32,
                    span.end() as u32,
                    label.as_span().as_str().to_string(),
                    link.as_span().as_str().to_string(),
                ));
            }
            Rule::link_label => {}
            Rule::link_target => {}
            Rule::image => {
                let span = pair.as_span();
                let mut inner = pair.into_inner();
                let label = inner.next().unwrap();
                let link = inner.next().unwrap();
                tokens.push(Image::make(
                    span.start() as u32,
                    span.end() as u32,
                    label.as_span().as_str().to_string(),
                    link.as_span().as_str().to_string(),
                ));
            }
            Rule::image_label => {}
            Rule::image_target => {}
            Rule::code_embed_full => {
                println!("see: {:?}", pair);

                let span = pair.as_span();
                let mut inner = pair.into_inner();
                let lang;
                let contents;
                let first = inner.next().unwrap();
                let second_opt = inner.next();
                if second_opt.is_none() {
                    lang = "unknown".to_string();
                    contents = first.as_span().as_str().to_string();
                } else {
                    lang = first.as_span().as_str().to_string();
                    contents = second_opt.unwrap().as_span().as_str().to_string();
                }


                tokens.push(CodeEmbed::make(
                    span.start() as u32,
                    span.end() as u32,
                    lang,
                    contents,
                ));
            }
            Rule::code_embed_lang => {}
            Rule::code_embed_content => {}
            Rule::page_hash_ref_full => {}
            Rule::page_hash_ref_long => {
                let span = pair.as_span();
                tokens.push(PageRef::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                    PageRefFormat::HashRef,
                ));
            }
            Rule::page_hash_ref_short => {
                let span = pair.as_span();
                tokens.push(PageRef::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                    PageRefFormat::HashTag,
                ));
            }
            Rule::page_ref_full => {}
            Rule::page_ref => {
                let span = pair.as_span();
                tokens.push(PageRef::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                    PageRefFormat::Normal,
                ));
            }
            Rule::block_ref_full => {}
            Rule::block_ref => {
                let span = pair.as_span();
                tokens.push(BlockRef::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
            Rule::style_bold_full => {}
            Rule::style_bold => {
                let span = pair.as_span();
                tokens.push(Bold::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
            Rule::code_inline_full => {}
            Rule::code_inline => {
                let span = pair.as_span();
                tokens.push(CodeInline::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
            Rule::strikethrough_full => {}
            Rule::strikethrough => {
                let span = pair.as_span();
                tokens.push(Strikethrough::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
            Rule::latex_full => {}
            Rule::latex => {
                let span = pair.as_span();
                tokens.push(Latex::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
            Rule::style_italic_full => {}
            Rule::style_italic => {
                let span = pair.as_span();
                tokens.push(Italic::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
            Rule::plain => {
                let span = pair.as_span();
                tokens.push(Plain::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
        }
    }
    tokens
}

#[cfg(test)]
mod tests {
    use pest::fails_with;
    use super::*;

    #[test]
    fn plain() {
        let tokens = parse_block("Test");
        assert_eq!(1, tokens.len());
        println!("{:?}", tokens);
        assert!(matches!(tokens[0], Token::Plain(_)));
    }

    #[test]
    fn ref_and_link() {
        let tokens = parse_block("[[good stuff]] i like it [label](http://localhost)");
        println!("{:?}", tokens);
        assert_eq!(tokens.len(), 3);
        assert!(matches!(tokens[2], Token::Link(_)));
    }

    #[test]
    fn empty() {
        let tokens = parse_block("");
        assert_eq!(tokens.len(), 0);
    }


    #[test]
    fn highlight_and_hash() {
        let tokens = parse_block("^^Most of the machinery is complex to build and requires team-effort.^^ #signpost_inspiration");
        println!("{:?}", tokens);
        assert_eq!(tokens.len(), 3);
    }

    #[test]
    fn code() {
        let tokens = parse_block(r#"`hello` ```bash # bash comment ``` and ```cpp
        //```"#);
        println!("{:?}", tokens);
        assert_eq!(tokens.len(), 5);
        assert!(matches!(tokens[2], Token::CodeEmbed(_)));


        if let Token::CodeEmbed(c) = &tokens[2] {
            assert_eq!(c.lang, "bash");
            assert_eq!(c.contents, "# bash comment ")
        } else {
            unreachable!()
        }

        if let Token::CodeEmbed(c) = &tokens[4] {
            assert_eq!(c.lang, "cpp");
            assert_eq!(c.contents, "        //")
        } else {
            unreachable!()
        }
    }
}