'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PickList } from './PickLIst';
import { Settings } from './settings';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	PickList.autoUpdateBackground();

	// 创建底部按钮

	// 设置
	let settingBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	settingBtn.text = '$(tools)';
	settingBtn.command = 'extension.backgroundOnline.setting';
	settingBtn.tooltip = '壁纸设置';
	settingBtn.show();

	// 快捷切换壁纸
	let refreshBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	refreshBtn.text = '$(sync)';
	refreshBtn.command = 'workbench.action.reloadWindow';
	refreshBtn.tooltip = '下一张（自动重启）';
	refreshBtn.show();

	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	// let randomCommand = vscode.commands.registerCommand('extension.backgroundCover.refresh', () => { PickList.randomUpdateBackground(); });
	let startCommand = vscode.commands.registerCommand('extension.backgroundOnline.setting',
		() => {
			const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
			if (currentPanel) {
				// 如果我们已经有了一个面板，那就把它显示到目标列布局中
				currentPanel.reveal(columnToShowIn);
			} else {
				Settings.getPanel(context);
			}
		});
	context.subscriptions.push(startCommand);
	// context.subscriptions.push(randomCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

