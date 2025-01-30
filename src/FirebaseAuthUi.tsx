import React, { createContext, SetStateAction, useReducer } from "react";
import { type Auth } from "firebase/auth";
import type { FirebaseAuthUiConfig, FirebaseAuthUiState } from "./types";
import { defaultConfig } from "./defaults";
import { FirebaseAuthForm } from "./FirebaseAuthForm";

interface FirebaseAuthUiProps {
  auth: Auth;
  config: Omit<FirebaseAuthUiConfig, "auth" | "state" | "setState">;
}

export const ConfigContext = createContext<FirebaseAuthUiConfig>({
  ...defaultConfig,
  auth: null as unknown as Auth,
  state: {} as FirebaseAuthUiState,
  setState: () => {},
});

const handleState = (
  state: FirebaseAuthUiState,
  action: {
    key: string;
    value: SetStateAction<FirebaseAuthUiState[keyof FirebaseAuthUiState]>;
  },
) => ({ ...state, [action.key]: action.value });

export const FirebaseAuthUi = ({ auth, config }: FirebaseAuthUiProps) => {
  const [state, setState] = useReducer(
    handleState,
    {} satisfies FirebaseAuthUiState,
  );

  return (
    <ConfigContext.Provider value={{ auth, state, setState, ...config }}>
      <FirebaseAuthForm />
    </ConfigContext.Provider>
  );
};
