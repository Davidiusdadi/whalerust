#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::path::Path;
use std::fs;
use tauri::api::path::{config_dir};
use serde::{Deserialize, Serialize};

#[tauri::command]
fn my_custom_command() {
    println!("I was invoked from JS!");
}


#[derive(Serialize, Deserialize)]
struct Project {
    path: String,
}

#[derive(Serialize, Deserialize)]
struct AppConfigJson {
    version: u32,
    projects: Vec<Project>,
}


fn init_config() {
    let config_dir_path = config_dir().expect("failed to config_dir")
        .join("whalerust".to_string());
    println!("config dir: {}", config_dir_path.to_str().unwrap().to_string());

    if Path::exists(config_dir_path.as_path()) == false {
        fs::create_dir(config_dir_path.as_path()).expect("failed to create config_dir");
    }

    let config_json_file = config_dir_path.join("config.json");

    if Path::exists(config_json_file.as_path()) == false {
        let app_config = AppConfigJson {
            version: 1,
            projects: Vec::new()
        };
        fs::write(config_json_file, serde_json::to_string(&app_config).unwrap().as_str());
    }
}

fn main() {
    init_config();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![my_custom_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
