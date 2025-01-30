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

function passwordErrors({ password, passwordSpecs }) {
  const errors = [];
  const minCharacters = Math.max(6, passwordSpecs?.minCharacters || 6);
  if (password.length < minCharacters)
    errors.push(`be at least ${minCharacters} characters long`);

  if (passwordSpecs?.containsUppercase && !/[A-Z]/.test(password)) {
    errors.push("contain at least one uppercase character");
  }

  if (passwordSpecs?.containsLowercase && !/[a-z]/.test(password)) {
    errors.push("contain at least one lowercase character");
  }

  if (passwordSpecs?.containsNumber && !/\d/.test(password)) {
    errors.push("contain at least one number");
  }

  if (
    passwordSpecs?.containsSpecialCharacter &&
    !/[!@#$%^&*()_+\-=[]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push("contain at least one special character");
  }

  return errors;
}

function formatPasswordRequirements(passwordSpecs, language, customText) {
  const requirements = [];

  requirements.push(
    `${translate("atLeast", language, customText)} ${
      passwordSpecs?.minCharacters || 6
    } ${translate("characters", language, customText)}`,
  );

  const additionalReqs = [];

  if (passwordSpecs?.containsUppercase) {
    additionalReqs.push(translate("oneUppercase", language, customText));
  }

  if (passwordSpecs?.containsLowercase) {
    additionalReqs.push(translate("oneLowercase", language, customText));
  }

  if (passwordSpecs?.containsSpecialCharacter) {
    additionalReqs.push(translate("oneSpecial", language, customText));
  }

  if (passwordSpecs?.containsNumber) {
    additionalReqs.push(translate("oneNumber", language, customText));
  }

  if (additionalReqs.length > 0) {
    const additionalReqString =
      additionalReqs.length > 1
        ? additionalReqs.slice(0, -1).join(", ") +
          `, ${translate("and", language, customText)} ` +
          additionalReqs.slice(-1)
        : additionalReqs[0];
    requirements.push(
      `${translate(
        "andContainAtLeast",
        language,
        customText,
      )} ${additionalReqString}`,
    );
  }

  const formattedString =
    translate("strongPasswordsHave", language, customText) +
    " " +
    requirements.join(" ") +
    ".";

  return formattedString;
}

interface PasswordFieldProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  validInputStyle: CSSProperties;
  invalidInputStyle: CSSProperties;
  labelStyle: CSSProperties;
  descriptionStyle: CSSProperties;
  newPassword?: boolean;
  onResetPassword?: VoidFunction;
  setPasswordValid: Dispatch<SetStateAction<boolean>>;
  authType: string;
  emailValid: boolean;
  disabled?: boolean;
}

export default function PasswordField({
  value,
  setValue,
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  newPassword = false,
  onResetPassword = null,
  setPasswordValid,
  authType,
  emailValid,
}: PasswordFieldProps) {
  const config = useContext(ConfigContext);

  const [show, setShow] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [resettingPassword, setResettingPassword] = useState(false);

  const isValid =
    passwordErrors({ password: value, passwordSpecs: config.passwordSpecs })
      .length === 0;

  const inputStyle = isDirty && !isValid ? invalidInputStyle : validInputStyle;

  useEffect(() => {
    setPasswordValid(isValid);
  }, [value]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label
          htmlFor="password"
          style={{ ...labelStyle, ...config.formLabelStyles }}
        >
          {newPassword
            ? translate("newPassword", config.language, config.customText)
            : translate("password", config.language, config.customText)}
        </label>
        {authType != "signUp" && (
          <div style={{ fontSize: "0.875rem" }}>
            <button
              style={{
                fontWeight: "600",
                color: emailValid ? "#2563eb" : "#3b3b3b",
                ...config.formSmallButtonStyles,
              }}
              type="button"
              tabIndex={4}
              onClick={async (e) => {
                e.preventDefault();
                if (!newPassword) {
                  if (!emailValid) {
                    config.setState({
                      key: "error",
                      value: translate(
                        "invalidEmail",
                        config.language,
                        config.customText,
                      ),
                    });
                  } else {
                    setResettingPassword(true);
                    onResetPassword();
                    setResettingPassword(false);
                  }
                } else {
                  if (config.callbacks.signInSuccessWithAuthResult) {
                    config.callbacks.signInSuccessWithAuthResult(null);
                  }
                }
              }}
            >
              {newPassword
                ? translate("skip", config.language, config.customText)
                : resettingPassword
                  ? translate("sending", config.language, config.customText)
                  : translate(
                      "sendResetLink",
                      config.language,
                      config.customText,
                    )}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <input
          required
          type={show ? "text" : "password"}
          name="password"
          id="password"
          style={{ ...inputStyle, ...config.formInputStyles }}
          placeholder={
            newPassword
              ? translate(
                  "newPasswordPlaceholder",
                  config.language,
                  config.customText,
                )
              : translate(
                  "passwordPlaceholder",
                  config.language,
                  config.customText,
                )
          }
          autoComplete={newPassword ? "new-password" : "current-password"}
          aria-describedby="password-description"
          aria-invalid={!isValid ? "true" : "false"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsDirty(true)}
          tabIndex={2}
        />
      </div>
      <p style={descriptionStyle} id="password-description">
        {isDirty &&
          !isValid &&
          formatPasswordRequirements(
            config.passwordSpecs,
            config.language,
            config.customText,
          )}
        &nbsp;
      </p>
    </div>
  );
}
