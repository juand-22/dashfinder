import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ children, className, type = "button", ...buttonProps }: ButtonProps) {
  return (
    <button
      className={`ui-button${className ? ` ${className}` : ""}`}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
