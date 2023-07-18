'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const PickLIst_1 = require("./PickLIst");
const settings_1 = require("./settings");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    PickLIst_1.PickList.autoUpdateBackground();
    // 创建底部按钮
    // 设置
    let settingBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    settingBtn.text = '$(tools)';
    settingBtn.command = 'extension.backgroundOnline.setting';
    settingBtn.tooltip = '壁纸设置';
    settingBtn.show();
    let currentPanel = undefined;
    let startCommand = vscode.commands.registerCommand('extension.backgroundOnline.setting', () => {
        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (currentPanel) {
            // 如果我们已经有了一个面板，那就把它显示到目标列布局中
            currentPanel.reveal(columnToShowIn);
        }
        else {
            settings_1.Settings.getPanel(context);
        }
    });
    context.subscriptions.push(startCommand);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map