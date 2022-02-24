extern crate pest;
#[macro_use]
extern crate pest_derive;

use pest::Parser;
use serde::{Deserialize, Serialize};
use ts_rs::TS;


macro_rules! simple_type {
    ($name:ident, { $($field:ident : $type:ty),* } ) => {
            #[derive(TS)]
            #[ts(export)]
            #[derive(Serialize, Deserialize)]
            pub struct $name {
                pub start: u32,
                pub end: u32,
                $(
                    pub $field: $type
                ),*
            }
    };
}


#[derive(Parser)]
#[grammar = "block.pest"]
pub struct BlockParser;


simple_type!(Plain, {
    value: String
});

simple_type!(Link, {
    label: String,
    target: String
});

#[derive(TS)]
#[ts(export)]
#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
enum Token {
    Plain(Plain),
    Link(Link),
}


fn parse_block() {
    let successful_parse = BlockParser::parse(Rule::main, "[[good stuff]] i like it [label](http://localhost)")
        .expect("failed to parse");
    //println!("{:?}", successful_parse);

    let mut tokens:  Vec<Token> = Vec::new();

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
            Rule::invocation => {}
            Rule::invocation_inner => {}
            Rule::image => {}
            Rule::image_label => {}
            Rule::image_target => {}
            Rule::page_ref_full => {}
            Rule::page_ref => {}
            Rule::block_ref_full => {}
            Rule::block_ref => {}
            Rule::style_bold_full => {}
            Rule::style_bold => {}
            Rule::latex_full => {}
            Rule::latex => {}
            Rule::style_italic_full => {}
            Rule::style_italic => {}
            Rule::plain => {
                tokens.push(Token::Plain(Plain {
                    value: "".to_string(),
                    end: 0,
                    start: 0,
                }))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}