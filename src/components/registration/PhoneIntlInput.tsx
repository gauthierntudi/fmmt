"use client";

import { useEffect, useRef } from "react";
import intlTelInput, { type Iso2 } from "intl-tel-input/intlTelInputWithUtils";
import "intl-tel-input/styles";

type Props = {
  id?: string;
  countryCode: string;
  value: string;
  onChange: (e164: string) => void;
  onCountryChange?: (iso2Upper: string) => void;
  className?: string;
};

function toIso2(code: string): Iso2 {
  return code.toLowerCase() as Iso2;
}

export function PhoneIntlInput({
  id = "telephone",
  countryCode,
  value,
  onChange,
  onCountryChange,
  className = "form-control borderradius",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<ReturnType<typeof intlTelInput> | null>(null);
  const onChangeRef = useRef(onChange);
  const onCountryChangeRef = useRef(onCountryChange);
  const syncingRef = useRef(false);

  onChangeRef.current = onChange;
  onCountryChangeRef.current = onCountryChange;

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const iti = intlTelInput(input, {
      initialCountry: toIso2(countryCode || "cd"),
      countryOrder: ["cd", "fr", "be", "ca", "us"],
      separateDialCode: true,
      countrySearch: true,
      strictMode: false,
      formatAsYouType: true,
    });
    itiRef.current = iti;

    const emitNumber = () => {
      const e164 = iti.getNumber() || input.value.trim();
      onChangeRef.current(e164);
    };

    const onCountry = () => {
      if (syncingRef.current) return;
      const data = iti.getSelectedCountry();
      if (data?.iso2) {
        onCountryChangeRef.current?.(data.iso2.toUpperCase());
      }
      emitNumber();
    };

    input.addEventListener("input", emitNumber);
    input.addEventListener("blur", emitNumber);
    input.addEventListener("countrychange", onCountry);

    return () => {
      input.removeEventListener("input", emitNumber);
      input.removeEventListener("blur", emitNumber);
      input.removeEventListener("countrychange", onCountry);
      iti.destroy();
      itiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const iti = itiRef.current;
    if (!iti || !countryCode) return;
    const current = iti.getSelectedCountry()?.iso2?.toUpperCase();
    if (current === countryCode.toUpperCase()) return;
    syncingRef.current = true;
    iti.setSelectedCountry(toIso2(countryCode));
    syncingRef.current = false;
  }, [countryCode]);

  useEffect(() => {
    const iti = itiRef.current;
    const input = inputRef.current;
    if (!iti || !input) return;
    const current = iti.getNumber() || "";
    if (value && value !== current && !input.matches(":focus")) {
      iti.setNumber(value);
    }
  }, [value]);

  return <input ref={inputRef} id={id} type="tel" className={className} />;
}
