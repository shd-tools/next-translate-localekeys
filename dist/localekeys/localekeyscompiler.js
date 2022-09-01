"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const filesystem_1 = __importDefault(require("../base/filesystem"));
class LocaleKeysCompilerError extends Error {
    name = 'LocaleKeysCompilerError';
}
class LocaleKeysCompiler {
    name = 'LocaleKeysCompiler';
    args;
    supportedExtension;
    fs;
    constructor(args) {
        this.args = args;
        this.fs = new filesystem_1.default();
        this.supportedExtension = this.args.typescript ? ['ts', 'tsx'] : ['js', 'jsx'];
    }
    async compile() {
        try {
            await this.processDirectory(this.args.rootDir);
        }
        catch (error) {
            throw new LocaleKeysCompilerError(error instanceof Error ? error.message : 'Unknown Error occurred');
        }
    }
    async processDirectory(dir) {
        return this.fs.processDirectory(this.processEntry.bind(this), dir);
    }
    async processEntry(entry) {
        if (entry.stats.isFile() && this.isSupportedFile(entry.name)) {
            await this.processFile(entry.fromPath);
        }
        else if (entry.stats.isDirectory()) {
            await this.processDirectory(entry.fromPath);
        }
    }
    async processFile(fromPath) {
        let data = await this.fs.readFile(fromPath);
        if (!(data = this.checkForLocaleKeyUsage(data))) {
            return;
        }
        await this.fs.writeFile(fromPath, this.translateLocaleKeysToStrings(data));
    }
    translateLocaleKeysToStrings(data) {
        return data.replace(/(\(|\{|\$\{|\s)LocaleKeys([A-z]|_|\.|\s)*./gm, (localeKey) => {
            const keys = localeKey.replace(/\s+/g, '').split('.');
            const start = keys.shift()?.[0]?.match(/^./)?.[0];
            const end = keys[keys.length - 1]?.match(/.$/)?.[0];
            if ((start === '$' || start === '{') && end === '}') {
                keys[keys.length - 1] = keys[keys.length - 1].slice(0, keys[keys.length - 1].length - 1);
            }
            if (start !== '$') {
                if (end !== '}') {
                    keys[0] = (start !== 'L' ? start : '') + '"' + keys[0];
                    keys[keys.length - 1] = keys[keys.length - 1].replace(/.$/, (c) => '"' + c);
                }
                else {
                    keys[0] = '"' + keys[0];
                    keys[keys.length - 1] += '"';
                }
            }
            return (keys.shift()?.replace(/_/, '') +
                (keys.length === 0
                    ? ''
                    : this.args.nsSeparator +
                        keys
                            .map((key) => key.startsWith('_')
                            ? key.replace(/_/, '').replace(/_/g, '-')
                            : key.replace(/_/g, '-'))
                            .join(this.args.keySeparator)));
        });
    }
    checkForLocaleKeyUsage(data) {
        const regex = /import\s*{\s*LocaleKeys\s*}\s*from.*?;?\n/;
        return data.match(regex) ? data.replace(regex, '') : null;
    }
    isSupportedFile(file) {
        return this.supportedExtension.some((format) => file.endsWith(format));
    }
}
exports.default = LocaleKeysCompiler;
