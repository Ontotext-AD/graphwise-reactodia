import frTranslation from './fr.reactodia.translation.json';
import {LanguageKey} from './language-key';

export type TranslationBundle = Record<string, Record<string, string | null> | string>;


// English is provided by default from reactodia so we don't need to include it here, unless we override it
export const TRANSLATIONS: Partial<Record<string, TranslationBundle>> = {
  [LanguageKey.FR]: frTranslation
}
