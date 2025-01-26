import type { CSSProperties } from "react";

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
}

interface AuthCallbacks {
    signInSuccessWithAuthResult?: (authResult: any) => boolean;
    signInFailure?: (error: Error) => boolean;
}

interface PasswordSpecs { }

interface CustomErrors { }

interface CustomText { }

export interface SignInOption {
    provider: string;
    signInFlow?: "popup" | "redirect";
    scopes?: string[];
    customParameters?: { [key: string]: string };
    providerName?: string;
    fullLabel?: string;
    authType?: string;
    customStyles?: CSSProperties;
    icon?: string;
    jsx?: JSX.Element;
}