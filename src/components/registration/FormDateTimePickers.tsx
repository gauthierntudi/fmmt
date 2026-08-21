"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { enUS } from "date-fns/locale/en-US";
import "react-day-picker/style.css";

function parseYmd(value: string): Date | undefined {
  if (!value) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return undefined;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toYmd(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

type DateProps = {
  id: string;
  value: string;
  onChange: (ymd: string) => void;
  minDate?: string;
  locale?: string;
  placeholder?: string;
};

export function FormDatePicker({
  id,
  value,
  onChange,
  minDate,
  locale = "fr",
  placeholder = "jj-mm-aaaa",
}: DateProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = parseYmd(value);
  const min = parseYmd(minDate || "");
  const dfLocale = locale === "en" ? enUS : fr;
  const display = selected ? format(selected, "dd-MM-yyyy") : "";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="fmmt-picker" ref={rootRef}>
      <input
        id={id}
        type="text"
        readOnly
        className="form-control borderradius"
        value={display}
        placeholder={placeholder}
        onClick={() => setOpen(true)}
        autoComplete="off"
      />
      {open && (
        <div className="fmmt-picker-popover" role="dialog" aria-label={placeholder}>
          <DayPicker
            mode="single"
            locale={dfLocale}
            selected={selected}
            disabled={min ? { before: min } : undefined}
            defaultMonth={selected || min || new Date()}
            onSelect={(date) => {
              if (!date) return;
              onChange(toYmd(date));
              setOpen(false);
            }}
            weekStartsOn={1}
          />
        </div>
      )}
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

type TimeProps = {
  id: string;
  value: string;
  onChange: (hm: string) => void;
  locale?: string;
  placeholder?: string;
};

export function FormTimePicker({ id, value, onChange }: TimeProps) {
  const hourId = useId();
  const minuteId = useId();
  const [rawH = "", rawM = ""] = value.includes(":") ? value.split(":") : ["", ""];
  const hour = HOURS.includes(rawH) ? rawH : "";
  const minute = MINUTES.includes(rawM) ? rawM : "";

  function emit(h: string, m: string) {
    if (!h && !m) {
      onChange("");
      return;
    }
    onChange(`${h || "00"}:${m || "00"}`);
  }

  return (
    <div className="fmmt-time-selects" id={id}>
      <select
        id={hourId}
        className="form-select borderradius"
        aria-label="Heure"
        value={hour}
        onChange={(e) => emit(e.target.value, minute || "00")}
      >
        <option value="">HH</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="fmmt-time-sep" aria-hidden>
        :
      </span>
      <select
        id={minuteId}
        className="form-select borderradius"
        aria-label="Minutes"
        value={minute}
        onChange={(e) => emit(hour || "00", e.target.value)}
      >
        <option value="">MM</option>
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
