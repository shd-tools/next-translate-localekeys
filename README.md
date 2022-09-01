# Next-translate LocaleKeys
Intended for use in conjunction with [next-translate](https://github.com/vinissimus/next-translate).
Used for generating all possible keys for the useTranslation hook with type safety.

### How to install
`npm install --save-dev next-translate-localekeys`

### How to run
`npx next-translate-localekeys`


### Example one (Mode: "generate"):

#### Requirements
1. Translation Files are in /examples/locales/en
2. Goal to get all my locale keys in the generated (/examples/generated) folder with typescript support and translation comments
3. Using [default seperator](https://github.com/vinissimus/next-translate#3-configuration) for next-translate

#### Actions
1. run `npx next-translate-localeKeys generate --rootDir ./examples/locales --outDir ./examples/generated --typescript --translations`
2. Go to your file where you want to use the useTranslation hook
3. 
```tsx
import { FC } from 'react'; 
import useTranslation from 'next-translate/useTranslation';
import { LocaleKeys } from './examples/generated/locale_keys.g';

export const DivWithTitleFromCommonNamespace: FC = () => {
    const { t } = useTranslation(LocaleKeys.common);

    return <div>{t(LocaleKeys._common.title)}</div>;
}
```

### Example two (Mode: "compile"):

#### Requirements
1. All the source code of the project which is using the locale keys object is located in examples/compiled/after
2. typescript project
3. only in production

#### Actions
1. Optional: insert command into pipeline (github action)
2. run `npx next-translate-localekeys compile --rootDir ./examples/compiled/after --typescript`
3. see result:

before:
```tsx
import useTranslation from "next-translate/useTranslation";

import { LocaleKeys } from "../../generated/locale_keys.g";

export const Test = () => {
  const { t } = useTranslation(LocaleKeys.common);

  return (
    <div>
      <Test2 
        home={LocaleKeys._home + ''}
        localeKey2={LocaleKeys._dynamic.example_of_dynamic_translation       }
       />
      <div>{t(LocaleKeys._common.title)}</div>
      <div>{t(LocaleKeys._home.description )}</div>
      <div>{t(`${LocaleKeys._more_examples.   _nested_example.very_nested  }.nested`)}</div>
    </div>
  );
};

const Test2 = ({ home, localeKey2 }) => {
  const { t } = useTranslation(home);
  const localeKey = home + '.description';
    
  return <div>{t(localeKey)}{t(localeKey2)}</div>
};
```

after:
```tsx
import useTranslation from "next-translate/useTranslation";


export const Test = () => {
  const { t } = useTranslation("common");

  return (
    <div>
      <Test2 
        home={"home"+ ''} 
        localeKey2="dynamic:example-of-dynamic-translation"
       />
      <div>{t("common:title")}</div>
      <div>{t("home:description")}</div>
      <div>{t(`more_examples:nested-example.very-nested.nested`)}</div>
    </div>
  );
};

const Test2 = ({ home, localeKey2 }) => {
  const { t } = useTranslation(home);
  const localeKey = home + '.description';
    
  return <div>{t(localeKey)}{t(localeKey2)}</div>
};
```


### Configuration
To get all configurations possible:
`npx next-translate-localekeys --help`

| Flag | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | -------- |
| `mode` | current mode | `"compile"` or `"generate"` | - |  *
| `rootDir` | location of the source code. | `string` | - |  *
| `outDir` | place of the generated output. | `string` | `rootDir` |
| `errDir` | location of error file. | `string` | `rootDir` | 
| `typescript` | enables typescript. | `boolean` | `false` | 
| `translations` | enables translation comments. | `boolean` | `false` |
| `lang` | language that should be used in translation comments | `string` | `en` |
| `nsSeparator` | char to split namespace from key. | `string` | `":"` |
| `keySeparator` | change the separator that is used for nested keys. | `string` | `"."` |