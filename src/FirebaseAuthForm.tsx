import React, { useContext, useEffect } from "react";
import { styles } from "./defaults";
import EmailLink from "./EmailLink";
import PhoneNumber from "./PhoneNumber";
import { SignInProviders } from "./SignInProviders";
import VerifyEmail from "./VerifyEmail";
import { ConfigContext } from "./FirebaseAuthUi";
import { isSignInWithEmailLink, onAuthStateChanged } from "firebase/auth";

export const FirebaseAuthForm = () => {
  const config = useContext(ConfigContext);

  useEffect(
    () =>
      config.setState({
        key: "emailLinkOpen",
        value: isSignInWithEmailLink(config.auth, window.location.href),
      }),
    [],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(config.auth, (user) => {
      config.setState({ key: "user", value: user });
    });
    return () => unsubscribe();
  }, [config.auth]);

  useEffect(() => {
    if (config.state.error && config.state.alert) {
      config.setState({ key: "alert", value: "" });
    }
  }, [config.state.error]);

  useEffect(() => {
    if (config.state.alert && config.state.error) {
      config.setState({ key: "error", value: "" });
    }
  }, [config.state.alert]);

  useEffect(() => {
    if (
      config?.requireVerifyEmail &&
      config.state.user &&
      config.state.user.providerData[0].providerId == "password" &&
      !config.state.user?.emailVerified
    ) {
      config.setState({ key: "verify", value: true });
    }
  }, [config.state.user]);

  return (
    <div
      style={{
        ...styles.container,
        ...config?.containerStyles,
      }}
    >
      {!config.state.sendSMS &&
        !config.state.emailLinkOpen &&
        !config.state.verify && (
          <SignInProviders signInOptions={config.signInOptions} />
        )}
      {config.state.sendSMS && <PhoneNumber />}
      {config.state.verify && <VerifyEmail />}
      {config.state.emailLinkOpen && <EmailLink />}

      {config.state.alert && (
        <div
          onClick={() => config.setState({ key: "alert", value: "" })}
          style={styles.alert}
        >
          <p style={styles.alertErrorText}>{config.state.alert}</p>
        </div>
      )}
      {config.state.error && (
        <div
          onClick={() => config.setState({ key: "error", value: "" })}
          style={styles.error}
        >
          <p style={styles.alertErrorText}>{config.state.error}</p>
        </div>
      )}
    </div>
  );
};
