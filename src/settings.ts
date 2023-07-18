import * as vscode from 'vscode';
import * as path from 'path';
import { PickList } from './PickLIst';

export class Settings {
	public static getPanel(context: vscode.ExtensionContext) {
		const webviewDir = context.extensionPath;

		// 创建和显示webview
		const panel = vscode.window.createWebviewPanel('setting', "setting", vscode.ViewColumn.One, {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.file(webviewDir)]
		});

		const jqueryPath = vscode.Uri.file(path.join(webviewDir, 'out/jquery-3.7.0.min.js'));
		const jqueryPathSrc = jqueryPath.with({ scheme: 'vscode-resource' });

		// 设置HTML内容
		panel.webview.html = Settings.getWebviewContent(jqueryPathSrc);

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(message => {
			console.log(message)
			switch (message.command) {
				case 'save':
					var configs = JSON.parse(message.text);
					PickList.saveSettings(configs);
					return;
			}
		}, undefined, context.subscriptions);
	}

	public static getWebviewContent(jqueryPathSrc: any) {

		let config = vscode.workspace.getConfiguration('backgroundOnline');

		var categoryMeinv = "";
		var categoryDongman = "";
		var categoryFengjing = "";
		var categoryBiying = "";
		if (config.category.includes('meinv')) {
			categoryMeinv = "checked"
		}

		if (config.category.includes('dongman')) {
			categoryDongman = "checked"
		}

		if (config.category.includes('fengjing')) {
			categoryFengjing = "checked"
		}

		if (config.category.includes('meinv')) {
			categoryBiying = "checked"
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
						<td align="right">壁纸类型：</td>
						<td width="20px"></td>
						<td>
							<input type="checkbox" name="category" value="meinv" ${categoryMeinv} />
							<label for="meinv">美女</label>
							<input type="checkbox" name="category" value="dongman" ${categoryDongman} />
							<label for="dongman">动漫</label>
							<input type="checkbox" name="category" value="fengjing" ${categoryFengjing} />
							<label for="fengjing">风景</label>
							<input type="checkbox" name="category" value="biying" ${categoryBiying} />
							<label for="biying">必应</label>
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
				var category = [];
				var selectedCheckboxes = $('input[name=category]:checked');

				// 遍历选中的 checkbox 元素，获取它们的值
				selectedCheckboxes.each(function () {
					category.push($(this).val());
				});

				var data = {
					opacity: parseFloat($('#opacity').val()),
					currentBg: $('#currentBg').val(),
					autoStatus: $('input[name=autoStatus]:checked').val() === "true" ? true : false,
					enabled: $('input[name=enabled]:checked').val() === "true" ? true : false,
					category
				}

				vscode.postMessage({
					command: 'save',
					text: JSON.stringify(data)
				})
			}
			
			function handleClick(radio) {
				if (radio.value === "1") {
					$('input[name=autoStatus]').attr("disabled", false)
					$("#meinv").attr("disabled", false)
					$("#dongman").attr("disabled", false)
					$("#fengjing").attr("disabled", false)
					$("#biying").attr("disabled", false)
					$("#opacity").attr("readOnly", false)
					$("#currentBg").attr("readOnly", false)
				} else {
					$('input[name=autoStatus]').attr("disabled", true)
					$("#meinv").attr("disabled", true)
					$("#dongman").attr("disabled", true)
					$("#fengjing").attr("disabled", true)
					$("#biying").attr("disabled", true)
					$("#opacity").attr("readOnly", true)
					$("#currentBg").attr("readOnly", true)
				}
			}
		</script>
		
		</html>`;
	}

}