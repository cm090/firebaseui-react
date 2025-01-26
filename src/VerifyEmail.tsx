"use client";

import React, { Dispatch, SetStateAction } from "react";
import { sendEmailVerification, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { FirebaseAuthUiConfig } from "./types";

interface VerifyEmailProps {
  user: User;
  setAlert: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
  language: FirebaseAuthUiConfig["language"];
  customText: FirebaseAuthUiConfig["customText"];
}

export default function VerifyEmail({
  user,
  setAlert,
  setError,
  language,
  customText,
}: VerifyEmailProps) {
  const [verified, setVerified] = useState(user?.emailVerified);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (user) {
      setVerified(user.emailVerified);
    }
  }, [user]);

  if (verified) {
    return (
      <>
        <h1>Email Verified</h1>
        <p>Your email has been verified.</p>
      </>
    );
  }

  return (
    <>
      <h1>Email Verification</h1>
      {!sent && <p>You&apos;ll need to verify your email to continue.</p>}
      {!sent && (
        <button
          onClick={async (e) => {
            e.preventDefault();
            await sendEmailVerification(user)
              .then(() => {
                setSent(true);
                setAlert(`An email has been sent to ${user.email}`);
              })
              .catch((error) => {
                setError(error.message);
              });
          }}
        >
          Send a link to {user.email}
        </button>
      )}
    </>
  );
}
