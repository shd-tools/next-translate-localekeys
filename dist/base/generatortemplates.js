"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GeneratorTemplates = {
    translationLayout: `
/**
* Translations: {{ translations }}
*/
  `,
    parentTranslation: `
** {{ name }}: ...
  `,
    childTranslation: `
** {{ name }}: "{{ translation }}"
  `,
    translationObject: `{{ key }}:"{{ value }}",_{{ key }}:{ {{ descendants }} },
  `,
    translationObjectWithTranslations: `
{{ translations }}{{ key }}:"{{ value }}",{{ translations }}_{{ key }}:{ {{ descendants }} },
  `,
    keyStringValue: `{{ key }}:"{{ value }}",
  `,
    keyStringValueWithTranslation: `
  /**
 * @example "{{ translation }}"
 */{{ key }}:"{{ value }}",
  `,
    header: `// DO NOT EDIT. This code was generated from the {{ generatorName }}.
// Any changes will be lost when it will be generated again.
{{ addendum }}
export const {{ objectName }}
  `,
    footer: `{{ addendum }}
// DO NOT EDIT!
  `,
};
exports.default = GeneratorTemplates;
