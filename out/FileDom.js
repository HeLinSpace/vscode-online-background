"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDom = void 0;
const path = require("path");
const fs = require("fs");
const version_1 = require("./version");
const os = require("os");
const vscode_1 = require("vscode");
const child_process_1 = require("child_process");
const vsHelp_1 = require("./vsHelp");
const cssName = version_1.default >= "1.38" ? 'workbench.desktop.main.css' : 'workbench.main.css';
class FileDom {
    ; //path.join(path.dirname((require.main as NodeModule).filename), 'vs', 'workbench', cssName);
    constructor(imagePath, opacity, sizeModel = 'cover') {
        // 文件路径
        this.filePath = path.join(vscode_1.env.appRoot, "out", "vs", "workbench", cssName);
        this.extName = "backgroundCover";
        this.imagePath = '';
        this.imageOpacity = 1;
        this.sizeModel = 'cover';
        this.imagePath = imagePath;
        this.imageOpacity = opacity;
        if (sizeModel == "") {
            sizeModel = "cover";
        }
        this.sizeModel = sizeModel;
        if (imagePath.substr(0, 8).toLowerCase() !== 'https://') {
            // mac对vscodefile协议支持存在异常，所以mac下使用base64
            var osType = os.type();
            if (osType == 'Darwin') {
                this.imageToBase64();
            }
            else {
                this.localImgToVsc(osType);
            }
        }
    }
    install() {
        let content = this.getCss().replace(/\s*$/, ''); // 去除末尾空白
        if (content === '') {
            return false;
        }
        // 添加代码到文件中，并尝试删除原来已经添加的
        let newContent = this.getContent();
        newContent = this.clearCssContent(newContent);
        newContent += content;
        try {
            this.saveContent(newContent);
        }
        catch (ex) {
            vsHelp_1.default.showInfo('更新背景图片异常，请确保以管理员身份运行或对该文件赋予写入权限！ / Unexpected update of background image, please make sure to run as administrator or grant write permission to the file!                        \n ' + ex.message);
            return false;
        }
        return true;
    }
    getCss() {
        // 重新计算透明度
        let opacity = this.imageOpacity;
        opacity = opacity <= 0.1 ? 0.1 : opacity >= 1 ? 1 : opacity;
        opacity = 0.59 + (0.4 - ((opacity * 4) / 10));
        // 图片填充方式
        let sizeModelVal = this.sizeModel;
        let repeatVal = "no-repeat";
        let positionVal = "center";
        switch (this.sizeModel) {
            case "cover":
                sizeModelVal = "cover";
                break;
            case "contain":
                sizeModelVal = "100% 100%";
                break;
            case "repeat":
                sizeModelVal = "auto";
                repeatVal = "repeat";
                break;
            case "not_center":
                sizeModelVal = "auto";
                break;
            case "not_right_bottom":
                sizeModelVal = "auto";
                positionVal = "right 96%";
                break;
            case "not_right_top":
                sizeModelVal = "auto";
                positionVal = "right 30px";
                break;
            case "not_left":
                sizeModelVal = "auto";
                positionVal = "left";
                break;
            case "not_right":
                sizeModelVal = "auto";
                positionVal = "right";
                break;
            case "not_top":
                sizeModelVal = "auto";
                positionVal = "top";
                break;
            case "not_bottom":
                sizeModelVal = "auto";
                positionVal = "bottom";
                break;
        }
        return `
		/*ext-${this.extName}-start*/
		/*ext.${this.extName}.ver.${version_1.default}*/
		body{
			background-size: ${sizeModelVal};
			background-repeat: ${repeatVal};
			background-position: ${positionVal};
			opacity:${opacity};
			background-image:url('${this.imagePath}');
		}
		/*ext-${this.extName}-end*/
		`;
    }
    /**
    * 获取文件内容
    * @var mixed
    */
    getContent() {
        return fs.readFileSync(this.filePath, 'utf-8');
    }
    /**
    * 本地图片文件转base64
    * @var mixed
    */
    imageToBase64() {
        try {
            let extname = path.extname(this.imagePath);
            extname = extname.substr(1);
            this.imagePath = fs.readFileSync(path.resolve(this.imagePath)).toString('base64');
            this.imagePath = `data:image/${extname};base64,${this.imagePath}`;
        }
        catch (e) {
            return false;
        }
        return true;
    }
    localImgToVsc(ostype) {
        var separator = ostype == "Linux" ? "" : "/";
        var url = "vscode-file://vscode-app" + separator + this.imagePath;
        this.imagePath = vscode_1.Uri.parse(url).toString();
    }
    /**
    * 设置文件内容
    *
    * @private
    * @param {string} content
    */
    saveContent(content) {
        fs.writeFileSync(this.filePath, content, 'utf-8');
    }
    /**
    * 清理已经添加的代码
    *
    * @private
    * @param {string} content
    * @returns {string}
    */
    clearCssContent(content) {
        let re = new RegExp("\\/\\*ext-" + this.extName + "-start\\*\\/[\\s\\S]*?\\/\\*ext-" + this.extName + "-end\\*" + "\\/", "g");
        content = content.replace(re, '');
        content = content.replace(/\s*$/, '');
        return content;
    }
    /**
    * 卸载
    *
    * @private
    */
    uninstall() {
        try {
            let content = this.getContent();
            content = this.clearCssContent(content);
            this.saveContent(content);
            return true;
        }
        catch (ex) {
            return false;
        }
    }
    /**
     * 在 MacOS 上写入样式，需要注意权限问题
     */
    installMac() {
        let content = this.getCss().replace(/\s*$/, '');
        if (content === '') {
            return false;
        }
        let newContent = this.getContent();
        newContent = this.clearCssContent(newContent);
        newContent += content;
        fs.writeFile(this.filePath, newContent, { encoding: 'utf-8' }, (error) => {
            if (error) {
                // 对文件没有读写权限则提示输入管理员密码以继续写入样式
                let option = {
                    ignoreFocusOut: true,
                    password: false,
                    placeHolder: 'Please enter the root password for access / 请输入 ROOT 密码用于获取权限',
                    prompt: '请输入管理员密码',
                };
                vscode_1.window.showInputBox(option).then((value) => {
                    if (!value) {
                        vscode_1.window.showWarningMessage('Please enter password / 请输入密码！');
                        return;
                    }
                    // 回调中无法返回标识，所以授权后异步写入样式并自动重启程序
                    this.saveContentMac(value, newContent);
                });
            }
        });
        return true;
    }
    /**
     * 执行授权命令并写入样式
     *
     * @param password 管理员秘密
     * @param content 待写入的样式
     */
    saveContentMac(password, content) {
        // SUDO+密码对css文件进行’读与写‘授权
        (0, child_process_1.exec)(`echo "${password}" | sudo -S chmod a+rwx "${this.filePath}"`, (error) => {
            if (error) {
                vscode_1.window.showWarningMessage(`${error.name}: 密码可能输入有误，请重新尝试！`);
            }
            // 写入样式并自动重启程序
            fs.writeFileSync(this.filePath, content, 'utf-8');
            vscode_1.commands.executeCommand('workbench.action.reloadWindow');
        });
    }
}
exports.FileDom = FileDom;
//# sourceMappingURL=FileDom.js.map