import type { InputHTMLAttributes, ReactNode } from "react";
import "./TextInput.css";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

export function TextInput({
  startAdornment,
  endAdornment,
  className,
  ...inputProps
}: TextInputProps) {
  return (
    <div className="text-input">
      {startAdornment && (
        <span className="text-input__adornment text-input__adornment--start" aria-hidden="true">
          {startAdornment}
        </span>
      )}
      <input
        className={`text-input__control${className ? ` ${className}` : ""}`}
        {...inputProps}
      />
      {endAdornment && (
        <span className="text-input__adornment text-input__adornment--end">
          {endAdornment}
        </span>
      )}
    </div>
  );
}
