extern crate wasm_bindgen;
extern crate console_error_panic_hook;

use wasm_bindgen::prelude::*;
use common::roam::RoamPage;
use log::info;
use std::{marker, panic};
use wasm_bindgen::JsCast;

#[wasm_bindgen(typescript_custom_section)]
const TS_COMMON_IMPORT: &'static str = r#"
import { RoamPage } from "../../common/bindings/RoamPage"
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "RoamPage[]")]
    pub type RoamPageArray;
}


#[wasm_bindgen]
pub fn parse_dump(json_contents: String) ->  RoamPageArray {
    info!("calling parse_dump");
    let res = serde_json::from_str::<Vec<RoamPage>>(json_contents.as_str());
    let pages = res.unwrap();
    JsValue::from_serde(&pages).unwrap().unchecked_into::<RoamPageArray>()
}

#[wasm_bindgen]
pub fn init() {
    console_log::init_with_level(log::Level::Info).expect("error initializing log");
    info!("wasm hello world");
    panic::set_hook(Box::new(console_error_panic_hook::hook));
}