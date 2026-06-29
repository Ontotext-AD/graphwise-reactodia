import frTranslation from './fr.reactodia.translation.json';
import {LanguageKey} from './language-key';

type TranslationBundle = {
  [language: string]: Record<string, TranslationBundle | string | null>;
};

// English is provided by default from reactodia so we don't need to include it here, unless we override it
export const TRANSLATIONS: Partial<Record<LanguageKey, TranslationBundle>> = {
  [LanguageKey.FR]: frTranslation
}
