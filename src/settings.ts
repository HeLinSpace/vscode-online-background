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

		const categoryList = config.categoryList

		let categoryListStr = "";
		categoryList.forEach((element: any) => {
			var checked = "";
			if (config.category.name === element.name) {
				checked = "checked"
			}
			categoryListStr += `<input type="radio" name="category" value="${element.parameters}" ${checked} /><label>${element.name}</label>`;
		});

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
						<td align="right">壁纸类型：</td>
						<td width="20px"></td>
						<td>
							${categoryListStr}
						</td>
					</tr>
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
							<input style="width:300px;" id="currentBg" value='${config.currentBg}' />
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
			const vscode = acquireVsCodeApi();
			function getData() {
				var category = {};

				var selectedRadio = $('input[name=category]:checked');
				if (selectedRadio.length > 0) {
					category = {
						name: selectedRadio.parent().text().trim(), // 获取父元素的文本内容
						parameters: selectedRadio.val()
					};
				}

				var data = {
					opacity: parseFloat($('#opacity').val()),
					currentBg: $('#currentBg').val(),
					autoStatus: $('input[name=autoStatus]:checked').val() === "true" ? true : false,
					enabled: $('input[name=enabled]:checked').val() === "true" ? true : false,
					category: category
				}

				vscode.postMessage({
					command: 'save',
					text: JSON.stringify(data)
				});
			}
			
			function handleClick(radio) {
				if (radio.value === "1") {
					$('input[name=autoStatus]').attr("disabled", false)
					$('input[name=category]').attr("disabled", false)
					$("#opacity").attr("readOnly", false)
					$("#currentBg").attr("readOnly", false)
				} else {
					$('input[name=autoStatus]').attr("disabled", true)
					$('input[name=category]').attr("disabled", true)
					$("#opacity").attr("readOnly", true)
					$("#currentBg").attr("readOnly", true)
				}
			}
		</script>
		
		</html>`;
	}

}