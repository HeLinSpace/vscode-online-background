"use strict";
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
exports.PickList = void 0;
const os = require("os");
const vscode = require("vscode");
const node_fetch_1 = require("node-fetch");
const FileDom_1 = require("./FileDom");
// import vsHelp from './vsHelp';
class PickList {
    /**
     *  自动更新背景
     */
    static autoUpdateBackground() {
        let config = vscode.workspace.getConfiguration('backgroundOnline');
        var current = new PickList(config);
        if (!current.configured) {
            // 更新变量
            current.setConfigValue('opacity', 0.7);
            current.setConfigValue('configured', true);
            current.setConfigValue('autoStatus', true);
            current.setConfigValue('enabled', true);
            current.getRealUrl(1, () => {
                current.reload();
            });
        }
        else {
            if (current.enabled && current.autoStatus) {
                current.getRealUrl(1);
            }
        }
    }
    /**
     *  更新背景
     */
    static saveSettings(settings) {
        let config = vscode.workspace.getConfiguration('backgroundOnline');
        var current = new PickList(config);
        if (!settings.enabled) {
            current.updateDom(true);
            current.reload();
        }
        else {
            if (settings.opacity !== config.opacity || settings.currentBg !== config.currentBg
                || settings.category.toString() !== config.category.toString()) {
                current.setConfigValue('opacity', settings.opacity);
                current.setConfigValue('currentBg', settings.currentBg);
                current.setConfigValue('category', settings.category);
                current.currentBg = settings.currentBg;
                current.opacity = settings.opacity;
                current.category = settings.category;
                // 更新分类
                if (settings.category.toString() !== config.category.toString() && settings.currentBg === config.currentBg) {
                    current.getRealUrl(2, () => {
                        current.reload();
                    });
                }
                // 手动替换壁纸
                else if (settings.currentBg !== config.currentBg) {
                    current.pushHistory(config.currentBg);
                    current.nextBg = settings.currentBg;
                    current.updateDom();
                    current.reload();
                }
            }
            current.setConfigValue('autoStatus', settings.autoStatus);
        }
    }
    reload(message = '壁纸配置完成，重新加载生效？') {
        vscode.window.showInformationMessage(message, "Yes", "No")
            .then(result => {
            switch (result) {
                case "Yes":
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                    break;
                default:
                    break;
            }
        });
    }
    // 列表构造方法
    constructor(config) {
        this.config = config;
        this.enabled = config.enabled;
        this.nextBg = config.nextBg;
        this.opacity = config.opacity;
        this.history = config.history;
        this.currentBg = config.currentBg;
        this.configured = config.configured;
        this.autoStatus = config.autoStatus;
        this.category = config.category;
        this.bgApiUrl = config.bgApiUrl;
        this.bgImgUrlKey = config.bgImgUrlKey;
    }
    /**
     *
     * @param scene 1 自动更新 2 手动设置更新
     * @param callback
     */
    getRealUrl(scene, callback = null) {
        var url = this.bgApiUrl + "category={" + this.category.join(",") + "}";
        try {
            (0, node_fetch_1.default)(url).then((res) => __awaiter(this, void 0, void 0, function* () {
                var data = yield res.json();
                if (data && data[this.bgImgUrlKey]) {
                    this.pushHistory(this.currentBg);
                    var imageUrl = data[this.bgImgUrlKey];
                    var currentBg = this.currentBg;
                    switch (scene) {
                        case 1:
                            if (!this.nextBg || !currentBg) {
                                this.setConfigValue('currentBg', imageUrl);
                            }
                            else {
                                this.setConfigValue('currentBg', this.nextBg);
                            }
                            this.nextBg = imageUrl;
                            this.setConfigValue('nextBg', this.nextBg);
                            break;
                        case 2:
                            this.nextBg = imageUrl;
                            this.setConfigValue('currentBg', imageUrl);
                            this.setConfigValue('nextBg', '');
                            break;
                    }
                    this.updateDom();
                    if (callback) {
                        callback();
                    }
                }
                else {
                    vscode.window.showWarningMessage('获取图片地址失败');
                }
            }));
        }
        catch (_a) {
            vscode.window.showWarningMessage('获取图片地址失败');
        }
    }
    // 更新配置
    setConfigValue(name, value) {
        // 更新变量
        this.config.update(name, value, vscode.ConfigurationTarget.Global);
        return true;
    }
    // 更新配置
    pushHistory(value) {
        if (value && !this.history.includes(value)) {
            this.history.push(value);
            this.config.update('history', this.history, vscode.ConfigurationTarget.Global);
        }
    }
    // 更新、卸载css
    updateDom(uninstall = false) {
        let dom = new FileDom_1.FileDom(this.nextBg, this.opacity);
        if (uninstall) {
            dom.uninstall();
        }
        else {
            switch (os.type()) {
                case 'Windows_NT':
                    dom.install();
                    break;
                case 'Darwin':
                    dom.installMac();
                    break;
                case 'Linux':
                    dom.install(); // 暂未做对应处理
                    break;
                default:
                    dom.install();
                    break;
            }
        }
    }
}
exports.PickList = PickList;
//# sourceMappingURL=PickLIst.js.map