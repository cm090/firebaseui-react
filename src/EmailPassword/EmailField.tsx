"use client";
import React, {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from "react";
import { translate } from "../languages";
import { FirebaseAuthUiConfig } from "../types";

interface EmailFieldProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  validInputStyle: CSSProperties;
  invalidInputStyle: CSSProperties;
  labelStyle: CSSProperties;
  descriptionStyle: CSSProperties;
  disabled?: boolean;
  formInputStyles: CSSProperties;
  formLabelStyles: CSSProperties;
  setEmailValid: Dispatch<SetStateAction<boolean>>;
  language: FirebaseAuthUiConfig["language"];
  customText: FirebaseAuthUiConfig["customText"];
}

export default function EmailField({
  value,
  setValue,
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  disabled = false,
  formInputStyles,
  formLabelStyles,
  setEmailValid,
  language,
  customText,
}: EmailFieldProps) {
  const [isDirty, setIsDirty] = useState(false);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

  useEffect(() => {
    setEmailValid(isValid);
  }, [value]);

  return (
    <div>
      <label htmlFor="email" style={{ ...labelStyle, ...formLabelStyles }}>
        {translate("email", language, customText)}
      </label>
      <div style={{ marginTop: "0.5rem" }}>
        <input
          required
          type="email"
          name="email"
          id="email"
          style={{ ...inputStyle, ...formInputStyles }}
          placeholder={translate("emailPlaceholder", language, customText)}
          autoComplete="email"
          aria-describedby="email-description"
          aria-invalid={!isValid ? "true" : "false"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsDirty(true)}
          disabled={disabled}
          tabIndex={1}
        />
      </div>
      <p style={descriptionStyle} id="email-description">
        {isDirty && !isValid && translate("emailDirty", language, customText)}
        &nbsp;
      </p>
    </div>
  );
}
