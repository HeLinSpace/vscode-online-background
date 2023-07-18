"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vsHelp = {
    /**
     * 展示信息提示框
     *
     * @param {string} content 提示内容
     * @returns {Thenable<string>}
     */
    showInfo(content) {
        return vscode_1.window.showInformationMessage(content);
    },
    /**
     * 提示信息并重启
     *
     * @param {any} content 提示内容
     * @returns {Thenable<void>}
     */
    showInfoRestart(content) {
        return vscode_1.window.showInformationMessage(content, { title: "Reload" })
            .then(function (item) {
            if (!item) {
                return;
            }
            vscode_1.commands.executeCommand('workbench.action.reloadWindow');
        });
    },
    showWebview(content) {
        return vscode_1.window.showInformationMessage(content, { title: "OK" })
            .then(function (item) {
            if (!item) {
                return;
            }
            vscode_1.commands.executeCommand('workbench.view.extension.backgroundCover-explorer');
        });
    }
};
exports.default = vsHelp;
//# sourceMappingURL=vsHelp.js.map