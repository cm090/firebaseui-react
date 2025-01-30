"use client";
import {
  getMultiFactorResolver,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  updateProfile,
} from "firebase/auth";
import React, { useState, useEffect, useRef, useContext } from "react";
import { translate, translateError } from "./languages";
import { ConfigContext } from "./FirebaseAuthUi";

export default function EmailLink() {
  const config = useContext(ConfigContext);

  const [email, setEmail] = useState("");
  const [formIsValid, setFormIsValid] = useState(false);
  const [finishEmailSignIn, setFinishEmailSignIn] = useState(false);
  const [name, setName] = useState("");
  const emailRef = useRef(null);

  const processNetworkError = (error) => {
    error = JSON.parse(JSON.stringify(error));
    if (
      error.code === 400 ||
      (error.code === "auth/network-request-failed" &&
        error?.customData?.message)
    ) {
      const message = error.customData.message;
      const sliced = message.slice(32, message.length - 2);
      error.code = sliced;
    }

    return error;
  };

  useEffect(
    () =>
      setFinishEmailSignIn(
        isSignInWithEmailLink(config.auth, window.location.href),
      ),
    [],
  );

  useEffect(() => {
    setFormIsValid(
      isEmailValid() &&
        (config.displayName == "required" ? name.length > 0 : true),
    );
  }, [email, name]);

  useEffect(() => {
    let isSigningIn = false;
    if (config.auth && finishEmailSignIn && !isSigningIn) {
      isSigningIn = true;
      finishSignUp();
    }

    async function finishSignUp() {
      const queryParams = new URLSearchParams(window.location.search);
      const queryEmail = queryParams.get("email");
      const queryName = queryParams.get("name");

      try {
        await signInWithEmailLink(
          config.auth,
          queryEmail,
          window.location.href,
        ).then((user) => {
          if (queryName) {
            updateProfile(user.user, { displayName: queryName }).then(() => {
              if (config.callbacks.signInSuccessWithAuthResult) {
                config.callbacks.signInSuccessWithAuthResult(user);
              }
            });
          } else if (config.callbacks.signInSuccessWithAuthResult) {
            config.callbacks.signInSuccessWithAuthResult(user);
          }
          config.setState({ key: "emailLinkOpen", value: false });
        });
      } catch (err) {
        const error = processNetworkError(err);
        if (error.code === "auth/multi-factor-auth-required") {
          config.setState({
            key: "mfaResolver",
            value: getMultiFactorResolver(config.auth, error),
          });
          config.setState({ key: "mfaSignIn", value: true });
          config.setState({ key: "emailLinkOpen", value: false });
          config.setState({ key: "sendSMS", value: true });
        } else {
          if (
            finishEmailSignIn &&
            typeof config.callbacks.signInFailure === "function"
          ) {
            config.callbacks.signInFailure(error);
          }
          config.setState({
            key: "error",
            value: translateError(
              error.code,
              config.language,
              config.customText,
            ),
          });
          throw new Error(error);
        }
      }
    }
  }, [finishEmailSignIn, config.auth]);

  const isEmailValid = function () {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const submit = async function (e) {
    e.preventDefault();
    try {
      if (finishEmailSignIn) {
        await signInWithEmailLink(
          config.auth,
          email,
          window.location.href,
        ).then((user) => {
          if (config.callbacks.signInSuccessWithAuthResult) {
            config.callbacks.signInSuccessWithAuthResult(user);
          }
          config.setState({ key: "emailLinkOpen", value: false });
        });
      } else {
        await sendSignInLinkToEmail(config.auth, email, {
          handleCodeInApp: true,
          url: `${config.continueUrl}/?email=${email}${
            name.length > 0 ? "&name=" + name : ""
          }`,
        }).then(() => {
          config.setState({
            key: "alert",
            value: `${translate("signInLinkSent", config.language, config.customText)} ${email}`,
          });
        });
      }
    } catch (err) {
      const error = processNetworkError(err);
      if (
        finishEmailSignIn &&
        typeof config.callbacks.signInFailure === "function"
      ) {
        config.callbacks.signInFailure(error);
      }
      config.setState({
        key: "error",
        value: translateError(error.code, config.language, config.customText),
      });
    }
  };

  return (
    <>
      <h1
        style={{
          fontSize: "1.125rem",
          fontWeight: "600",
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {translate("signInWithEmailLink", config.language, config.customText)}
      </h1>

      {finishEmailSignIn && (
        <p style={{ fontSize: "0.875rem" }}>
          {translate("signingYouIn", config.language, config.customText)}
        </p>
      )}

      {!finishEmailSignIn && (
        <form
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "1rem",
            marginBottom: "1rem",
            gap: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#1a202c", // gray-900
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label style={config.formLabelStyles} htmlFor="email">
                {translate("email", config.language, config.customText)}
                <span style={{ color: "#FF0000" }}> *</span>
              </label>
              <button
                onClick={() =>
                  config.setState({ key: "emailLinkOpen", value: false })
                }
                style={{
                  fontSize: "0.875rem",
                  color: "#2b6cb0",
                  border: "none",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  ...config.formSmallButtonStyles,
                }}
              >
                {translate("cancel", config.language, config.customText)}
              </button>
            </div>

            <input
              ref={emailRef}
              name="email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                border: "1px solid #e2e8f0", // gray-300
                borderRadius: "0.375rem",
                padding: "0.5rem 0.25rem",
                width: "100%",
                ...config.formInputStyles,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              color: "white",
              alignItems: "center",
              fontWeight: "600",
              marginTop: "1.25rem",
              width: "100%",
              height: "2.25rem",
              transition: "background-color 150ms",
              backgroundColor: formIsValid ? "#60a5fa" : "#9ca3af", // bg-blue-400 for valid, bg-gray-400 for invalid
              cursor: formIsValid ? "pointer" : "default", // cursor changes based on form validity
              ...(formIsValid
                ? { ":hover": { backgroundColor: "#3b82f6" } }
                : {}), // hover effect for valid form
              display: "flex",
              gap: "0.75rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.375rem",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              justifyContent: "center",
              border: "none",
              ...config.formButtonStyles,
              ...(formIsValid ? {} : config.formDisabledStyles),
            }}
            onClick={(e) => submit(e)}
          >
            {finishEmailSignIn
              ? translate("finishSigningIn", config.language, config.customText)
              : translate("sendEmailLink", config.language, config.customText)}
          </button>
        </form>
      )}
    </>
  );
}
