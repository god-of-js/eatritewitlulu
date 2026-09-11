export function SearchField({
  defaultValue,
  placeholder,
  hiddenFields,
}: {
  defaultValue?: string;
  placeholder: string;
  hiddenFields?: Record<string, string>;
}) {
  return (
    <form className="mb-6">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <label className="sr-only" htmlFor="account-search">
        Search
      </label>
      <input
        id="account-search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full max-w-md rounded-full border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-sage-deep"
      />
    </form>
  );
}
