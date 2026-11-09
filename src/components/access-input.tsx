"use client";

import { useState } from "react";

/**
 * Campo de acesso: identificador simples ("enzorios138"). O sufixo interno
 * do e-mail de autenticação "@integrantes.radar" é montado apenas no
 * servidor — nunca aparece na interface.
 */
export function AccessInput({
  id,
  name,
  defaultValue = "",
  placeholder = "acesso123",
  invalid = false,
  className,
  onBlur,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  invalid?: boolean;
  className: string;
  onBlur?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <input
      id={id}
      name={name}
      type="text"
      autoComplete="username"
      autoCapitalize="none"
      spellCheck={false}
      placeholder={placeholder}
      aria-invalid={invalid}
      value={value}
      onChange={(e) => setValue(e.target.value.trim())}
      onBlur={(e) => onBlur?.(e.target.value.trim())}
      className={className}
    />
  );
}
