import React from "react";
import { FirebaseAuthUiConfig } from "./types";
import Provider from "./Provider";

interface SignInProvidersProps {
  signInOptions: FirebaseAuthUiConfig["signInOptions"];
}

export const SignInProviders = ({ signInOptions }: SignInProvidersProps) =>
  signInOptions.map((provider) => (
    <Provider
      key={typeof provider === "string" ? provider : provider.providerName}
      {...(typeof provider === "string" ? { provider: provider } : provider)}
    />
  ));
