# Ping Me

Play a sound and show a notification when an AI response is ready, so you can step away while the AI works.

## Features

- **Sound alert**: Plays a sound when the AI finishes responding.
- **Notification**: Shows an information message "AI response finished" when VS Code regains focus.
- **Smart detection**: Monitors document changes, file operations, and terminal activity to detect when the AI stops working.
- **URI handler**: Supports triggering notifications via `vscode://yhondri.ping-me/notify`.
- **Manual command**: Run `Ping Me: Notify` from the Command Palette to trigger a notification manually.

## How It Works

The extension supports two modes:

- **Automatic**: Watches for activity (document edits, file operations, terminal executions). After 3 seconds of inactivity while VS Code is not focused, it plays a sound and queues a notification.
- **Hook**: An external tool (e.g. Claude Code) triggers the notification explicitly via the URI `vscode://yhondri.ping-me/notify`.

In both modes, the notification message is shown as soon as you switch back to VS Code.

## Settings

**`pingMe.automaticDetection`** (default: `true`)
Enable automatic detection via inactivity timer. Set to `false` to disable timer-based notifications entirely.

**`pingMe.enableUriHandler`** (default: `true`)
Enable the URI handler so external tools (e.g. Claude Code hooks) can trigger notifications via `vscode://yhondri.ping-me/notify`. Set to `false` to disable it.

### Using the URI handler with Claude Code

With `pingMe.enableUriHandler` enabled, you can configure a Claude Code hook to notify you when a task finishes:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "open 'vscode://yhondri.ping-me/notify'"
          }
        ]
      }
    ]
  }
}
```

## Credits

- Notification sound: [Tarea completa.wav](https://freesound.org/s/541389/) by valeulloam97 — License: Creative Commons 0

## Requirements

- macOS (uses `afplay` for audio playback).

## Release Notes

### 1.0.0

Initial release.
