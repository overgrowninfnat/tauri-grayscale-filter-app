
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use base64::{ encode, decode };
use image::load_from_memory;
use image::ImageOutputFormat::Png;


#[tauri::command]
fn grayscale(encoded_file: &str) -> (Vec<u8>, String) {
  let base64_to_vector = decode(encoded_file).unwrap();

  let mut img = load_from_memory(&base64_to_vector).unwrap();

  img = img.grayscale();

  let mut buffer = vec![];
  img.write_to(&mut buffer, Png).unwrap();
   
  let encoded_img = encode(&buffer);
  let data_url = format!(
    "data:image/png;base64,{}",
    encoded_img
  );

 return (buffer, data_url)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![grayscale])  
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}


