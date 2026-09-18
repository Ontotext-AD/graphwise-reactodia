import enTranslation from './en.reactodia.translation.json';
import frTranslation from './fr.reactodia.translation.json';
import {LanguageKey} from './language-key';

export type TranslationBundle = Record<string, Record<string, string | null> | string>;


// English is provided by default from reactodia, so the English bundle holds only our own keys and overrides. If
// A key is missing, reactodia defaults to its own translation.
export const TRANSLATIONS: Partial<Record<string, TranslationBundle>> = {
  [LanguageKey.EN]: enTranslation,
  [LanguageKey.FR]: frTranslation
}
