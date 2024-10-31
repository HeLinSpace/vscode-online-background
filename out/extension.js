'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const PickLIst_1 = require("./PickLIst");
const settings_1 = require("./settings");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
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
                currentPanel = settings_1.Settings.getPanel(context);
                // 监听面板关闭事件
                currentPanel.onDidDispose(() => {
                    currentPanel = undefined;
                }, null, context.subscriptions);
            }
        });
        context.subscriptions.push(startCommand);
        vscode.extensions.onDidChange(() => {
            debugger;
            vscode.window.showInformationMessage('extensions changed!');
        });
    });
}
// this method is called when your extension is deactivated
function deactivate() {
}
//# sourceMappingURL=extension.js.map