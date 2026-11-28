import { useEffect, useRef, useState } from "react";
import "./Select.css";

// options can be plain strings or { value, label, icon }
const norm = (o) => (typeof o === "string" ? { value: o, label: o } : o);

// one hook for "close when the person clicks somewhere else"
function useOutside(ref, close) {
  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) close();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [ref, close]);
}

// opens upwards when there is no room below
function useFlip(open, ref) {
  const [up, setUp] = useState(false);
  useEffect(() => {
    if (!open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setUp(window.innerHeight - r.bottom < 280 && r.top > 280);
  }, [open, ref]);
  return up;
}

export function Select({ value, onChange, options, id, className = "", placeholder = "Choose..." }) {
  const list = options.map(norm);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef(null);
  const close = () => setOpen(false);
  useOutside(box, close);
  const up = useFlip(open, box);

  const current = list.find((o) => o.value === value);

  function openMenu() {
    setActive(Math.max(0, list.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function pick(o) {
    onChange(o.value);
    setOpen(false);
  }

  function onKey(e) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(list.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (list[active]) pick(list[active]); }
    else if (e.key === "Tab") setOpen(false);
  }

  return (
    <div className={"dd " + className + (open ? " open" : "")} ref={box}>
      <button
        type="button"
        id={id}
        className="dd-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKey}
      >
        {current && current.icon && <span className="dd-icon">{current.icon}</span>}
        <span className={current ? "dd-value" : "dd-value dd-placeholder"}>{current ? current.label : placeholder}</span>
        <svg className="dd-caret" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
      </button>

      {open && (
        <ul className={"dd-list" + (up ? " up" : "")} role="listbox">
          {list.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={(o.value === value ? "sel " : "") + (i === active ? "act" : "")}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(o)}
            >
              {o.icon && <span className="dd-icon">{o.icon}</span>}
              <span>{o.label}</span>
              {o.value === value && <svg className="dd-tick" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" /></svg>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// a text box with a themed list of suggestions; the person can still type something new
export function ComboInput({ value, onChange, options, name, placeholder }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const close = () => setOpen(false);
  useOutside(box, close);
  const up = useFlip(open, box);

  const text = value.trim().toLowerCase();
  const shown = options.filter((o) => o.toLowerCase().includes(text) && o.toLowerCase() !== text);
  const isNew = value.trim() !== "" && !options.some((o) => o.toLowerCase() === text);

  return (
    <div className={"dd combo" + (open ? " open" : "")} ref={box}>
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onKeyDown={(e) => { if (e.key === "Escape" || e.key === "Enter") setOpen(false); }}
      />
      <svg className="dd-caret" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
      {open && (shown.length > 0 || isNew) && (
        <ul className={"dd-list" + (up ? " up" : "")} role="listbox">
          {shown.map((o) => (
            <li key={o} role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(o); setOpen(false); }}>
              <span>{o}</span>
            </li>
          ))}
          {isNew && (
            <li className="new" onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen(false)}>
              <span>Add "{value.trim()}" as new</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
