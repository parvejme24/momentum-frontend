"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

export function PasswordInput({ className = "input", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <input
        {...props}
        className={className}
        type={visible ? "text" : "password"}
        spellCheck={false}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((open) => !open)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        disabled={props.disabled}
      >
        {visible ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
      </button>
    </div>
  );
}
