#[macro_use]
extern crate log;

#[cfg(test)]
#[macro_use]
extern crate rstest;

mod commands;
mod oauth_server;
mod platform;
mod translation;

use std::sync::atomic::AtomicUsize;
use std::sync::atomic::Ordering;

use platform::config::init_env;
use platform::*;
use translation::*;

use tauri::*;

use tauri::scope::ipc::RemoteDomainAccessScope;

pub const ALLOWED_DOMAINS: [&str; 3] = ["tauri.localhost", "localhost", "gramax"];

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let builder = Builder::default().init().attach_commands().attach_plugins();
  let context = tauri::generate_context!();

  #[cfg(target_os = "macos")]
  let builder = builder.on_window_event(platform::window_event_handler);

  let app = builder.build(context).expect("Can't build app");

  init_env(app.handle());

  #[cfg(desktop)]
  {
    #[cfg(target_family = "unix")]
    app.setup_menu().expect("unable to setup menu");
    app.setup_updater().expect("unable to setup updater");
  }

  app.run(|_, _| {});
}

pub fn build_main_window<R: Runtime>(app: &AppHandle<R>) -> Result<Window<R>> {
  static NEXT_ID: AtomicUsize = AtomicUsize::new(0);

  let window = WindowBuilder::new(
    app,
    format!("main_{}", NEXT_ID.fetch_add(1, Ordering::Relaxed)),
    WindowUrl::App("index.html".into()),
  )
  .initialization_script(include_str!("init.js"))
  .on_navigation(on_navigation)
  .disable_file_drop_handler();

  #[cfg(target_os = "macos")]
  let window = {
    let downloads_path = app.path().download_dir().unwrap_or_default();
    window.on_download(move |_, ev| match ev {
      window::DownloadEvent::Requested { url: _, destination } => {
        *destination = downloads_path.join(&destination);
        true
      }
      _ => true,
    })
  };

  #[cfg(desktop)]
  let window = window
    .title(app.package_info().name.clone())
    .maximized(true)
    .enable_clipboard_access()
    .inner_size(900.0, 600.0);

  let window = window.build()?;

  window_post_init(&window)?;
  Ok(window)
}

trait AppBuilder {
  fn init(self) -> Self;
  fn attach_plugins(self) -> Self;
  fn attach_commands(self) -> Self;
}

impl<R: Runtime> AppBuilder for Builder<R> {
  fn init(self) -> Self {
    self.manage(Language::detect_user_language()).setup(|app| {
      app.ipc_scope().configure_remote_access(
        RemoteDomainAccessScope::new("tauri.localhost")
          .add_plugins(["gramaxfs", "shell", "app", "dialog"])
          .add_window("settings")
      );

      build_main_window(app.handle())?;
      Ok(())
    })
  }

  #[allow(clippy::let_and_return)]
  fn attach_plugins(self) -> Self {
    let app = self
      .plugin(plugin_gramax_fs::init())
      .plugin(plugin_gramax_git::init())
      .plugin(tauri_plugin_dialog::init());

    #[cfg(desktop)]
    let app = app
      .plugin(plugin_gramax_fs::init())
      .plugin(tauri_plugin_shell::init())
      .plugin(tauri_plugin_updater::Builder::new().build());

    #[cfg(not(target_os = "android"))]
    let app = {
      use log::LevelFilter;
      use tauri_plugin_log::*;
      app.plugin(
        Builder::default()
          .targets([Target::new(TargetKind::Webview), Target::new(TargetKind::Stdout)])
          .level(LevelFilter::Info)
          .format(|f, _, record| {
            f.finish(format_args!(
              "{level:<6} {target} {sep} {body}",
              level = record.level(),
              target = record.target(),
              sep = "#",
              body = record.args()
            ));
          })
          .build(),
      )
    };

    app
  }

  fn attach_commands(self) -> Self {
    commands::generate_handler(self)
  }
}
