import Generator from '../base/generator';

import type { Maybe } from '../base/util';
import type { ARGS } from '../base/controller';
import type { Entry, NestedDoc, PendingJob } from '../base/filesystem';

/**
 * @summary
 */
type Child = {
  readonly name: string;
  readonly ancestorChain: string;
  readonly children: Maybe<Children>;
  readonly translation: Maybe<string>;
};

/**
 * @summary
 */
type Children = ReadonlyArray<Child>;

/**
 * @summary data type which is used for the originals in this case "namespaces"
 */
type Original = {
  readonly name: string;
  readonly children: Children;
};

/**
 * @summary class which provides the functionality for the generation
 */
class LocaleKeysGenerator extends Generator {
  /**
   * @summary name of the class
   */
  public readonly name: string = 'LocaleKeysGenerator';

  /**
   * @summary the translation file format
   */
  private readonly transFileExt: string = '.json';

  /**
   * @summary contains all the translation namespaces
   */
  private readonly originals: Array<Original> = [];

  /**
   * @summary constructor
   * @param args
   * @returns LocaleKeysGenerator
   */
  constructor(args: ARGS) {
    super('locale_keys', args);
  }

  /**
   * @summary api is public accessible to start the generate process
   * @summary logs errors if errors occur during the process
   * @returns PendingJob
   */
  public async generate(): PendingJob {
    try {
      await this.processLocaleDirectory(this.fs.join(this.args.rootDir, this.args.lang));
      await this.writeToGeneratedFile(this.getLocaleKeysContent());
    } catch (error) {
      await this.logError(error);
    }
  }

  /**
   * @summary generates the template which will be written to the .g.ts file
   * @returns string
   */
  private getLocaleKeysContent(): string {
    return this.getHeader() + this.getLocaleKeysObject() + this.getFooter();
  }

  /**
   * @summary returns the translation object
   * @returns string
   */
  private getLocaleKeysObject(): string {
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

  /**
   * @summary processes the directory
   * @param dir
   * @returns PendingJob
   */
  private processLocaleDirectory(dir: string): PendingJob {
    return this.fs.processDirectory(this.processLocaleEntry.bind(this), dir);
  }

  /**
   * @summary process the entry in the directory and checks whether it is a translation file or directory
   * @summary and handles it appropriately
   * @param entry
   * @returns PendingJob
   */
  private async processLocaleEntry(entry: Entry): PendingJob {
    if (entry.stats.isFile() && entry.name.endsWith(this.transFileExt)) {
      await this.processTranslationFile(entry.name.replace(this.transFileExt, ''), entry.fromPath);
    } else if (entry.stats.isDirectory()) {
      await this.processLocaleDirectory(entry.fromPath);
    }
  }

  /**
   * @summary reads the translation file and processes it's data
   * @param fileName
   * @param fromPath
   * @returns PendingJob
   */
  private async processTranslationFile(fileName: string, fromPath: string): PendingJob {
    const doc = await this.fs.readJSONFile(fromPath);

    this.originals.push({
      name: fileName,
      children: this.generateLocaleKeyChildren(doc, fileName + this.args.nsSeparator),
    });
  }

  /**
   * @summary generates the formatted string for a childless descendant
   * @param descendant
   * @returns string
   */
  private getLocaleKeyChildTemplate({ name, ancestorChain, translation }: Child): string {
    const params = {
      key: this.getValidLocaleKeyName(name),
      value: ancestorChain + name,
      translation: translation ?? '',
    };

    return this.args.translations
      ? this.getTemplate('keyStringValueWithTranslation', params)
      : this.getTemplate('keyStringValue', params);
  }

  /**
   * @summary generates the formatted string for a not childless descendant
   * @param descendant
   * @returns string
   */
  private getLocaleKeyParentTemplate({ name, ancestorChain, children }: Child): string {
    const params = {
      value: ancestorChain + name,
      key: this.getValidLocaleKeyName(name),
      descendants: this.getLocaleKeyChildrenTemplate(children!),
      translations: this.args.translations
        ? this.getLocaleKeyTranslationLayout(this.getLocaleKeyTranslations(children!))
        : '',
    };

    return this.args.translations
      ? this.getTemplate('translationObjectWithTranslations', params)
      : this.getTemplate('translationObject', params);
  }

  /**
   * @summary
   * @param children
   * @returns string
   */
  private getLocaleKeyChildrenTemplate(children: Children): string {
    let template = '';

    for (const child of children) {
      template += child.children
        ? this.getLocaleKeyParentTemplate(child)
        : this.getLocaleKeyChildTemplate(child);
    }

    return template;
  }

  /**
   * @summary wraps the translations to receive the right structure
   * @param translations
   * @returns string
   */
  private getLocaleKeyTranslationLayout(translations: string): string {
    return this.getTemplate('translationLayout', { translations });
  }

  /**
   * @summary
   * @param descendants
   * @returns string
   */
  private getLocaleKeyTranslations(children: Children): string {
    let translations = '';

    for (const { name, translation } of children) {
      translations += translation
        ? this.getTemplate('childTranslation', { name, translation })
        : this.getTemplate('parentTranslation', { name });
    }

    return translations;
  }

  /**
   * @summary used to format name that is later used in the .{} notation
   * @param name
   * @returns string
   */
  private getValidLocaleKeyName(name: string): string {
    return this.util.swapHyphenToUnderscore(name);
  }

  /**
   * @summary
   * @param doc
   * @param ancestorChain
   * @returns Children
   */
  private generateLocaleKeyChildren(doc: NestedDoc, ancestorChain: string): Children {
    const children: Array<Child> = [];

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

// ------------------------------------------------------------------------------------
// --- exports ------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
export default LocaleKeysGenerator;
