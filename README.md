# Ping Me

A Visual Studio Code extension that plays a sound and shows a notification when your AI agent finishes a task, so you can step away and get notified the moment it's done.

Available on the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=yhondri.ping-me).

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

With `pingMe.enableUriHandler` enabled, you can configure Claude Code hooks in `~/.claude/settings.json`.

**Notify when a task finishes (`Stop` hook):**

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

**Notify when the agent needs permission (`PermissionRequest` hook, e.g. Claude Code):**

The `/permissionRequest` URI shows a "Permission needed" message including the project name and path, so you know which window to switch to when working with multiple projects open simultaneously.

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "open \"vscode://yhondri.ping-me/permissionRequest?project=$(basename $PWD)&path=$PWD\""
          }
        ]
      }
    ]
  }
}
```

The notification will read: `Permission needed [my-project] (/path/to/my-project)`

### Using the URI handler with Codex (or any CLI agent)

If your tool does not provide native hooks, you can still trigger Ping Me after a task by running the tool through a shell wrapper and calling the URI when it exits.

**One-off command:**

```bash
your-agent-command; open 'vscode://yhondri.ping-me/notify'
```

**Reusable script (`~/bin/agent-with-ping`):**

```bash
#!/usr/bin/env bash
set -euo pipefail
status=0
"$@" || status=$?
open 'vscode://yhondri.ping-me/notify'
exit "$status"
```

Make it executable:

```bash
chmod +x ~/bin/agent-with-ping
```

Then run your tasks through it:

```bash
~/bin/agent-with-ping your-agent-command --your-flags
```

## Credits

- Notification sound: [Tarea completa.wav](https://freesound.org/s/541389/) by valeulloam97 — License: Creative Commons 0

## Requirements

- macOS (uses `afplay` for audio playback).

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).
