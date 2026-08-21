"use client";

import Select, { type SingleValue, type StylesConfig } from "react-select";
import { countries } from "@/lib/countries";

type CountryOption = { value: string; label: string };

const options: CountryOption[] = countries.map((c) => ({
  value: c.code,
  label: c.name,
}));

const selectStyles: StylesConfig<CountryOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 47,
    borderRadius: 20,
    borderColor: state.isFocused ? "#8a005c" : "#ced4da",
    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(138, 0, 92, 0.15)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#8a005c" : "#adb5bd" },
    fontFamily: "cbook, sans-serif",
    fontSize: "1rem",
    paddingLeft: 4,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0.35rem 0.75rem",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontFamily: "cbook, sans-serif",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#6c757d",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 30,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  }),
  option: (base, state) => ({
    ...base,
    fontFamily: "cbook, sans-serif",
    backgroundColor: state.isSelected
      ? "#8a005c"
      : state.isFocused
        ? "#f7f0f5"
        : "#fff",
    color: state.isSelected ? "#fff" : "#212529",
    cursor: "pointer",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#6c757d",
    paddingRight: 12,
  }),
};

type Props = {
  id?: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
};

export function CountrySearchSelect({
  id = "pays",
  value,
  onChange,
  placeholder,
}: Props) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Select<CountryOption, false>
      inputId={id}
      instanceId={id}
      options={options}
      value={selected}
      onChange={(opt: SingleValue<CountryOption>) => {
        if (opt) onChange(opt.value);
      }}
      styles={selectStyles}
      placeholder={placeholder || "…"}
      isSearchable
      isClearable={false}
      filterOption={(option, raw) => {
        const q = raw.trim().toLowerCase();
        if (!q) return true;
        return (
          option.label.toLowerCase().includes(q) ||
          option.value.toLowerCase().includes(q)
        );
      }}
      noOptionsMessage={() => "—"}
      classNamePrefix="country-select"
    />
  );
}
