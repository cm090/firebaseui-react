"use client";
import React, {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { useEffect } from "react";
import { translate } from "../languages";
import { FirebaseAuthUiConfig } from "../types";

interface NameFieldProps {
  value: string;
  setValue: (value: string) => void;
  validInputStyle: CSSProperties;
  invalidInputStyle: CSSProperties;
  labelStyle: CSSProperties;
  descriptionStyle: CSSProperties;
  disabled?: boolean;
  formInputStyles?: CSSProperties;
  formLabelStyles?: CSSProperties;
  setNameValid: Dispatch<SetStateAction<boolean>>;
  language: FirebaseAuthUiConfig["language"];
  customText: FirebaseAuthUiConfig["customText"];
}

export default function NameField({
  value,
  setValue,
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  disabled = false,
  formInputStyles,
  formLabelStyles,
  setNameValid,
  language,
  customText,
}: NameFieldProps) {
  const [isDirty, setIsDirty] = useState(false);
  const isValid = /^[a-zA-Z'-\s]+$/.test(value); //only letters, apostrophes, and hyphens

  const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

  useEffect(() => {
    setNameValid(isValid);
  }, [value]);

  return (
    <div>
      <label htmlFor="email" style={{ ...labelStyle, ...formLabelStyles }}>
        {translate("name", language, customText)}
      </label>
      <div style={{ marginTop: "0.5rem" }}>
        <input
          required
          type="text"
          name="name"
          id="name"
          style={{ ...inputStyle, ...formInputStyles }}
          placeholder={translate("namePlaceholder", language, customText)}
          autoComplete="name"
          aria-describedby="name-description"
          aria-invalid={!isValid ? "true" : "false"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsDirty(true)}
          disabled={disabled}
        />
      </div>
      <p style={descriptionStyle} id="name-description">
        {isDirty && !isValid && translate("nameDirty", language, customText)}
        &nbsp;
      </p>
    </div>
  );
}
