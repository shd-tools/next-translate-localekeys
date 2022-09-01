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