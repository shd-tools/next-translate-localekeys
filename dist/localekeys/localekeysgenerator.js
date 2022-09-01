"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generator_1 = __importDefault(require("../base/generator"));
class LocaleKeysGenerator extends generator_1.default {
    name = 'LocaleKeysGenerator';
    transFileExt = '.json';
    originals = [];
    constructor(args) {
        super('locale_keys', args);
    }
    async generate() {
        try {
            await this.processLocaleDirectory(this.fs.join(this.args.rootDir, this.args.lang));
            await this.writeToGeneratedFile(this.getLocaleKeysContent());
        }
        catch (error) {
            await this.logError(error);
        }
    }
    getLocaleKeysContent() {
        return this.getHeader() + this.getLocaleKeysObject() + this.getFooter();
    }
    getLocaleKeysObject() {
        let content = '={';
        for (const { name, children } of this.originals) {
            content += this.getLocaleKeyParentTemplate({
                name,
                children,
                translation: '',
                ancestorChain: '',
            });
        }
        return content + `}${this.args.typescript ? 'as const' : ''};`;
    }
    processLocaleDirectory(dir) {
        return this.fs.processDirectory(this.processLocaleEntry.bind(this), dir);
    }
    async processLocaleEntry(entry) {
        if (entry.stats.isFile() && entry.name.endsWith(this.transFileExt)) {
            await this.processTranslationFile(entry.name.replace(this.transFileExt, ''), entry.fromPath);
        }
        else if (entry.stats.isDirectory()) {
            await this.processLocaleDirectory(entry.fromPath);
        }
    }
    async processTranslationFile(fileName, fromPath) {
        const doc = await this.fs.readJSONFile(fromPath);
        this.originals.push({
            name: fileName,
            children: this.generateLocaleKeyChildren(doc, fileName + this.args.nsSeparator),
        });
    }
    getLocaleKeyChildTemplate({ name, ancestorChain, translation }) {
        const params = {
            key: this.getValidLocaleKeyName(name),
            value: ancestorChain + name,
            translation: translation ?? '',
        };
        return this.args.translations
            ? this.getTemplate('keyStringValueWithTranslation', params)
            : this.getTemplate('keyStringValue', params);
    }
    getLocaleKeyParentTemplate({ name, ancestorChain, children }) {
        const params = {
            value: ancestorChain + name,
            key: this.getValidLocaleKeyName(name),
            descendants: this.getLocaleKeyChildrenTemplate(children),
            translations: this.args.translations
                ? this.getLocaleKeyTranslationLayout(this.getLocaleKeyTranslations(children))
                : '',
        };
        return this.args.translations
            ? this.getTemplate('translationObjectWithTranslations', params)
            : this.getTemplate('translationObject', params);
    }
    getLocaleKeyChildrenTemplate(children) {
        let template = '';
        for (const child of children) {
            template += child.children
                ? this.getLocaleKeyParentTemplate(child)
                : this.getLocaleKeyChildTemplate(child);
        }
        return template;
    }
    getLocaleKeyTranslationLayout(translations) {
        return this.getTemplate('translationLayout', { translations });
    }
    getLocaleKeyTranslations(children) {
        let translations = '';
        for (const { name, translation } of children) {
            translations += translation
                ? this.getTemplate('childTranslation', { name, translation })
                : this.getTemplate('parentTranslation', { name });
        }
        return translations;
    }
    getValidLocaleKeyName(name) {
        return this.util.swapHyphenToUnderscore(name);
    }
    generateLocaleKeyChildren(doc, ancestorChain) {
        const children = [];
        for (const key in doc) {
            const entry = doc[key];
            children.push({
                name: key,
                ancestorChain,
                translation: this.util.isString(entry) ? entry : null,
                children: this.util.isObject(entry)
                    ? this.generateLocaleKeyChildren(entry, ancestorChain + key + this.args.keySeparator)
                    : null,
            });
        }
        return children;
    }
}
exports.default = LocaleKeysGenerator;
