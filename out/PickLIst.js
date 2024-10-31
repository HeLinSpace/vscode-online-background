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
const InitConfig_1 = require("./InitConfig");
// import vsHelp from './vsHelp';
class PickList {
    // 列表构造方法
    constructor(config) {
        this.config = config;
        this.enabled = config.enabled;
        this.opacity = config.opacity;
        this.history = config.history;
        this.currentBg = config.currentBg;
        this.configured = config.configured;
        this.autoStatus = config.autoStatus;
        this.currentSource = config.currentSource;
        this.sourceVersion = config.sourceVersion;
        this.sourceUrl = config.sourceUrl;
        this.checkSourceVersion = config.checkSourceVersion;
    }
    /**
     *  自动更新背景
     */
    static autoUpdateBackground() {
        let config = vscode.workspace.getConfiguration('backgroundOnline');
        var current = new PickList(config);
        if (!current.configured) {
            // 初始化配置
            const initConfig = (0, InitConfig_1.getInitConfig)();
            current.setConfigValue('opacity', initConfig.opacity);
            current.setConfigValue('configured', initConfig.configured);
            current.setConfigValue('autoStatus', initConfig.autoStatus);
            current.setConfigValue('enabled', initConfig.enabled);
            current.setConfigValue('imageSource', initConfig.imageSource);
            current.setConfigValue('currentSource', initConfig.currentSource);
            current.setConfigValue('sourceVersion', initConfig.sourceVersion);
            current.setConfigValue('sourceUrl', initConfig.sourceUrl);
            current.setConfigValue('checkSourceVersion', initConfig.checkSourceVersion);
            current.getRealUrl(() => {
                current.reload();
            });
        }
        else {
            if (current.enabled && current.autoStatus) {
                if (current.checkSourceVersion) {
                    current.checkSource();
                }
                current.getRealUrl();
            }
        }
    }
    /**
     *  更新背景
     */
    static saveSettings(settings) {
        let config = vscode.workspace.getConfiguration('backgroundOnline');
        var current = new PickList(config);
        if (settings.enabled !== config.enabled || settings.opacity !== config.opacity || settings.currentBg !== config.currentBg
            || settings.currentSource.sourceName !== config.currentSource.sourceName
            || settings.currentSource.parameters !== config.currentSource.parameters) {
            current.setConfigValue('opacity', settings.opacity);
            current.setConfigValue('currentBg', settings.currentBg);
            current.setConfigValue('currentSource', settings.currentSource);
            current.setConfigValue('autoStatus', settings.autoStatus);
            if (!settings.enabled) {
                current.updateDom(true);
                current.reload();
                return;
            }
            // current.currentBg = settings.currentBg
            current.opacity = settings.opacity;
            current.currentSource = settings.currentSource;
            // 更新分类
            if (settings.currentSource.sourceName !== config.currentSource.sourceName
                || settings.currentSource.parameters === config.currentSource.parameters) {
                current.getRealUrl(() => {
                    current.reload();
                });
            }
            // 手动替换壁纸
            // else if (settings.currentBg !== config.currentBg) {
            // 	current.pushHistory(config.currentBg)
            // 	current.currentBg = settings.currentBg
            // 	current.updateDom()
            // 	current.reload();
            // }
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
    /**
     *
     * @param callback
     */
    getRealUrl(callback = null) {
        var url = this.currentSource.baseUrl + this.currentSource.parameters;
        (0, node_fetch_1.default)(url).then((res) => __awaiter(this, void 0, void 0, function* () {
            var data = yield res.json();
            if (data && data[this.currentSource.imgUrlKey]) {
                this.pushHistory(this.currentBg);
                var imageUrl = data[this.currentSource.imgUrlKey];
                this.setConfigValue('currentBg', imageUrl);
                this.currentBg = imageUrl;
                this.updateDom();
                if (callback) {
                    callback();
                }
            }
            else {
                vscode.window.showWarningMessage('获取图片地址失败');
            }
        })).catch((err) => {
            vscode.window.showWarningMessage('获取图片地址失败');
        });
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
        let dom = new FileDom_1.FileDom(this.currentBg, this.opacity);
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
    checkSource() {
        var url = this.sourceUrl;
        (0, node_fetch_1.default)(url).then((res) => __awaiter(this, void 0, void 0, function* () {
            var data = yield res.json();
            if (data && data['version'] !== this.sourceVersion) {
                this.updateSource(data);
            }
        })).catch((err) => {
            debugger;
        });
    }
    updateSource(source) {
        vscode.window.showInformationMessage('作者发布了最新的数据源，是否更新 The author has published the latest data source, whether updated', "Yes", "No", "Don't remind again")
            .then(result => {
            var _a;
            switch (result) {
                case "Yes":
                    const serverSources = ((_a = this.config.imageSource) === null || _a === void 0 ? void 0 : _a.filter((item) => item.sourceType !== 'server')) || [];
                    // 合并 source 中的 imageSource
                    const newImageSource = [
                        ...serverSources,
                        ...(source.imageSource || [])
                    ];
                    this.setConfigValue('imageSource', newImageSource);
                    this.setConfigValue('currentSource', source.currentSource);
                    this.setConfigValue('sourceVersion', source.version);
                    break;
                case "Don't remind again":
                    this.setConfigValue('checkSourceVersion', false);
                    break;
                default:
                    break;
            }
        });
    }
}
exports.PickList = PickList;
//# sourceMappingURL=PickLIst.js.map