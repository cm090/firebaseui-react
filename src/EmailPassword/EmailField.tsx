"use client";
import React, {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useContext,
} from "react";
import { translate } from "../languages";
import { ConfigContext } from "../FirebaseAuthUi";

interface EmailFieldProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  validInputStyle: CSSProperties;
  invalidInputStyle: CSSProperties;
  labelStyle: CSSProperties;
  descriptionStyle: CSSProperties;
  disabled?: boolean;
  setEmailValid: Dispatch<SetStateAction<boolean>>;
}

export default function EmailField({
  value,
  setValue,
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  disabled = false,
  setEmailValid,
}: EmailFieldProps) {
  const config = useContext(ConfigContext);

  const [isDirty, setIsDirty] = useState(false);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

  useEffect(() => {
    setEmailValid(isValid);
  }, [value]);

  return (
    <div>
      <label
        htmlFor="email"
        style={{ ...labelStyle, ...config.formLabelStyles }}
      >
        {translate("email", config.language, config.customText)}
      </label>
      <div style={{ marginTop: "0.5rem" }}>
        <input
          required
          type="email"
          name="email"
          id="email"
          style={{ ...inputStyle, ...config.formInputStyles }}
          placeholder={translate(
            "emailPlaceholder",
            config.language,
            config.customText,
          )}
          autoComplete="email"
          aria-describedby="email-description"
          aria-invalid={!isValid ? "true" : "false"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsDirty(true)}
          disabled={disabled}
        />
      </div>
      <p style={descriptionStyle} id="email-description">
        {isDirty &&
          !isValid &&
          translate("emailDirty", config.language, config.customText)}
        &nbsp;
      </p>
    </div>
  );
}
