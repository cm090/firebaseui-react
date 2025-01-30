import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  UserCredential,
} from "firebase/auth";

// in your app, use this import instead:
// import FirebaseUI from "react-firebaseui";
import { FirebaseAuthUi } from "../../src/FirebaseAuthUi";
import firebaseConfig from "./firebaseConfig.json";

initializeApp(firebaseConfig);
const auth = getAuth();

export default function Home() {
  const UIConfig = {
    continueUrl: "http://localhost:8080",
    // requireVerifyEmail: true,
    callbacks: {
      signInSuccessWithAuthResult: function (user: UserCredential) {
        console.log("successfully authenticated", user);
      },
      signInFailure: function (error: Error) {
        console.log("somtin went wrong :9 :((");
        console.error(error);
      },
    },
    passwordSpecs: { minCharacters: 6 },
    signInOptions: [
      {
        provider: "emailpassword",
      },
      {
        provider: "jsx",
        jsx: <h1>Custom JSX</h1>,
      },
      {
        provider: "google.com",
        customParameters: { prompt: "select_account" },
      },
      "apple.com",
      "microsoft.com",
      "yahoo.com",
      "github.com",
      "x.com",
      "phonenumber",
      "facebook.com",
      {
        provider: "emaillink",
      },
      "anonymous",
    ],

    // formSmallButtonStyles: { backgroundColor: "red" },
    // formDisabledStyles: { backgroundColor: "yellow" },
    // formInputStyles: { backgroundColor: "#ebebeb" }
    customText: {
      signInWith: "yo mama use",
      errors: {
        "auth/too-many-requests": "please stop doing that",
        "auth/invalid-credential": "you're not allowed to do that",
      },
    },
  };

  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <main>
      <h1>React FirebaseUI Component Demo</h1>
      <div style={{ width: "90%", margin: "auto" }}>
        <FirebaseAuthUi auth={auth} config={UIConfig} />
      </div>
      {user && (
        <div>
          <pre>{JSON.stringify({ user }, null, 2)}</pre>
          <button onClick={() => signOut(auth)}>Sign Out</button>
        </div>
      )}
    </main>
  );
}
