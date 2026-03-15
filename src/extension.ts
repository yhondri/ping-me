import * as vscode from 'vscode';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('ping-me.notify', () => {
		vscode.window.showInformationMessage('AI response finished');

		const audioFilePath = join(context.extensionPath, 'media', 'task_completed.mp3');
		const playerProcess = spawn('afplay', [audioFilePath], {
			stdio: 'ignore',
			detached: true,
		});
		playerProcess.on('error', (error) => {
			console.error('Unable to play notification sound:', error);
		});
		playerProcess.unref();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
