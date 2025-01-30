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

interface CustomErrors {
  "auth/invalid-login-credentials"?: string;
  "auth/email-already-in-use"?: string;
  "auth/invalid-email"?: string;
  "auth/invalid-phone-number"?: string;
  "auth/invalid-verification-code"?: string;
  "auth/popup-closed-by-user"?: string;
  "auth/cancelled-popup-request"?: string;
  "auth/api-key-not-valid.-please-pass-a-valid-api-key."?: string;
  "auth/invalid-credential"?: string;
  [key: string]: string;
}

export interface CustomText {
  email?: string;
  emailPlaceholder?: string;
  password?: string;
  passwordPlaceholder?: string;
  name?: string;
  namePlaceholder?: string;
  sendResetLink?: string;
  loginButton?: string;
  signInWith?: string;
  loading?: string;
  phoneNumber?: string;
  emailLink?: string;
  signInAsGuest?: string;
  signInWithEmailLink?: string;
  sendEmailLink?: string;
  cancel?: string;
  emailDirty?: string;
  resetPasswordSent?: string;
  resetPassword?: string;
  nameDirty?: string;
  signInLinkSent?: string;
  somethingWentWrong?: string;
  signingYouIn?: string;
  codeSent?: string;
  enterCode?: string;
  verifyIdentity?: string;
  verifyEmail?: string;
  sendSignInText?: string;
  countryCode?: string;
  confirmationTextWillBeSent?: string;
  finishSigningIn?: string;
  sendText?: string;
  sendALinkTo?: string;
  oneUppercase?: string;
  oneLowercase?: string;
  oneSpecial?: string;
  oneNumber?: string;
  atLeast?: string;
  characters?: string;
  and?: string;
  andContainAtLeast?: string;
  strongPasswordsHave?: string;
  newPassword?: string;
  newPasswordPlaceholder?: string;
  emailDirtyNewPassword?: string;
  skip?: string;
  errors?: CustomErrors;
  [key: Omit<string, "errors">]: string | undefined;
}

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
