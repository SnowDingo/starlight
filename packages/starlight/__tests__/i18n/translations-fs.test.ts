import { describe, expect, test } from 'vitest';
import { createTranslationSystemFromFs } from '../../utils/translations-fs';
import { YAMLException } from 'js-yaml';

describe('createTranslationSystemFromFs', () => {
	test('creates a translation system that returns default strings', () => {
		const useTranslations = createTranslationSystemFromFs(
			{
				locales: { en: { label: 'English', dir: 'ltr' } },
				defaultLocale: { label: 'English', locale: 'en', dir: 'ltr' },
			},
			// Using non-existent `_src/` to ignore custom files in this test fixture.
			{ srcDir: new URL('./_src/', import.meta.url) }
		);
		const t = useTranslations('en');
		expect(t('page.editLink')).toMatchInlineSnapshot('"Edit page"');
	});

	test('creates a translation system that uses custom strings', () => {
		const useTranslations = createTranslationSystemFromFs(
			{
				locales: {
					en: { label: 'English', dir: 'ltr', lang: 'en' },
					fr: { label: 'Français', dir: 'ltr', lang: 'fr' },
				},
				defaultLocale: { label: 'English', locale: 'en', dir: 'ltr' },
			},
			// Using `src/` to load custom files in this test fixture.
			{ srcDir: new URL('./src/', import.meta.url) }
		);
		// From an i18n JSON file
		let t = useTranslations('en');
		expect(t('page.editLink')).toMatchInlineSnapshot('"Make this page different"');
		// From an i18n YAML file
		t = useTranslations('fr');
		expect(t('page.editLink')).toMatchInlineSnapshot('"Rendre cette page différente"');
	});

	test('supports root locale', () => {
		const useTranslations = createTranslationSystemFromFs(
			{
				locales: { root: { label: 'English', dir: 'ltr', lang: 'en' } },
				defaultLocale: { label: 'English', locale: 'root', lang: 'en', dir: 'ltr' },
			},
			// Using `src/` to load custom files in this test fixture.
			{ srcDir: new URL('./src/', import.meta.url) }
		);
		const t = useTranslations(undefined);
		expect(t('page.editLink')).toMatchInlineSnapshot('"Make this page different"');
	});

	test('returns translation for unknown language', () => {
		const useTranslations = createTranslationSystemFromFs(
			{
				locales: { root: { label: 'English', dir: 'ltr', lang: 'en' } },
				defaultLocale: { label: 'English', locale: undefined, dir: 'ltr' },
			},
			// Using `src/` to load custom files in this test fixture.
			{ srcDir: new URL('./src/', import.meta.url) }
		);
		const t = useTranslations('fr');
		expect(t('page.editLink')).toMatchInlineSnapshot('"Make this page different"');
	});

	test('handles empty i18n directory', () => {
		const useTranslations = createTranslationSystemFromFs(
			{ locales: {}, defaultLocale: { label: 'English', locale: 'en', dir: 'ltr' } },
			// Using `empty-src/` to emulate empty `src/content/i18n/` directory.
			{ srcDir: new URL('./empty-src/', import.meta.url) }
		);
		const t = useTranslations('en');
		expect(t('page.editLink')).toMatchInlineSnapshot('"Edit page"');
	});

	test('throws on malformed i18n JSON', () => {
		expect(() =>
			createTranslationSystemFromFs(
				{ locales: {}, defaultLocale: { label: 'English', locale: 'en', dir: 'ltr' } },
				// Using `malformed-json-src/` to trigger syntax error in bad JSON file.
				{ srcDir: new URL('./malformed-json-src/', import.meta.url) }
			)
		).toThrow(SyntaxError);
	});

	test('throws on malformed i18n YAML', () => {
		expect(() =>
			createTranslationSystemFromFs(
				{ locales: {}, defaultLocale: { label: 'English', locale: 'en', dir: 'ltr' } },
				// Using `malformed-yaml-src/` to trigger syntax error in bad YAML file.
				{ srcDir: new URL('./malformed-yaml-src/', import.meta.url) }
			)
		).toThrow(YAMLException);
	});

	test('creates a translation system that uses custom strings injected by plugins', () => {
		const useTranslations = createTranslationSystemFromFs(
			{
				locales: { en: { label: 'English', dir: 'ltr' } },
				defaultLocale: { label: 'English', locale: 'en', dir: 'ltr' },
			},
			// Using non-existent `_src/` to ignore custom files in this test fixture.
			{ srcDir: new URL('./_src/', import.meta.url) },
			{ en: { 'page.editLink': 'Make this page even more different' } }
		);
		const t = useTranslations('en');
		expect(t('page.editLink')).toMatchInlineSnapshot('"Make this page even more different"');
	});

	test('creates a translation system that prioritizes user translations over plugin translations', () => {
		const useTranslations = createTranslationSystemFromFs(
			{
				locales: { en: { label: 'English', dir: 'ltr' } },
				defaultLocale: { label: 'English', locale: 'en', dir: 'ltr' },
			},
			// Using `src/` to load custom files in this test fixture.
			{ srcDir: new URL('./src/', import.meta.url) },
			{ en: { 'page.editLink': 'Make this page even more different' } }
		);
		const t = useTranslations('en');
		expect(t('page.editLink')).toMatchInlineSnapshot('"Make this page different"');
	});
});
