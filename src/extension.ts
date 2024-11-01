'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PickList } from './PickLIst';
import { Settings } from './settings';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	PickList.autoUpdateBackground();

	// 创建底部按钮

	// 设置
	let settingBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	settingBtn.text = '$(tools)';
	settingBtn.command = 'extension.backgroundOnline.setting';
	settingBtn.tooltip = '壁纸设置';
	settingBtn.show();

	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	let startCommand = vscode.commands.registerCommand('extension.backgroundOnline.setting',
		() => {
			const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
			if (currentPanel) {
				// 如果我们已经有了一个面板，那就把它显示到目标列布局中
				currentPanel.reveal(columnToShowIn);
			} else {
				currentPanel = Settings.getPanel(context);
				// 监听面板关闭事件
				currentPanel.onDidDispose(
					() => {
						currentPanel = undefined;
					},
					null,
					context.subscriptions
				);
			}
		});
	context.subscriptions.push(startCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

