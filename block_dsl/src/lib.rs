extern crate pest;
#[macro_use]
extern crate pest_derive;

use pest::iterators::Pairs;
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

simple_type!(PageRef, {
    value: String
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


simple_type!(Link, {
    label: String,
    target: String
});

#[derive(TS)]
#[ts(export)]
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Token {
    Plain(Plain),
    Link(Link),
    Bold(Bold),
    PageRef(PageRef),
    Invocation(Invocation),
    BlockRef(BlockRef),
    Italic(Italic),
    Latex(Latex),
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
            Rule::invocation_full => {
            }
            Rule::invocation => {
                let span = pair.as_span();
                tokens.push(Invocation::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
                ));
            }
            Rule::link => {
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
            Rule::page_ref_full => {}
            Rule::page_ref => {
                let span = pair.as_span();
                tokens.push(PageRef::make(
                    span.start() as u32,
                    span.end() as u32,
                    span.as_str().to_string(),
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
}