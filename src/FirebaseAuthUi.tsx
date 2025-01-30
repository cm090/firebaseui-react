import React, { createContext, SetStateAction, useReducer } from "react";
import { type Auth } from "firebase/auth";
import type { FirebaseAuthUiConfig, FirebaseAuthUiState } from "./types";
import { defaultConfig } from "./defaults";
import { FirebaseAuthForm } from "./FirebaseAuthForm";

interface FirebaseAuthUiProps {
  auth: Auth;
  config?: Omit<FirebaseAuthUiConfig, "auth" | "state" | "setState">;
}

export const ConfigContext = createContext<FirebaseAuthUiConfig>(defaultConfig);

const handleState = (
  state: FirebaseAuthUiState,
  action: {
    key: string;
    value: SetStateAction<FirebaseAuthUiState[keyof FirebaseAuthUiState]>;
  },
) => ({ ...state, [action.key]: action.value });

export const FirebaseAuthUi = ({ auth, config }: FirebaseAuthUiProps) => {
  const [state, setState] = useReducer(handleState, defaultConfig.state);

  return (
    <ConfigContext.Provider value={{ auth, state, setState, ...config }}>
      <FirebaseAuthForm />
    </ConfigContext.Provider>
  );
};
