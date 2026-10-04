#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Manager, PhysicalPosition, Position};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // 1. Menu da Bandeja (Tray)
            let quit_i = MenuItem::with_id(app, "quit", "Fechar SayIt", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;

            let mut tray_builder = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(|app, event| {
                    if event.id() == "quit" {
                        app.exit(0);
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                });

            if let Some(app_icon) = app.default_window_icon() {
                tray_builder = tray_builder.icon(app_icon.clone());
            }

            tray_builder.build(app)?;

            // 2. Posicionamento da Janela
            if let Some(window) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let screen_size = monitor.size();
                    let window_size = window
                        .outer_size()
                        .unwrap_or(tauri::PhysicalSize::new(300, 340));

                    let x = screen_size.width as i32 - window_size.width as i32 - 20;
                    let y = screen_size.height as i32 - window_size.height as i32 - 70;

                    let _ = window.set_position(Position::Physical(PhysicalPosition::new(x, y)));
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}