export function GuideLanguageSwitch({
  value,
  onChange,
}: {
  value: 'vi' | 'en';
  onChange: (value: 'vi' | 'en') => void;
}) {
  return (
    <div className="guide-language-switch" role="group" aria-label="Guest guide language">
      <span>Guest language</span>
      <div>
        <button
          type="button"
          className={value === 'vi' ? 'guide-language-switch__option guide-language-switch__option--active' : 'guide-language-switch__option'}
          onClick={() => onChange('vi')}
          aria-pressed={value === 'vi'}
        >
          VI
        </button>
        <button
          type="button"
          className={value === 'en' ? 'guide-language-switch__option guide-language-switch__option--active' : 'guide-language-switch__option'}
          onClick={() => onChange('en')}
          aria-pressed={value === 'en'}
        >
          EN
        </button>
      </div>
    </div>
  );
}
