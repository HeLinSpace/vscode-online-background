import * as os from 'os';
import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { FileDom } from './FileDom';
import { CategoryItem } from './CategoryItem';
import { getInitConfig } from './InitConfig'

// import vsHelp from './vsHelp';


export class PickList {
	public static itemList: PickList | undefined;

	// 当前配置
	private config: vscode.WorkspaceConfiguration;

	// 当前配置的背景图透明度
	private opacity: number;

	// 当前生效壁纸
	private currentBg: string;

	// 是否初始化
	private configured: boolean;
	// 每次启动时自动更换背景
	private autoStatus: boolean;
	// 是否启用
	private enabled: boolean;
	// 壁纸类型
	private currentSource: CategoryItem;
	// 壁纸历史
	private history: Array<string>;
	// 壁纸源地址
	private sourceUrl: string;
	// 壁纸源版本
	private sourceVersion: string;
	// 是否检查更新
	private checkSourceVersion: boolean;

	// 列表构造方法
	private constructor(config: vscode.WorkspaceConfiguration) {
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
	public static autoUpdateBackground() {
		let config = vscode.workspace.getConfiguration('backgroundOnline');
		var current = new PickList(config)

		if (!current.configured) {
			// 初始化配置
			const initConfig = getInitConfig();

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
				current.reload()
			});
		} else {
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
	public static saveSettings(settings: any) {
		let config = vscode.workspace.getConfiguration('backgroundOnline');
		var current = new PickList(config)

		if (settings.enabled !== config.enabled || settings.opacity !== config.opacity || settings.currentBg !== config.currentBg
			|| settings.currentSource.sourceName !== config.currentSource.sourceName
			|| settings.currentSource.parameters !== config.currentSource.parameters) {
			current.setConfigValue('opacity', settings.opacity);
			current.setConfigValue('currentBg', settings.currentBg);
			current.setConfigValue('currentSource', settings.currentSource);
			current.setConfigValue('autoStatus', settings.autoStatus);

			if (!settings.enabled) {
				current.updateDom(true)
				current.reload()

				return
			}

			// current.currentBg = settings.currentBg
			current.opacity = settings.opacity
			current.currentSource = settings.currentSource

			// 更新分类
			if (settings.currentSource.sourceName !== config.currentSource.sourceName
				|| settings.currentSource.parameters === config.currentSource.parameters) {
				current.getRealUrl(() => {
					current.reload()
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

	private reload(message: string = '壁纸配置完成，重新加载生效（reloadWindow后不好使，请手动关闭再打开）？') {
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
	private getRealUrl(callback: any = null) {
		var url = this.currentSource.baseUrl + this.currentSource.parameters;
		fetch(url).then(async (res: any) => {
			var data = await res.json()
			if (data && data[this.currentSource.imgUrlKey]) {
				this.pushHistory(this.currentBg)

				var imageUrl = data[this.currentSource.imgUrlKey]

				this.setConfigValue('currentBg', imageUrl);
				this.currentBg = imageUrl

				this.updateDom()
				if (callback) {
					callback();
				}
			} else {
				vscode.window.showWarningMessage('获取图片地址失败');
			}
		}).catch((err) => {
			vscode.window.showWarningMessage('获取图片地址失败');
		});
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
		let dom: FileDom = new FileDom(this.currentBg, this.opacity);
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

	private checkSource() {
		var url = this.sourceUrl;
		fetch(url).then(async (res: any) => {
			var data = await res.json()
			if (data && data['version'] !== this.sourceVersion) {
				this.updateSource(data)
			}
		}).catch((err) => {
		});
	}

	private updateSource(source: any) {
		vscode.window.showInformationMessage('作者发布了最新的数据源，是否更新 The author has published the latest data source, whether updated', "Yes", "No", "Don't remind again")
			.then(result => {
				switch (result) {
					case "Yes":
						const serverSources = this.config.imageSource?.filter(
							(item: any) => item.sourceType !== 'server'
						) || [];

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