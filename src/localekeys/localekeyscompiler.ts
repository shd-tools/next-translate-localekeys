import FileSystem from '../base/filesystem';

import type { Maybe } from '../base/util';
import type { ARGS } from '../base/controller';
import type { Collection, Entry, PendingJob } from '../base/filesystem';

/**
 * @summary wrapper error
 */
class LocaleKeysCompilerError extends Error {
  public readonly name: string = 'LocaleKeysCompilerError';
}

/**
 * @summary responsible for converting localekeys to strings
 */
class LocaleKeysCompiler {
  /**
   * @summary holds the class name
   */
  public readonly name = 'LocaleKeysCompiler';

  /**
   * @summary holds the received command line args
   */
  private readonly args: ARGS;

  /**
   * @summary holds the supported extensions
   */
  private readonly supportedExtension: Collection;

  /**
   * @summary holds file system instance
   */
  private readonly fs: FileSystem;

  /**
   * @summary constructor
   * @param args
   */
  constructor(args: ARGS) {
    this.args = args;
    this.fs = new FileSystem();
    this.supportedExtension = this.args.typescript ? ['ts', 'tsx'] : ['js', 'jsx'];
  }

  /**
   * @summary public api to start the compilation process
   * @returns PendingJob
   */
  public async compile(): PendingJob {
    try {
      await this.processDirectory(this.args.rootDir);
    } catch (error) {
      throw new LocaleKeysCompilerError(
        error instanceof Error ? error.message : 'Unknown Error occurred'
      );
    }
  }

  /**
   * @summary processes the directory
   * @param dir
   * @returns PendingJob
   */
  private async processDirectory(dir: string): PendingJob {
    return this.fs.processDirectory(this.processEntry.bind(this), dir);
  }

  /**
   * @summary processes an entry in a directory
   * @param entry
   * @returns PendingJob
   */
  private async processEntry(entry: Entry): PendingJob {
    if (entry.stats.isFile() && this.isSupportedFile(entry.name)) {
      await this.processFile(entry.fromPath);
    } else if (entry.stats.isDirectory()) {
      await this.processDirectory(entry.fromPath);
    }
  }

  /**
   * @summary processes a supported file
   * @param fromPath
   * @returns PendingJob
   */
  private async processFile(fromPath: string): PendingJob {
    let data: Maybe<string> = await this.fs.readFile(fromPath);

    if (!(data = this.checkForLocaleKeyUsage(data))) {
      return;
    }

    await this.fs.writeFile(fromPath, this.translateLocaleKeysToStrings(data));
  }

  /**
   * @summary translates each locale key into a plain string
   * @param data
   * @returns string
   */
  private translateLocaleKeysToStrings(data: string): string {
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
        } else {
          keys[0] = '"' + keys[0];
          keys[keys.length - 1] += '"';
        }
      }

      return (
        keys.shift()?.replace(/_/, '') +
        (keys.length === 0
          ? ''
          : this.args.nsSeparator +
            keys
              .map((key) =>
                key.startsWith('_')
                  ? key.replace(/_/, '').replace(/_/g, '-')
                  : key.replace(/_/g, '-')
              )
              .join(this.args.keySeparator))
      );
    });
  }

  /**
   * @summary searches for a localekeys import, if found => removes it => otherwise returns null
   * @param data
   * @returns Maybe<string>
   */
  private checkForLocaleKeyUsage(data: string): Maybe<string> {
    const regex = /import\s*{\s*LocaleKeys\s*}\s*from.*?;?\n/;

    return data.match(regex) ? data.replace(regex, '') : null;
  }

  /**
   * @summary checks if the file is supported
   * @param file
   * @returns boolean
   */
  private isSupportedFile(file: string): boolean {
    return this.supportedExtension.some((format) => file.endsWith(format));
  }
}

// ------------------------------------------------------------------------------------
// --- exports ------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
export default LocaleKeysCompiler;
