"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { input } from "@/lib/ui";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        className={cn(input, "pr-[46px]", className)}
        type={visible ? "text" : "password"}
        spellCheck={false}
      />
      <button
        type="button"
        className="absolute top-1/2 right-1.5 inline-flex size-[34px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-ink-50 hover:enabled:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue disabled:cursor-not-allowed disabled:opacity-50"
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
