#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Manager, PhysicalPosition, Position}; // Necessário para conseguir encontrar a janela (get_webview_window)
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 1. Configuração do Menu e Bandeja (Relógio)
            let quit_i = MenuItem::with_id(app, "quit", "Fechar SayIt", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;

            let app_icon = app.default_window_icon().unwrap().clone();

            TrayIconBuilder::new()
                .icon(app_icon)
                .menu(&menu)
                .on_menu_event(|_app, event| {
                    if event.id.as_ref() == "quit" {
                        std::process::exit(0);
                    }
                })
                .build(app)?;

            if let Some(window) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let screen_size = monitor.size();
                    let window_size = window.outer_size().unwrap_or(tauri::PhysicalSize::new(300, 400));

                    let x = screen_size.width as i32 - window_size.width as i32 - 20;
                    let y = screen_size.height as i32 - window_size.height as i32 - 70;

                    let _ = window.set_position(Position::Physical(PhysicalPosition::new(x, y)));
                } 
            }

        
            let toggle_shortcut = Shortcut::new(Some(Modifiers::SHIFT), Code::KeyS);

        
            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |app_handle, shortcut, event| {
                      
                        if shortcut == &toggle_shortcut {
                     
                            if event.state() == ShortcutState::Pressed {
                           
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let is_visible = window.is_visible().unwrap_or(false);
                                    
                                    if is_visible {
                                        window.hide().unwrap(); 
                                    } else {
                                        window.show().unwrap();
                                        window.set_focus().unwrap(); 
                                    }
                                }
                            }
                        }
                    })
                    .build(),
            )?;

      
            app.global_shortcut().register(toggle_shortcut)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}