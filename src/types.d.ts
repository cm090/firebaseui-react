declare module 'firebaseui-react' {
    import type { Auth, UserCredential } from 'firebase/auth';
    import type { ComponentType } from 'react';

    interface FirebaseUIReactProps {
        auth: Auth;
        config: {
            callbacks: {
                signInFailure?: (error?: Error) => void;
                signInSuccessWithAuthResult?: (UserCredential: UserCredential) => void;
            };
            continueUrl?: string;
            customText?: object;
            displayName?: string;
            formButtonStyles?: object;
            formDisabledStyles?: object;
            formInputStyles?: object;
            formLabelStyles?: object;
            formSmallButtonStyles?: object;
            passwordSpecs?: {
                containsLowercase?: boolean;
                containsNumber?: boolean;
                containsSpecialCharacter?: boolean;
                containsUppercase?: boolean;
                minCharacters?: number;
            };
            requireVerifyEmail?: boolean;
            signInOptions: (boolean | object | string)[];
        };
    }

    declare const FirebaseUI: ComponentType<FirebaseUIReactProps>;
    export default FirebaseUI;
}
