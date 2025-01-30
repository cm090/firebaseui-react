import React, { useContext } from "react";
import { sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import { ConfigContext } from "./FirebaseAuthUi";

export default function VerifyEmail() {
  const config = useContext(ConfigContext);

  const [verified, setVerified] = useState(config.state.user?.emailVerified);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (config.state.user) {
      setVerified(config.state.user.emailVerified);
    }
  }, [config.state.user]);

  if (verified) {
    return (
      <>
        <h1>Email Verified</h1>
        <p>Your email has been verified.</p>
      </>
    );
  }

  if (!config.state.user) {
    config.setState({
      key: "error",
      value: "No user is signed in.",
    });
    return <></>;
  }

  return (
    <>
      <h1>Email Verification</h1>
      {!sent && <p>You&apos;ll need to verify your email to continue.</p>}
      {!sent && (
        <button
          onClick={async (e) => {
            e.preventDefault();
            await sendEmailVerification(config.state.user!)
              .then(() => {
                setSent(true);
                config.setState({
                  key: "alert",
                  value: `An email has been sent to ${
                    config.state.user?.email
                  }`,
                });
              })
              .catch((error) => {
                config.setState({ key: "error", value: error.message });
              });
          }}
        >
          Send a link to {config.state.user.email}
        </button>
      )}
    </>
  );
}
