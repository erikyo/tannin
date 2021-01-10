import Tannin from '../index.js';

describe('Tannin', () => {
	function createInstance(data, options) {
		data = data || {
			default: {
				'': {
					domain: 'default',
					lang: 'en',
					'Plural-Forms': 'nplurals=2; plural=(n != 1);',
				},
				test: ['Singular', 'Plural'],
				'foo\u0004test': ['Context Singular', 'Context Plural'],
				'foo|test': [
					'Custom-Delimited Context Singular',
					'Custom-Delimited Context Plural',
				],
				'test-empty': [''],
			},
		};

		return new Tannin(data, options);
	}

	let i18n;
	beforeEach(() => {
		i18n = createInstance();
	});

	describe('getPluralForm', () => {
		it('handles variations of plural forms config', () => {
			[
				'nplurals=2; plural=(n != 1);',
				'nplurals=2; plural=(n != 1)',
				'nplurals=2;plural=(n != 1)',
				'plural=(n != 1);',
				'plural=(n != 1)',
				(n) => (n === 1 ? 0 : 1),
			].forEach((pf) => {
				['plural_forms', 'plural-forms'].forEach((key) => {
					i18n = createInstance({
						default: {
							'': {
								[key]: pf,
							},
						},
					});

					expect(i18n.getPluralForm('default', 0)).to.equal(1);
					expect(i18n.getPluralForm('default', 1)).to.equal(0);
					expect(i18n.getPluralForm('default', 2)).to.equal(1);
				});
			});
		});
	});

	describe('dcnpgettext', () => {
		it('translates singular', () => {
			const result = i18n.dcnpgettext('default', undefined, 'test');

			expect(result).to.equal('Singular');
		});

		it('translates singular with explicit value', () => {
			const result = i18n.dcnpgettext('default', undefined, 'test', 'tests', 1);

			expect(result).to.equal('Singular');
		});

		it('translates plural', () => {
			const result = i18n.dcnpgettext('default', undefined, 'test', 'tests', 2);

			expect(result).to.equal('Plural');
		});

		it('translates with context', () => {
			const result = i18n.dcnpgettext('default', 'foo', 'test');

			expect(result).to.equal('Context Singular');
		});

		it('translates with context and custom context delimiter', () => {
			i18n = createInstance(undefined, { contextDelimiter: '|' });
			const result = i18n.dcnpgettext('default', 'foo', 'test');

			expect(result).to.equal('Custom-Delimited Context Singular');
		});

		it('returns singular key if not contained in locale data', () => {
			let calledWith;
			const onMissingKey = (...args) => (calledWith = args);
			i18n = createInstance(undefined, { onMissingKey });
			const result = i18n.dcnpgettext('default', undefined, 'untranslated');

			expect(result).to.equal('untranslated');
			expect(calledWith).to.deep.equal(['untranslated', 'default']);
		});

		it('returns singular key if empty result', () => {
			const result = i18n.dcnpgettext('default', undefined, 'test-empty');

			expect(result).to.equal('test-empty');
		});
	});
});
