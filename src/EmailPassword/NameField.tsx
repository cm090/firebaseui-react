"use client";
import React, {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { useEffect } from "react";
import { translate } from "../languages";
import { ConfigContext } from "../FirebaseAuthUi";

interface NameFieldProps {
  value: string;
  setValue: (value: string) => void;
  validInputStyle: CSSProperties;
  invalidInputStyle: CSSProperties;
  labelStyle: CSSProperties;
  descriptionStyle: CSSProperties;
  disabled?: boolean;
  setNameValid: Dispatch<SetStateAction<boolean>>;
}

export default function NameField({
  value,
  setValue,
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  disabled = false,
  setNameValid,
}: NameFieldProps) {
  const config = useContext(ConfigContext);

  const [isDirty, setIsDirty] = useState(false);
  const isValid = /^[a-zA-Z'-\s]+$/.test(value); //only letters, apostrophes, and hyphens

  const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

  useEffect(() => {
    setNameValid(isValid);
  }, [value]);

  return (
    <div>
      <label
        htmlFor="email"
        style={{ ...labelStyle, ...config.formLabelStyles }}
      >
        {translate("name", config.language, config.customText)}
      </label>
      <div style={{ marginTop: "0.5rem" }}>
        <input
          required
          type="text"
          name="name"
          id="name"
          style={{ ...inputStyle, ...config.formInputStyles }}
          placeholder={translate(
            "namePlaceholder",
            config.language,
            config.customText,
          )}
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
        {isDirty &&
          !isValid &&
          translate("nameDirty", config.language, config.customText)}
        &nbsp;
      </p>
    </div>
  );
}
