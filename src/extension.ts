import * as vscode from 'vscode';
import * as l10n from '@vscode/l10n';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

export function activate(context: vscode.ExtensionContext) {
  let activityVersion = 0;
  let lastNotifiedVersion = 0;
  let pendingInformationMessage = false;
  let inactivityTimer: NodeJS.Timeout | undefined;
  const inactivityDelayMs = 3000;
  const audioFilePath = join(
    context.extensionPath,
    'media',
    'task_completed.mp3',
  );

  const getConfig = () => vscode.workspace.getConfiguration('pingMe');

  const showInformationNotification = (message?: string) => {
    vscode.window.showInformationMessage(message ?? l10n.t('AI response finished'));
  };

  const playNotificationSound = () => {
    const playerProcess = spawn('afplay', [audioFilePath], {
      stdio: 'ignore',
      detached: true,
    });
    playerProcess.on('error', (error) => {
      console.error('Unable to play notification sound:', error);
    });
    playerProcess.unref();
  };

  let pendingMessage: string | undefined;

  const notifyCompletion = (message?: string) => {
    playNotificationSound();
    if (vscode.window.state.focused) {
      pendingInformationMessage = false;
      showInformationNotification(message);
      return;
    }
    pendingMessage = message;
    pendingInformationMessage = true;
  };

  const markActivity = () => {
    if (!getConfig().get<boolean>('automaticDetection', true)) {
      return;
    }

    activityVersion += 1;
    const currentVersion = activityVersion;
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    inactivityTimer = setTimeout(() => {
      if (currentVersion <= lastNotifiedVersion) {
        return;
      }
      if (vscode.window.state.focused) {
        return;
      }
      lastNotifiedVersion = currentVersion;
      notifyCompletion();
    }, inactivityDelayMs);
  };

  const onDidChangeTextDocumentDisposable =
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.contentChanges.length === 0) {
        return;
      }
      markActivity();
    });
  const onDidCreateFilesDisposable = vscode.workspace.onDidCreateFiles(() => {
    markActivity();
  });
  const onDidDeleteFilesDisposable = vscode.workspace.onDidDeleteFiles(() => {
    markActivity();
  });
  const onDidRenameFilesDisposable = vscode.workspace.onDidRenameFiles(() => {
    markActivity();
  });
  const onDidStartTerminalShellExecutionDisposable =
    vscode.window.onDidStartTerminalShellExecution(() => {
      markActivity();
    });
  const onDidChangeWindowStateDisposable = vscode.window.onDidChangeWindowState(
    (windowState) => {
      if (!windowState.focused || !pendingInformationMessage) {
        return;
      }
      pendingInformationMessage = false;
      const message = pendingMessage;
      pendingMessage = undefined;
      showInformationNotification(message);
    },
  );

  const notifyCommandDisposable = vscode.commands.registerCommand(
    'ping-me.notify',
    () => {
      notifyCompletion();
    },
  );

  const permissionRequestCommandDisposable = vscode.commands.registerCommand(
    'ping-me.permissionRequest',
    () => {
      const workspaceName = vscode.workspace.name ?? 'Unknown';
      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';
      const detail = workspacePath ? ` [${workspaceName}] (${workspacePath})` : ` [${workspaceName}]`;
      notifyCompletion(l10n.t('Permission needed') + detail);
    },
  );

  const uriHandlerDisposable = vscode.window.registerUriHandler({
    handleUri(uri: vscode.Uri) {
      if (!getConfig().get<boolean>('enableUriHandler', true)) {
        return;
      }
      const params = new URLSearchParams(uri.query);
      if (uri.path === '/notify') {
        const message = params.get('message') ?? undefined;
        notifyCompletion(message);
      } else if (uri.path === '/permissionRequest') {
        const project = params.get('project');
        const path = params.get('path');
        const detail = project && path ? ` [${project}] (${path})` : project ? ` [${project}]` : '';
        notifyCompletion(l10n.t('Permission needed') + detail);
      }
    },
  });

  context.subscriptions.push(uriHandlerDisposable);
  context.subscriptions.push(onDidStartTerminalShellExecutionDisposable);
  context.subscriptions.push(onDidChangeTextDocumentDisposable);
  context.subscriptions.push(onDidCreateFilesDisposable);
  context.subscriptions.push(onDidDeleteFilesDisposable);
  context.subscriptions.push(onDidRenameFilesDisposable);
  context.subscriptions.push(onDidChangeWindowStateDisposable);
  context.subscriptions.push(notifyCommandDisposable);
  context.subscriptions.push(permissionRequestCommandDisposable);
  context.subscriptions.push({
    dispose: () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    },
  });
}

export function deactivate() {}
