import React, {
  FormEventHandler,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  sendSignInLinkToEmail,
  updateProfile,
  AuthError,
} from "firebase/auth";

import EmailField from "./EmailField";
import PasswordField from "./PasswordField";

import {
  validInputStyle,
  invalidInputStyle,
  labelStyle,
  descriptionStyle,
  buttonStyle,
} from "./defaultStyles";
import NameField from "./NameField";
import { translate, translateError } from "../languages";
import { ConfigContext } from "../FirebaseAuthUi";

interface EmailPasswordProps {
  authType: "both" | "signIn" | "signUp";
  fullLabel: string;
}

export default function EmailPassword({
  authType,
  fullLabel,
}: EmailPasswordProps) {
  const config = useContext(ConfigContext);

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);

  const [passwordValid, setPasswordValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [nameValid, setNameValid] = useState(false);

  const processNetworkError = (err: AuthError) => {
    const error = JSON.parse(JSON.stringify(err));
    if (
      error.code === "400" ||
      (error.code === "auth/network-request-failed" && error?.message)
    ) {
      const message = error.message;
      const sliced = message.slice(32, message.length - 2);
      error.code = sliced;
    }

    return error;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email") || "";
    if (emailParam) setEmail(emailParam);
  }, []);

  useEffect(() => {
    setFormIsValid(
      passwordValid &&
        emailValid &&
        (config.displayName === "required" ? nameValid : true),
    );
  }, [emailValid, passwordValid, nameValid]);

  // MFA Resolver

  async function authenticateUser(e: FormEventHandler) {
    (e as unknown as { preventDefault: () => void }).preventDefault();
    if (loading) return;
    setLoading(true);

    if (authType === "signIn") {
      await signInWithEmailAndPassword(config.auth, email, password)
        .then((userCred) => {
          if (config.callbacks.signInSuccessWithAuthResult) {
            config.callbacks.signInSuccessWithAuthResult(userCred);
          }
        })
        .catch((err) => {
          const error = processNetworkError(err);
          if (error.code === "auth/multi-factor-auth-required") {
            // signing them in didn't work because they have MFA enabled. Let's send them an MFA token
            config.setState({
              key: "mfaResolver",
              value: getMultiFactorResolver(config.auth, error),
            });
            config.setState({ key: "mfaSignIn", value: true });
            config.setState({ key: "sendSMS", value: true });
          } else {
            config.setState({
              key: "error",
              value: translateError(
                error.code,
                config.language,
                config.customText,
              ),
            });
            setLoading(false);
            if (typeof config.callbacks.signInFailure === "function") {
              config.callbacks.signInFailure(error);
            }
          }
        });
    } else {
      // first try to create an account
      await createUserWithEmailAndPassword(config.auth, email, password)
        .then(async (userCred) => {
          if (config.displayName && name) {
            await updateProfile(config.auth.currentUser!, {
              displayName: name,
            }).then(() => {
              if (config.callbacks.signInSuccessWithAuthResult) {
                config.callbacks.signInSuccessWithAuthResult(userCred);
              }
            });
          } else if (config.callbacks.signInSuccessWithAuthResult) {
            config.callbacks.signInSuccessWithAuthResult(userCred);
          }

          setLoading(false);
        })
        .catch(async (err) => {
          const error = processNetworkError(err);
          if (
            error.code === "auth/email-already-in-use" &&
            authType !== "signUp"
          ) {
            // because the user already has an account! Let's try signing them in...
            await signInWithEmailAndPassword(config.auth, email, password)
              .then((userCred) => {
                if (config.callbacks.signInSuccessWithAuthResult) {
                  config.callbacks.signInSuccessWithAuthResult(userCred);
                }
                setLoading(false);
              })
              .catch((err) => {
                const error = processNetworkError(err);
                //const code2 = codeFromError(err2);
                setLoading(false);
                if (error.code === "auth/multi-factor-auth-required") {
                  // signing them in didn't work because they have MFA enabled. Let's send them an MFA token
                  config.setState({
                    key: "mfaResolver",
                    value: getMultiFactorResolver(config.auth, error),
                  });
                  config.setState({ key: "mfaSignIn", value: true });
                  config.setState({ key: "sendSMS", value: true });
                } else {
                  // signing in didn't work for a different reason
                  config.setState({
                    key: "error",
                    value: translateError(
                      error.code,
                      config.language,
                      config.customText,
                    ),
                  });
                  if (typeof config.callbacks.signInFailure === "function") {
                    config.callbacks.signInFailure(error);
                  }
                }
              });
          } else {
            // creating an account didn't work for some other reason
            setLoading(false);
            config.setState({
              key: "error",
              value: translateError(
                error.code,
                config.language,
                config.customText,
              ),
            });
            if (typeof config.callbacks.signInFailure === "function") {
              config.callbacks.signInFailure(error);
            }
          }
        });
    }
  }

  async function onResetPassword() {
    const url = new URL(window.location.href);
    url.searchParams.set("email", email);
    url.searchParams.set("resetPassword", "true");
    await sendSignInLinkToEmail(config.auth, email, {
      handleCodeInApp: true,
      url: url.toString(),
    })
      .then(() => {
        config.setState({
          key: "alert",
          value: `${translate("resetPasswordSent", config.language, config.customText)} ${email}.`,
        });
      })
      .catch((err) => {
        const error = processNetworkError(err);
        config.setState({
          key: "error",
          value: translateError(error.code, config.language, config.customText),
        });
      });
  }

  return (
    <form
      style={{ width: "100%" }}
      onSubmit={(e) => authenticateUser(e as unknown as FormEventHandler)}
    >
      {config.displayName && (
        <NameField
          value={name}
          setValue={setName}
          validInputStyle={validInputStyle}
          invalidInputStyle={invalidInputStyle}
          labelStyle={labelStyle}
          descriptionStyle={descriptionStyle}
          disabled={loading}
          setNameValid={setNameValid}
        />
      )}

      <EmailField
        value={email}
        setValue={setEmail}
        validInputStyle={validInputStyle}
        invalidInputStyle={invalidInputStyle}
        labelStyle={labelStyle}
        descriptionStyle={descriptionStyle}
        disabled={loading}
        setEmailValid={setEmailValid}
      />

      <PasswordField
        value={password}
        setValue={setPassword}
        validInputStyle={validInputStyle}
        invalidInputStyle={invalidInputStyle}
        labelStyle={labelStyle}
        descriptionStyle={descriptionStyle}
        newPassword={false}
        onResetPassword={onResetPassword}
        disabled={loading}
        setPasswordValid={setPasswordValid}
        authType={authType}
        emailValid={emailValid}
      />

      <button
        tabIndex={3}
        type="submit"
        disabled={loading || !formIsValid}
        style={{
          ...buttonStyle,
          ...config.formButtonStyles,
          ...(formIsValid
            ? {}
            : {
                backgroundColor: "#696969",
                borderColor: "#2e2e2e",
                ...config.formDisabledStyles,
              }),
        }}
      >
        {loading
          ? translate("loading", config.language, config.customText)
          : fullLabel ||
            translate("loginButton", config.language, config.customText)}
      </button>
    </form>
  );
}
