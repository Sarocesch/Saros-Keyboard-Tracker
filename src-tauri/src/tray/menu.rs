use crate::hooks::input_hook;
use tauri::{
    image::Image,
    menu::{CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    App, Manager,
};

pub fn build_tray(app: &mut App) -> tauri::Result<()> {
    let open  = MenuItemBuilder::with_id("open",  "Open").build(app)?;
    let hide  = MenuItemBuilder::with_id("hide",  "Hide").build(app)?;
    let pause = CheckMenuItemBuilder::with_id("pause_tracking", "Pause Tracking")
        .checked(false)
        .build(app)?;
    let sep  = PredefinedMenuItem::separator(app)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[&open, &hide, &sep, &pause, &sep2, &quit])
        .build()?;

    // Load icon directly from bundled bytes — avoids runtime None panic
    let icon = Image::from_bytes(include_bytes!("../../icons/32x32.png"))?;

    TrayIconBuilder::with_id("main-tray")
        .icon(icon)
        .menu(&menu)
        .tooltip("Saros Keyboard Tracker")
        .on_menu_event(|app, event| match event.id().as_ref() {
            "open" => show_window(app),
            "hide" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.hide();
                }
            }
            "pause_tracking" => {
                // CheckMenuItem auto-toggles its visual state; we sync the hook.
                let now_paused = input_hook::toggle_paused();
                if let Some(tray) = app.tray_by_id("main-tray") {
                    let tooltip = if now_paused {
                        "Saros Keyboard Tracker — Tracking Paused"
                    } else {
                        "Saros Keyboard Tracker"
                    };
                    let _ = tray.set_tooltip(Some(tooltip));
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| match event {
            // Single left-click OR double-click both open the window
            TrayIconEvent::Click {
                button: MouseButton::Left,
                ..
            }
            | TrayIconEvent::DoubleClick {
                button: MouseButton::Left,
                ..
            } => show_window(tray.app_handle()),
            _ => {}
        })
        .build(app)?;

    Ok(())
}

fn show_window<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.set_focus();
    }
}
