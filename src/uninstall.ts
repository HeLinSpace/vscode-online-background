import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as JSON5 from 'json5';

const uninstallHelper = {
    cssName: 'workbench.desktop.main.css',
    filePath: '',
    extName: 'backgroundOnline',
    //清理内容
    uninstall() {
        const base = process.cwd();
        
        // 文件路径
        this.filePath = path.join(base, 'resources', 'app', 'out', 'vs', 'workbench', this.cssName);
        // 清理 CSS
        let content = this.getContent();
        content = this.clearCssContent(content);
        this.saveContent(content);
        // 清理配置
        this.clearConfiguration();

        return true;
    },


    /**
     * 获取文件内容
     * @var mixed
     */
    getContent(): string {
        return fs.readFileSync(this.filePath, 'utf-8');
    },
    /**
    * 清理已经添加的代码
    * 
    * @private
    * @param {string} content 
    * @returns {string} 
    */
    clearCssContent(content: string): string {
        var re = new RegExp("\\/\\*ext-" + this.extName + "-start\\*\\/[\\s\\S]*?\\/\\*ext-" + this.extName + "-end\\*" + "\\/", "g");
        content = content.replace(re, '');
        content = content.replace(/\s*$/, '');
        return content;
    },

    /**
    * 设置文件内容
    * 
    * @private
    * @param {string} content 
    */
    saveContent(content: string): void {
        fs.writeFileSync(this.filePath, content, 'utf-8');
    },

    /**
     * 清理插件配置
     */
    clearConfiguration(): void {
        try {
            // 获取 VSCode 配置文件路径
            const userDataPath = process.env.APPDATA ||
                (process.platform === 'darwin' ?
                    path.join(os.homedir(), 'Library/Application Support') :
                    path.join(os.homedir(), '.config'));

            const settingsPath = path.join(userDataPath, 'Code', 'User', 'settings.json');

            // 读取配置文件
            if (fs.existsSync(settingsPath)) {
                let settings = JSON5.parse(fs.readFileSync(settingsPath, 'utf8'));

                // 删除所有以插件名开头的配置项
                const keysToDelete = Object.keys(settings).filter(key =>
                    key.startsWith(`${this.extName}.`) && key != `${this.extName}.history`
                );

                keysToDelete.forEach(key => {
                    delete settings[key];
                });

                // 写回文件
                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
            }
        } catch (error) {
            debugger
        }
    }
}

uninstallHelper.uninstall();