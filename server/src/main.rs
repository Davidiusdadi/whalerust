#[macro_use]
extern crate rocket;

use common::roam::{RoamBlock, RoamPage};

use std::{env, fs};
use std::error::Error;
use std::process::{exit};
use std::sync::Arc;
use rocket::response::content;
use rocket::State;
use rocket::fs::FileServer;


struct ServerState {
    dump: Arc<Vec<RoamPage>>,
}


#[get("/dump")]
fn route_dump(state: &State<ServerState>) -> content::Json<String> {
    let res = serde_json::to_string(&*state.dump);

    match res {
        Err(_) => {
            content::Json(String::from("[]"))
        }
        Ok(r) => content::Json(r)
    }
}

#[rocket::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 2 {
        println!("error: provide path to roam dump");
        exit(1)
    }

    let contents = fs::read_to_string(&args[1]).expect("could not find dump file");

    let dump: Vec<RoamPage> = serde_json::from_str(contents.as_str()).expect("failed to parse the loaded file...");

    fn print_blocks(children: &Vec<RoamBlock>, depth: u32) {
        let padding = match depth {
            0 => String::new(),
            _ => format!("{1:0$}", (depth * 4) as usize, " ")
        };

        for block in children {
            println!("{}- {}", padding, block.string);
            if let Some(children_nested) = &block.children {
                print_blocks(children_nested, depth + 1);
            }
        }
    }

    for page in &dump {
        println!("Page: {}", page.title);
        if let Some(children) = &page.children {
            print_blocks(children.as_ref(), 0)
        }
    }

    let state = ServerState { dump: Arc::new(dump) };


    let mut the_rocket = rocket::build()
        .manage(state);

    let node_env = env::var("NODE_ENV").unwrap_or("development".to_string());

    if node_env == "development" {
        println!("launching in development mode");
        // dev builds serve /public via webpack dev-server
        the_rocket = the_rocket.mount("/", routes![route_dump]);
    } else {
        println!("launching in production mode");
        the_rocket = the_rocket
            .mount("/api/", routes![route_dump])
            .mount("/", FileServer::from("public"));
    }

    the_rocket
        .launch()
        .await.expect("failed to start server");

    Ok(())
}
