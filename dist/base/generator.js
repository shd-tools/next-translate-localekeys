"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("./util"));
const filesystem_1 = __importDefault(require("./filesystem"));
const generatortemplates_1 = __importDefault(require("./generatortemplates"));
class Generator {
    errFile = 'errors.log';
    fs;
    util;
    outFile;
    args;
    constructor(file, args) {
        this.args = args;
        this.util = new util_1.default();
        this.fs = new filesystem_1.default();
        this.outFile = this.getGeneratedFileName(file);
    }
    getHeader(addendum = '') {
        return this.getTemplate('header', {
            addendum,
            generatorName: this.name,
            objectName: this.getGeneratorObjectName(),
        });
    }
    getFooter(addendum = '') {
        return this.getTemplate('footer', { addendum });
    }
    getTemplate(templateKey, variables) {
        return generatortemplates_1.default[templateKey]
            .trimEnd()
            .replace(/{{.*?}}/gm, (variable) => variables ? variables[variable.replace(/{|}|\s/g, '')] ?? '' : '');
    }
    getGeneratedFileName(file) {
        return `${file}.g.${this.args.typescript ? 'ts' : 'js'}`;
    }
    async writeToGeneratedFile(data) {
        await this.fs.writeFile(this.fs.join(this.args.outDir, this.outFile), data);
    }
    async logError(error) {
        await this.fs.appendFile(this.fs.join(this.args.errDir, this.errFile), this.getErrorMessage(error));
    }
    getGeneratorObjectName() {
        return this.outFile
            .replace(new RegExp(`.g.${this.args.typescript ? 'ts' : 'js'}$`), '')
            .toLowerCase()
            .replace(/(^\w)|([-_][a-z])/g, (group) => group.toUpperCase().replace(/_|-/, ''));
    }
    getErrorMessage(error) {
        if (this.util.isString(error)) {
            return `Error: ${error}, from ${this.name}\n`;
        }
        else if (error instanceof Error) {
            return `${error.name}: ${error.message}, from ${this.name}\n`;
        }
        else {
            return `Unknown Error occurred, from ${this.name}\n`;
        }
    }
}
exports.default = Generator;
