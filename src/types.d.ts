import { Auth, MultiFactorResolver, User, UserCredential } from "firebase/auth";
import type { CSSProperties, Dispatch, SetStateAction } from "react";

export interface FirebaseAuthUiConfig {
  requireVerifyEmail?: boolean;
  containerStyles?: CSSProperties;
  callbacks: AuthCallbacks;
  passwordSpecs?: PasswordSpecs;
  formButtonStyles?: CSSProperties;
  formDisabledStyles?: CSSProperties;
  formInputStyles?: CSSProperties;
  formLabelStyles?: CSSProperties;
  formSmallButtonStyles?: CSSProperties;
  customErrors?: CustomErrors;
  language?: string;
  customText?: CustomText;
  signInOptions: (string | SignInOption)[];
  continueUrl?: string;
  displayName?: string;
  auth: Auth;
  state: FirebaseAuthUiState;
  setState: Dispatch<{
    key: string;
    value: SetStateAction<
      FirebaseAuthUiConfig["state"][keyof FirebaseAuthUiConfig["state"]]
    >;
  }>;
}

interface AuthCallbacks {
  signInSuccessWithAuthResult: (authResult: UserCredential) => void;
  signInFailure: (error: Error) => void;
}

interface PasswordSpecs {
  minCharacters?: number;
  containsUppercase?: boolean;
  containsLowercase?: boolean;
  containsNumber?: boolean;
  containsSpecialCharacter?: boolean;
}

type CustomErrors = object;

type CustomText = object;

export interface SignInOption {
  provider: string;
  signInFlow?: "popup" | "redirect";
  scopes?: string[];
  customParameters?: { [key: string]: string };
  providerName?: string;
  fullLabel?: string;
  authType?: "signUp" | "signIn" | "both";
  customStyles?: CSSProperties;
  icon?: string;
  jsx?: JSX.Element;
}

export interface FirebaseAuthUiState {
  emailLinkOpen?: boolean;
  sendSMS?: boolean;
  verify?: boolean;
  mfaSignIn?: boolean;
  mfaResolver?: MultiFactorResolver;
  alert?: string;
  error?: string;
  user?: User;
}
