/**
 * InitConfig
 */
interface ImageSourceCategory {
    name: string;
    parameters: string;
}

export interface ImageSource {
    sourceName: string;
    sourceType: string;
    baseUrl: string;
    imgUrlKey: string;
    category: ImageSourceCategory[];
}

interface CurrentSource {
    sourceName: string;
    baseUrl: string;
    imgUrlKey: string;
    category: string;
    parameters: string;
}

interface Config {
    sourceVersion: string;
    sourceUrl: string;
    imageSource: ImageSource[];
    currentSource: CurrentSource;
    autoStatus: boolean;
    enabled: boolean;
    configured: boolean;
    opacity: number;
    currentBg: string;
    checkSourceVersion: boolean;
}

export function getInitConfig(): Readonly<Config> {
    return {
        sourceVersion: "v2.0.5",
        sourceUrl: "https://gitee.com/Space_h/vs-code/raw/master/imageSource.json",
        imageSource: [
            {
                sourceName: "夏柔",
                sourceType: "server",
                baseUrl: "https://www.onexiaolaji.cn/RandomPicture/api/?key=qq249663924&type=json",
                imgUrlKey: "url",
                category: [
                    {
                        name: "写真",
                        parameters: "&class=1"
                    },
                    {
                        name: "优质源",
                        parameters: "&class=4"
                    },
                    {
                        name: "动漫/二次元",
                        parameters: "&class=6"
                    },
                    {
                        name: "bing",
                        parameters: "&class=bing"
                    }
                ]
            },
            {
                sourceName: "墨天逸",
                sourceType: "server",
                baseUrl: "https://api.mtyqx.cn/api/random.php?return=json",
                imgUrlKey: "imgurl",
                category: [
                ]
            },
            {
                sourceName: "樱花二次元",
                sourceType: "server",
                baseUrl: "https://www.dmoe.cc/random.php?return=json",
                imgUrlKey: "imgurl",
                category: [
                ]
            },
            {
                sourceName: "盒子萌",
                sourceType: "server",
                baseUrl: "https://api.boxmoe.com/random.php?return=json",
                imgUrlKey: "imgurl",
                category: [
                ]
            },
            {
                sourceName: "imgapi",
                sourceType: "server",
                baseUrl: "https://imgapi.cn/api.php?zd=pc&gs=json",
                imgUrlKey: "imgurl",
                category: [
                    {
                        name: "妹纸",
                        parameters: "&fl=meizi"
                    }, {
                        name: "动漫",
                        parameters: "&fl=dongman"
                    }, {
                        name: "风景",
                        parameters: "&fl=fengjing"
                    }, {
                        name: "随机",
                        parameters: "&fl=suiji"
                    }
                ]
            },
            {
                sourceName: "如诗",
                sourceType: "server",
                baseUrl: "https://api.likepoems.com/img/",
                imgUrlKey: "url",
                category: [
                    {
                        name: "二次元",
                        parameters: "pc/?json"
                    }, {
                        name: "mc酱",
                        parameters: "mc/?json"
                    }, {
                        name: "pixiv",
                        parameters: "pixiv/?json"
                    }, {
                        name: "自然风景人物",
                        parameters: "nature/?json"
                    }, {
                        name: "bing",
                        parameters: "bing/?json"
                    }
                ]
            },
            {
                sourceName: "Chuanrui二次元",
                sourceType: "server",
                baseUrl: "https://api.1314.cool/img/sort/api/api.php?return=json",
                imgUrlKey: "imgurl",
                category: [
                ]
            },
            {
                sourceName: "搏天",
                sourceType: "server",
                baseUrl: "https://api.btstu.cn/sjbz/api.php?format=json",
                imgUrlKey: "imgurl",
                category: [
                    {
                        name: "妹纸",
                        parameters: "&lx=meizi"
                    }, {
                        name: "动漫",
                        parameters: "&lx=dongman"
                    }, {
                        name: "风景",
                        parameters: "&lx=fengjing"
                    }, {
                        name: "随机",
                        parameters: "&lx=suiji"
                    }
                ]
            }
        ],
        currentSource: {
            sourceName: "夏柔",
            baseUrl: "https://www.onexiaolaji.cn/RandomPicture/api/?key=qq249663924&type=json",
            imgUrlKey: "url",
            category: "动漫/二次元",
            parameters: "&class=6"
        },
        autoStatus: true,
        enabled: true,
        configured: true,
        opacity: 0.7,
        currentBg: "",
        checkSourceVersion: true
    }
}

