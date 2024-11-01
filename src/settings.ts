import * as vscode from 'vscode';
import * as path from 'path';
import { PickList } from './PickLIst';

export class Settings {
	private static panel: vscode.WebviewPanel | undefined;
	public static getPanel(context: vscode.ExtensionContext) {
		const webviewDir = context.extensionPath;

		// 创建和显示webview
		Settings.panel = vscode.window.createWebviewPanel('setting', "online background setting", vscode.ViewColumn.One, {
			enableScripts: true,
			// 允许加载所有本地资源
			localResourceRoots: [vscode.Uri.file(path.join(webviewDir, 'out'))]
		});

		// 修改jQuery路径的获取方式
		const jqueryPath = Settings.panel.webview.asWebviewUri(
			vscode.Uri.file(path.join(context.extensionPath, 'out', 'jquery-3.7.0.min.js'))
		);

		// 设置HTML内容
		Settings.panel.webview.html = Settings.getWebviewContent(jqueryPath);

		// Handle messages from the webview
		Settings.panel.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'save':
					var configs = JSON.parse(message.text);
					PickList.saveSettings(configs);
					return;
			}
		}, undefined, context.subscriptions);

		Settings.panel.onDidDispose(() => {
			Settings.panel = undefined;
		});

		return Settings.panel;
	}

	public static getWebviewContent(jqueryPathSrc: any) {

		let config = vscode.workspace.getConfiguration('backgroundOnline');

		const imageSource = config.imageSource
		let currentSource = config.currentSource
		if (!currentSource && imageSource.length > 0) {
			currentSource = {
				sourceName: imageSource[0].sourceName,
				parameters: imageSource[0].parameters,
				baseUrl: imageSource[0].baseUrl,
				imgUrlKey: imageSource[0].imgUrlKey,
				category: imageSource[0].category?.[0]?.name || ""
			}
		}


		let imageSourceStr = '<select id="imageSource" style="width:300px;" onchange="handleSourceChange(this)">';
		imageSource.forEach((element: any) => {
			const selected = currentSource.sourceName === element.sourceName ? 'selected="selected"' : '';
			imageSourceStr += `<option value="${element.sourceName}" ${selected}>${element.sourceName}</option>`;
		});
		imageSourceStr += '</select>';

		let categoryListStr = "";
		const categoryList = imageSource.find((source: any) => source.sourceName === currentSource.sourceName)?.category || [];
		categoryList.forEach((element: any, index: number) => {
			var checked = "";
			if (currentSource.category) {
				// 如果存在 category，按原逻辑匹配
				if (currentSource.category === element.name) {
					checked = "checked";
				}
			} else {
				// 如果不存在 category，选中第一个
				if (index === 0) {
					checked = "checked";
				}
			}
			categoryListStr += `<input type="radio" name="category" value="${element.parameters}" ${checked} /><label>${element.name}</label>`;
		});

		let categoryListTrStr = '<tr id="categoryList_tr"></tr>';

		if (categoryListStr) {
			categoryListTrStr = `<tr id="categoryList_tr">
									<td align="right">壁纸类型：</td>
									<td width="20px"></td>
									<td id="categoryList_td">
										${categoryListStr}
									</td>
								</tr>`
		}

		var enabled = "";
		var disabled = "";
		if (config.enabled == 1) {
			enabled = "checked"
		} else {
			disabled = "checked"
		}

		var autoStatusEnabled = "";
		var autoStatusDisabled = "";
		if (config.autoStatus == 1) {
			autoStatusEnabled = "checked"
		} else {
			autoStatusDisabled = "checked"
		}

		return `<!DOCTYPE html>
		<html lang="en">
		
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>online background setting</title>
			<style>
				tr {
					line-height: 40px;
				}
			</style>
		</head>
		
		<body>
			<table style="margin: 20px;">
				<tbody>
					<tr>
						<td align="right">在线壁纸插件：</td>
						<td width="20px"></td>
						<td>
							<input type="radio" onchange="handleClick(this)" name="enabled" value=true ${enabled} />
							<label for="meinv">开启</label>
							<input type="radio" onchange="handleClick(this)" name="enabled" value=false ${disabled}/>
							<label for="dongman">关闭</label>
						</td>
					</tr>
					<tr>
						<td align="right">自动切换壁纸：</td>
						<td width="20px"></td>
						<td>
							<input type="radio" name="autoStatus" value=true  ${autoStatusEnabled} />
							<label for="meinv">启用</label>
							<input type="radio" name="autoStatus" value=false  ${autoStatusDisabled} />
							<label for="dongman">禁用</label>
						</td>
					</tr>
					<tr>
						<td align="right">壁纸源：</td>
						<td width="20px"></td>
						<td>
							${imageSourceStr}
						</td>
					</tr>
					${categoryListTrStr}
					<tr>
						<td align="right">透明度：</td>
						<td width="20px"></td>
						<td>
							<input type="number" style="width:300px;" id="opacity" value=${config.opacity}  />（0~1）
						</td>
					</tr>
					<tr>
						<td align="right">当前壁纸：</td>
						<td width="20px"></td>
						<td>
							<input style="width:300px;" readonly id="currentBg" value='${config.currentBg}' />
						</td>
					</tr>
					<tr>
						<td colspan="3">
							<div style="display: flex;flex-direction: row;justify-content: center;margin-top: 20px;">
								<button onclick="getData()">保存</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</body>
		<script src="${jqueryPathSrc}" type="text/javascript"></script>
		<script>
			const imageSource = ${JSON.stringify(config.imageSource)};
			const vscode = acquireVsCodeApi();
			function handleSourceChange(select) {
				const selectedValue = select.value;
				const selectedSource = imageSource.find(source => source.sourceName === selectedValue);
				

				// 生成新的 radio HTML
				let categoryHtml = '';
					
				if (selectedSource && selectedSource.category && selectedSource.category.length > 0) {
					selectedSource.category.forEach((cat, index) => {
						// 第一个选项添加 checked 属性
						const checked = index === 0 ? 'checked' : '';
						categoryHtml += \`<input type="radio" name="category" value="\${cat.parameters}" \${checked} /><label>\${cat.name}</label>\`;
					});

					categoryHtml = \`<td align="right">壁纸类型：</td><td width="20px"></td><td id="categoryList_td">\${categoryHtml}</td>\`
				}
				
				// 更新 categoryList_td 的内容
				const categoryTr = document.getElementById('categoryList_tr');
				if (categoryTr) {
					categoryTr.innerHTML = categoryHtml;
				}
			}

			function getData() {
				var currentSource = {
                        "sourceName": "",
                        "baseUrl": "",
                        "imgUrlKey": "",
                        "category": "",
                        "parameters": ""
                    };
				
				// 获取选中的 source
				var selectedValue = $('#imageSource option:selected').val();

				var selectedSourceObj = imageSource.find(source => source.sourceName === selectedValue);
				if (selectedSourceObj){
					currentSource.sourceName = selectedSourceObj.sourceName
					currentSource.baseUrl = selectedSourceObj.baseUrl
					currentSource.imgUrlKey = selectedSourceObj.imgUrlKey
				}
				
				var selectedRadio = $('input[name=category]:checked');
				if (selectedRadio.length > 0) {
					currentSource.category = selectedRadio.next().text().trim()
					currentSource.parameters = selectedRadio.val()
				}

				var data = {
					opacity: parseFloat($('#opacity').val()),
					autoStatus: $('input[name=autoStatus]:checked').val() === "true" ? true : false,
					enabled: $('input[name=enabled]:checked').val() === "true" ? true : false,
					currentSource: currentSource
				}

				vscode.postMessage({
					command: 'save',
					text: JSON.stringify(data)
				});
			}
			
			function handleClick(radio) {
				const isEnabled = radio.value === "true";  // 改用布尔值判断
				const elements = [
					$('input[name=autoStatus]'),
					$('select[name=imageSource]'),
					$('input[name=category]'),
					$('#opacity')
				];
				
				elements.forEach(el => {
					if (el.is('input[type=number]')) {
						el.prop('readOnly', !isEnabled);
					} else {
						el.prop('disabled', !isEnabled);
					}
				});
			}
		</script>
		
		</html>`;
	}

}