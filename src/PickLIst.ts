import * as os from 'os';
import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { FileDom } from './FileDom';
// import vsHelp from './vsHelp';


export class PickList {
	public static itemList: PickList | undefined;

	// 当前配置
	private config: vscode.WorkspaceConfiguration;

	// 下一张壁纸
	private nextBg: string;

	// 当前配置的背景图透明度
	private opacity: number;

	// 当前生效壁纸
	private currentBg: string;

	// 是否初始化
	private configured: boolean;
	// 每次启动时自动更换背景
	private autoStatus: boolean;
	private enabled: boolean;
	// 壁纸类型
	private category: Array<string>;
	// 壁纸历史
	private history: Array<string>;
	// api url
	private bgApiUrl: string;
	// api json key
	private bgImgUrlKey: string;

	/**
	 *  自动更新背景
	 */
	public static autoUpdateBackground() {
		let config = vscode.workspace.getConfiguration('backgroundOnline');
		var current = new PickList(config)

		if (!current.configured) {
			// 更新变量
			current.setConfigValue('opacity', 0.7);
			current.setConfigValue('configured', true);
			current.setConfigValue('autoStatus', true);
			current.setConfigValue('enabled', true);

			current.getRealUrl(1, () => {
				current.reload()
			});
		} else {
			if (current.enabled && current.autoStatus) {
				current.getRealUrl(1);
			}
		}
	}

	/**
	 *  更新背景
	 */
	public static saveSettings(settings: any) {
		let config = vscode.workspace.getConfiguration('backgroundOnline');
		var current = new PickList(config)

		if (!settings.enabled) {
			current.updateDom(true)
			current.reload()
		} else {
			if (settings.opacity !== config.opacity || settings.currentBg !== config.currentBg
				|| settings.category.toString() !== config.category.toString()) {
				current.setConfigValue('opacity', settings.opacity);
				current.setConfigValue('currentBg', settings.currentBg);
				current.setConfigValue('category', settings.category);
				current.currentBg = settings.currentBg
				current.opacity = settings.opacity
				current.category = settings.category

				// 更新分类
				if (settings.category.toString() !== config.category.toString() && settings.currentBg === config.currentBg) {
					current.getRealUrl(2, () => {
						current.reload()
					});
				}
				// 手动替换壁纸
				else if (settings.currentBg !== config.currentBg) {
					current.pushHistory(config.currentBg)
					current.nextBg = settings.currentBg
					current.updateDom()
					current.reload();
				}
			}

			current.setConfigValue('autoStatus', settings.autoStatus);
		}
	}

	private reload(message: string = '壁纸配置完成，重新加载生效？') {
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
	private constructor(config: vscode.WorkspaceConfiguration) {
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
	private getRealUrl(scene: Number, callback: any = null) {

		var url = this.bgApiUrl + "category={" + this.category.join(",") + "}";
		try {
			fetch(url).then(async (res: any) => {
				var data = await res.json()
				if (data && data[this.bgImgUrlKey]) {
					this.pushHistory(this.currentBg)

					var imageUrl = data[this.bgImgUrlKey]
					var currentBg = this.currentBg

					switch (scene) {
						case 1:
							if (!this.nextBg || !currentBg) {
								this.setConfigValue('currentBg', imageUrl);
							} else {
								this.setConfigValue('currentBg', this.nextBg);
							}
							this.nextBg = imageUrl
							this.setConfigValue('nextBg', this.nextBg);
							break;
						case 2:
							this.nextBg = imageUrl
							this.setConfigValue('currentBg', imageUrl);
							this.setConfigValue('nextBg', '');
							break;
					}

					this.updateDom()
					if (callback) {
						callback();
					}
				} else {
					vscode.window.showWarningMessage('获取图片地址失败');
				}
			})
		} catch {
			vscode.window.showWarningMessage('获取图片地址失败');
		}
	}

	// 更新配置
	private setConfigValue(name: string, value: any) {
		// 更新变量
		this.config.update(name, value, vscode.ConfigurationTarget.Global);
		return true;
	}

	// 更新配置
	private pushHistory(value: string) {
		if (value && !this.history.includes(value)) {
			this.history.push(value)
			this.config.update('history', this.history, vscode.ConfigurationTarget.Global);
		}
	}

	// 更新、卸载css
	private updateDom(uninstall: boolean = false) {
		let dom: FileDom = new FileDom(this.nextBg, this.opacity);
		if (uninstall) {
			dom.uninstall();
		} else {
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
					break
			}
		}
	}
}