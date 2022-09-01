#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const filesystem_1 = __importDefault(require("./filesystem"));
const localekeyscompiler_1 = __importDefault(require("../localekeys/localekeyscompiler"));
const localekeysgenerator_1 = __importDefault(require("../localekeys/localekeysgenerator"));
var Mode;
(function (Mode) {
    Mode["COMPILE"] = "compile";
    Mode["GENERATE"] = "generate";
})(Mode || (Mode = {}));
class Controller {
    mode;
    args;
    fs;
    constructor(argv) {
        this.fs = new filesystem_1.default();
        [this.mode, this.args] = this.getARGS(argv);
    }
    async exec() {
        const requiredARGS = {
            lang: this.args.lang,
            rootDir: this.fs.join(this.args.rootDir),
            outDir: this.fs.join(this.args.outDir ?? this.args.rootDir),
            errDir: this.fs.join(this.args.errDir ?? this.args.rootDir),
            typescript: this.args.typescript,
            nsSeparator: this.args.nsSeparator,
            keySeparator: this.args.keySeparator,
            translations: this.args.translations,
        };
        switch (this.mode) {
            case Mode.COMPILE:
                await new localekeyscompiler_1.default(requiredARGS).compile();
                break;
            default:
                await new localekeysgenerator_1.default(requiredARGS).generate();
                break;
        }
    }
    getARGS(argv) {
        const command = commander_1.program
            .name('Next-translate LocaleKeys')
            .description('helps working with translation keys from the next translate library')
            .version('-v, --version', 'current version')
            .helpOption('-h, --help', 'displays all the options and arguments')
            .addArgument(new commander_1.Argument('mode', 'current mode').choices(Object.values(Mode)).argRequired())
            .requiredOption('--rootDir <string>', 'location of the source code')
            .option('--outDir <string>', 'place of the generated output. Default: rootDir.')
            .option('--errDir <string>', 'location of error file. Default: rootDir.')
            .option('--lang <string>', 'language that should be used in translation comments', 'en')
            .option('--nsSeparator <string>', 'char to split namespace from key.', ':')
            .option('--keySeparator <string>', 'change the separator that is used for nested keys.', '.')
            .option('--typescript', 'enables typescript', false)
            .option('--translations', 'enables translation comments.', false)
            .parse(argv);
        return [command.args[0], command.opts()];
    }
}
new Controller(process.argv).exec();
