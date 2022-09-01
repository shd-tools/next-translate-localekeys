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