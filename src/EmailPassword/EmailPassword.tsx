"use client";

import React, {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  sendSignInLinkToEmail,
  updateProfile,
  Auth,
  MultiFactorResolver,
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
import { FirebaseAuthUiConfig } from "../types";

interface EmailPasswordProps {
  auth: Auth;
  callbacks: FirebaseAuthUiConfig["callbacks"];
  authType?: "both" | "signIn" | "signUp";
  setAlert: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
  continueUrl: FirebaseAuthUiConfig["continueUrl"];
  passwordSpecs: FirebaseAuthUiConfig["passwordSpecs"];
  setSendSMS: Dispatch<SetStateAction<boolean>>;
  setMfaSignIn: Dispatch<SetStateAction<boolean>>;
  formDisabledStyles: CSSProperties;
  formButtonStyles: CSSProperties;
  formInputStyles: CSSProperties;
  displayName: FirebaseAuthUiConfig["displayName"];
  formLabelStyles: CSSProperties;
  formSmallButtonStyles: CSSProperties;
  customErrors: FirebaseAuthUiConfig["customErrors"];
  setMfaResolver: Dispatch<SetStateAction<MultiFactorResolver>>;
  fullLabel: string;
  language: FirebaseAuthUiConfig["language"];
  customText: FirebaseAuthUiConfig["customText"];
}

export default function EmailPassword({
  auth,
  callbacks,
  authType = "both",
  setAlert,
  setError,
  continueUrl,
  passwordSpecs,
  setSendSMS,
  setMfaSignIn,
  formDisabledStyles,
  formButtonStyles,
  formInputStyles,
  displayName,
  formLabelStyles,
  formSmallButtonStyles,
  customErrors,
  setMfaResolver,
  fullLabel,
  language,
  customText,
}: EmailPasswordProps) {
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
        (displayName === "required" ? nameValid : true),
    );
  }, [emailValid, passwordValid, nameValid]);

  // MFA Resolver

  async function authenticateUser(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (authType === "signIn") {
      try {
        await signInWithEmailAndPassword(auth, email, password).then(
          (userCred) => {
            if (callbacks?.signInSuccessWithAuthResult)
              callbacks.signInSuccessWithAuthResult(userCred);
          },
        );
      } catch (err) {
        const error = processNetworkError(err);
        if (error.code === "auth/multi-factor-auth-required") {
          // signing them in didn't work because they have MFA enabled. Let's send them an MFA token
          setMfaResolver(getMultiFactorResolver(auth, error));
          setMfaSignIn(true);
          setSendSMS(true);
        } else {
          setError(translateError(error.code, language, customText));
          setLoading(false);
          if (typeof callbacks?.signInFailure === "function")
            callbacks?.signInFailure(error);
        }
      }
    } else {
      // first try to create an account
      try {
        await createUserWithEmailAndPassword(auth, email, password).then(
          async (userCred) => {
            if (displayName && name) {
              await updateProfile(auth.currentUser, {
                displayName: name,
              }).then(() => {
                if (callbacks?.signInSuccessWithAuthResult)
                  callbacks.signInSuccessWithAuthResult(userCred);
              });
            } else {
              if (callbacks?.signInSuccessWithAuthResult)
                callbacks.signInSuccessWithAuthResult(userCred);
            }

            setLoading(false);
          },
        );
      } catch (err) {
        const error = processNetworkError(err);
        if (
          error.code === "auth/email-already-in-use" &&
          authType !== "signUp"
        ) {
          // because the user already has an account! Let's try signing them in...
          try {
            await signInWithEmailAndPassword(auth, email, password).then(
              (userCred) => {
                if (callbacks?.signInSuccessWithAuthResult)
                  callbacks.signInSuccessWithAuthResult(userCred);
                setLoading(false);
              },
            );
            return;
          } catch (err) {
            const error = processNetworkError(err);
            //const code2 = codeFromError(err2);
            setLoading(false);
            if (error.code === "auth/multi-factor-auth-required") {
              // signing them in didn't work because they have MFA enabled. Let's send them an MFA token
              setMfaResolver(getMultiFactorResolver(auth, error));
              setMfaSignIn(true);
              setSendSMS(true);
            } else {
              // signing in didn't work for a different reason
              setError(translateError(error.code, language, customText));
              if (typeof callbacks?.signInFailure === "function")
                callbacks?.signInFailure(error);
            }
          }
        } else {
          // creating an account didn't work for some other reason
          setLoading(false);
          setError(translateError(error.code, language, customText));
          if (typeof callbacks?.signInFailure === "function")
            callbacks?.signInFailure(error);
        }
      }
    }
  }

  async function onResetPassword() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("email", email);
      url.searchParams.set("resetPassword", "true");
      await sendSignInLinkToEmail(auth, email, {
        handleCodeInApp: true,
        url: url.toString(),
      }).then(() => {
        setAlert(
          `${translate("resetPasswordSent", language, customText)} ${email}.`,
        );
      });
    } catch (err) {
      const error = processNetworkError(err);
      setError(translateError(error.code, language, customText));
    }
  }

  return (
    <form style={{ width: "100%" }} onSubmit={authenticateUser}>
      {displayName && (
        <NameField
          value={name}
          setValue={setName}
          validInputStyle={validInputStyle}
          invalidInputStyle={invalidInputStyle}
          labelStyle={labelStyle}
          descriptionStyle={descriptionStyle}
          disabled={loading}
          formInputStyles={formInputStyles}
          formLabelStyles={formLabelStyles}
          setNameValid={setNameValid}
          language={language}
          customText={customText}
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
        formInputStyles={formInputStyles}
        formLabelStyles={formLabelStyles}
        setEmailValid={setEmailValid}
        language={language}
        customText={customText}
      />

      <PasswordField
        value={password}
        setValue={setPassword}
        specs={passwordSpecs}
        validInputStyle={validInputStyle}
        invalidInputStyle={invalidInputStyle}
        labelStyle={labelStyle}
        descriptionStyle={descriptionStyle}
        newPassword={false}
        onResetPassword={onResetPassword}
        disabled={loading}
        formInputStyles={formInputStyles}
        formLabelStyles={formLabelStyles}
        formSmallButtonStyles={formSmallButtonStyles}
        setPasswordValid={setPasswordValid}
        authType={authType}
        emailValid={emailValid}
        setError={setError}
        language={language}
        customText={customText}
        callbacks={callbacks}
      />

      <button
        tabIndex={3}
        type="submit"
        disabled={loading || !formIsValid}
        style={{
          ...buttonStyle,
          ...formButtonStyles,
          ...(formIsValid
            ? {}
            : {
                backgroundColor: "#696969",
                borderColor: "#2e2e2e",
                ...formDisabledStyles,
              }),
        }}
      >
        {loading
          ? translate("loading", language, customText)
          : fullLabel || translate("loginButton", language, customText)}
      </button>
    </form>
  );
}
