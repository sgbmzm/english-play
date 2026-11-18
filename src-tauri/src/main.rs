// Small desktop wrapper (Tauri + the WebView2 built into Windows):
// shows only the game — no address bar, no tabs, no leaving the page.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{WebviewUrl, WebviewWindowBuilder};

const LOCKDOWN_JS: &str = r#"
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'F11') {
    e.preventDefault();
    try {
      const w = window.__TAURI__.window.getCurrentWindow();
      w.isFullscreen().then(f => w.setFullscreen(!f));
    } catch (_) {}
    return;
  }
  const editing = ['a','c','v','x','z','y'].includes((e.key || '').toLowerCase());
  if (['F3','F5','F7','F12','BrowserBack','BrowserForward','BrowserRefresh'].includes(e.key) ||
      ((e.ctrlKey || e.metaKey) && !editing) ||
      (e.altKey && ['ArrowLeft','ArrowRight'].includes(e.key))) {
    e.preventDefault();
  }
}, true);
"#;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("לומדים ABC")
                .inner_size(1280.0, 800.0)
                .min_inner_size(360.0, 500.0)
                .maximized(true)
                .initialization_script(LOCKDOWN_JS)
                .on_navigation(|url| {
                    url.scheme() == "tauri" || url.host_str() == Some("tauri.localhost")
                })
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the app");
}
