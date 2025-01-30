import React, { useContext } from "react";
import {
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  TwitterAuthProvider,
  browserPopupRedirectResolver,
  getMultiFactorResolver,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { providerStyles } from "./providerStyles";
import EmailPassword from "./EmailPassword/EmailPassword";
import { translate, translateError } from "./languages";
import { SignInOption } from "./types";
import { ConfigContext } from "./FirebaseAuthUi";
import { styles } from "./defaults";

const providerMap = {
  "google.com": () => new GoogleAuthProvider(),
  "github.com": () => new GithubAuthProvider(),
  "x.com": () => new TwitterAuthProvider(),
  "facebook.com": () => new FacebookAuthProvider(),
  "microsoft.com": () => new OAuthProvider("microsoft.com"),
  "yahoo.com": () => new OAuthProvider("yahoo.com"),
  "apple.com": () => new OAuthProvider("apple.com"),
};

export default function Provider({
  provider: providerId,
  signInFlow,
  scopes,
  customParameters,
  providerName,
  fullLabel,
  authType,
  customStyles,
  icon,
  jsx,
}: SignInOption) {
  const config = useContext(ConfigContext);

  if (!providerName) {
    if (providerId == "emaillink") {
      providerName = "Email Link";
    } else if (providerId == "phonenumber") {
      providerName = "Phone Number";
    } else {
      const match = providerId.match(/^([^.]+)/);
      providerName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
  }

  if (providerId == "anonymous" && !fullLabel) {
    fullLabel = translate("signInAsGuest", config.language, config.customText);
  }

  if (providerId == "emaillink" && !fullLabel) {
    fullLabel = translate(
      "signInWithEmailLink",
      config.language,
      config.customText,
    );
  }

  let provider: OAuthProvider;

  //non-default providers are initialized as OAuth
  if (providerId != "emailpassword") {
    provider = providerMap[providerId]
      ? providerMap[providerId]()
      : new OAuthProvider(providerId);
  }

  if (provider && scopes) {
    scopes.forEach((scope) => provider.addScope(scope));
  }

  if (provider && customParameters) {
    provider.setCustomParameters(customParameters);
  }

  const submit = async () => {
    if (providerId == "emaillink") {
      config.setState({ key: "emailLinkOpen", value: true });
    } else if (providerId == "phonenumber") {
      config.setState({ key: "sendSMS", value: true });
    } else {
      const flowFunction = () =>
        providerId == "anonymous"
          ? signInAnonymously(config.auth)
          : signInFlow == "redirect"
            ? signInWithRedirect(
                config.auth,
                provider,
                browserPopupRedirectResolver,
              )
            : signInWithPopup(
                config.auth,
                provider,
                browserPopupRedirectResolver,
              );
      try {
        await flowFunction().then((user) => {
          config.callbacks.signInSuccessWithAuthResult(user);
        });
      } catch (error) {
        if (error.code === "auth/multi-factor-auth-required") {
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
          if (typeof config.callbacks.signInFailure === "function") {
            config.callbacks.signInFailure(error);
          }
        }
      }
    }
  };

  const providerData = providerStyles[providerId] || providerStyles["default"];
  const buttonStyles = {
    ...providerData?.buttonStyles,
    ...customStyles,
  };

  return providerId == "emailpassword" ? (
    <EmailPassword authType={authType} fullLabel={fullLabel} />
  ) : providerId == "jsx" ? (
    <>{jsx}</>
  ) : (
    <button
      style={{
        ...styles.providerButton,
        ...buttonStyles,
      }}
      onClick={submit}
    >
      {icon ? icon : providerData.icon}
      <span style={styles.providerButtonText}>
        {fullLabel
          ? fullLabel
          : `${translate("signInWith", config.language, config.customText)} ${providerName}`}
      </span>
    </button>
  );
}
