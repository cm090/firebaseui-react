import {
  ConfirmationResult,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from "firebase/auth";
import { providerStyles } from "./providerStyles";
import React, { useContext, useEffect, useRef, useState } from "react";
import { translate, translateError } from "./languages";
import { ConfigContext } from "./FirebaseAuthUi";

export default function PhoneNumber() {
  const config = useContext(ConfigContext);

  //TODO: custom styles here too
  const styles = providerStyles["phonenumber"] || providerStyles["default"];
  const [phoneNumber, setPhoneNumber] = useState("");
  //TODO phone number validity
  const [phoneNumberValid, setPhoneNumberValid] = useState(false);
  const [enterCode, setEnterCode] = useState(false);
  const [code, setCode] = useState(Array(6).fill(""));
  const [countryCode, setCountryCode] = useState("+1");
  const [verificationId, setVerificationId] = useState("");
  const [name, setName] = useState("");
  const [selectedHint, setSelectedHint] = useState(0);

  const processNetworkError = (error) => {
    error = JSON.parse(JSON.stringify(error));
    if (
      error.code === 400 ||
      (error.code === "auth/network-request-failed" &&
        error?.customData?.message)
    ) {
      const message = error.customData.message;
      const sliced = message.slice(32, message.length - 2);
      error.code = sliced;
    }

    return error;
  };

  const phoneAuthProvider = new PhoneAuthProvider(config.auth);
  let recaptchaVerifier;

  useEffect(() => {
    setPhoneNumberValid(
      enterCode || config.state.mfaSignIn
        ? true
        : /^\d{3}-\d{3}-\d{4}$/.test(phoneNumber) &&
            (config.displayName == "required" ? name.length > 0 : true),
    );
  }, [phoneNumber, name]);

  const sendMfaText = function () {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(
        config.auth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      );
    }
    if (
      config.state.mfaSignIn &&
      config.state.mfaResolver &&
      recaptchaVerifier
    ) {
      const phoneInfoOptions = {
        multiFactorHint: config.state.mfaResolver.hints[selectedHint],
        session: config.state.mfaResolver.session,
      };
      try {
        phoneAuthProvider
          .verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
          .then((vId) => {
            setVerificationId(vId);
            setEnterCode(true);
          });
      } catch (error) {
        console.error(error);
        recaptchaVerifier.clear();
      }
    }
  };

  const inputRefs = Array(6).fill((() => useRef(null))());

  const handleCodeChange = (value, index) => {
    if (value !== "" && !/\d/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !code[index]) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePhoneInput = (value) => {
    let cleaned = value.replace(/\D/g, "");

    const parts = [];
    if (cleaned.length > 3) {
      parts.push(cleaned.substring(0, 3));
      cleaned = cleaned.substring(3);
    } else {
      return cleaned;
    }

    if (cleaned.length > 3) {
      parts.push(cleaned.substring(0, 3));
      cleaned = cleaned.substring(3);
    } else {
      parts.push(cleaned);
      return parts.join("-");
    }

    parts.push(cleaned.substring(0, 4));

    return parts.join("-");
  };

  const sendCode = async function () {
    try {
      if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier(
          config.auth,
          "recaptcha-container",
          {
            size: "invisible",
          },
        );
      }
      if (
        !phoneNumber ||
        phoneNumber.length < 12 ||
        !phoneNumberValid ||
        !recaptchaVerifier
      )
        return;
      const formattedNumber = countryCode + " " + phoneNumber;
      await signInWithPhoneNumber(
        config.auth,
        formattedNumber,
        recaptchaVerifier,
      ).then((confirmationResult) => {
        config.setState({
          key: "alert",
          value: `${translate("codeSent", config.language, config.customText)} ${phoneNumber}.`,
        });
        (
          window as typeof window & { confirmationResult: ConfirmationResult }
        ).confirmationResult = confirmationResult;
        setEnterCode(true);
      });
    } catch (error) {
      config.setState({
        key: "error",
        value: translateError(
          processNetworkError(error).code,
          config.language,
          config.customText,
        ),
      });
    }
  };

  const signInWithCode = async function () {
    try {
      const formattedCode = code.join("");

      await (
        window as typeof window & { confirmationResult: ConfirmationResult }
      ).confirmationResult
        .confirm(formattedCode)
        .then(() => {
          //TODO restructure to get user credential
          if (name.length > 0) {
            updateProfile(config.auth.currentUser, { displayName: name });
          }
          config.setState({ key: "sendSMS", value: false });
        });
    } catch (err) {
      const error = processNetworkError(err);
      config.setState({
        key: "error",
        value: translateError(error.code, config.language, config.customText),
      });
      if (typeof config.callbacks.signInFailure === "function") {
        config.callbacks.signInFailure(error);
      }
    }
  };

  const handleButtonPress = function () {
    //TODO verify code!
    if (config.state.mfaSignIn && enterCode) {
      const formattedCode = code.join("");
      const cred = PhoneAuthProvider.credential(verificationId, formattedCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      try {
        config.state.mfaResolver
          .resolveSignIn(multiFactorAssertion)
          .then((userCred) => {
            if (config.callbacks.signInSuccessWithAuthResult) {
              config.setState({ key: "sendSMS", value: false });
              config.setState({ key: "mfaResolver", value: null });
              config.setState({ key: "mfaSignIn", value: false });
              config.callbacks.signInSuccessWithAuthResult(userCred);
            }
          });
      } catch (err) {
        const error = processNetworkError(err);
        config.setState({
          key: "error",
          value: translateError(error.code, config.language, config.customText),
        });
        if (typeof config.callbacks.signInFailure === "function") {
          config.callbacks.signInFailure(error);
        }
      }
    } else if (config.state.mfaSignIn) {
      sendMfaText();
    } else {
      if (enterCode) {
        signInWithCode();
      } else {
        sendCode();
      }
    }
  };

  return (
    <>
      <h1
        style={{
          fontWeight: "600",
          fontSize: "1.125rem",
          marginBottom: "0.5rem",
        }}
      >
        {enterCode
          ? translate("enterCode", config.language, config.customText)
          : config.state.mfaSignIn
            ? translate("verifyIdentity", config.language, config.customText)
            : translate("sendSignInText", config.language, config.customText)}
      </h1>

      {!enterCode && !config.state.mfaSignIn && (
        <form
          style={{
            width: "80%",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#1a202c",
                  ...config.formLabelStyles,
                }}
              >
                {translate("countryCode", config.language, config.customText)}
                <span style={{ color: "#FF0000" }}> *</span>
              </label>
              <button
                onClick={() =>
                  config.setState({ key: "sendSMS", value: false })
                }
                style={{
                  fontSize: "0.875rem",
                  color: "#2b6cb0",
                  border: "none",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  ...config.formSmallButtonStyles,
                }}
              >
                {translate("cancel", config.language, config.customText)}
              </button>
            </div>
            <select
              autoComplete="tel-country-code"
              name="countrycode"
              id="countrycode"
              style={{
                border: "1px solid #e2e8f0", // gray-300
                borderRadius: "0.375rem",
                padding: "0.5rem 0.75rem",
                width: "100%",
              }}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="+1">🇺🇸 United States +1</option>
              <option value="+358">🇦🇽 Aland Islands +358</option>
              <option value="+213">🇩🇿 Algeria +213</option>
              <option value="+244">🇦🇴 Angola +244</option>
              <option value="+1264">🇦🇮 Anguilla +1264</option>
              <option value="+61">🇦🇺 Australia +61</option>
              <option value="+43">🇦🇹 Austria +43</option>
              <option value="+1">🇧🇸 Bahamas +1</option>
              <option value="+973">🇧🇭 Bahrain +973</option>
              <option value="+880">🇧🇩 Bangladesh +880</option>
              <option value="+375">🇧🇾 Belarus +375</option>
              <option value="+32">🇧🇪 Belgium +32</option>
              <option value="+229">🇧🇯 Benin +229</option>
              <option value="+591">🇧🇴 Bolivia +591</option>
              <option value="+387">🇧🇦 Bosnia and Herzegovina +387</option>
              <option value="+673">🇧🇳 Brunei +673</option>
              <option value="+359">🇧🇬 Bulgaria +359</option>
              <option value="+257">🇧🇮 Burundi +257</option>
              <option value="+855">🇰🇭 Cambodia +855</option>
              <option value="+1">🇨🇦 Canada +1</option>
              <option value="+238">🇨🇻 Cape Verde +238</option>
              <option value="+1345">🇰🇾 Cayman Islands +1345</option>
              <option value="+61">🇨🇽 Christmas Island +61</option>
              <option value="+61">🇨🇨 Cocos +61</option>
              <option value="+243">🇨🇩 Congo, Dem Rep +243</option>
              <option value="+385">🇭🇷 Croatia +385</option>
              <option value="+357">🇨🇾 Cyprus +357</option>
              <option value="+420">🇨🇿 Czech Republic +420</option>
              <option value="+45">🇩🇰 Denmark +45</option>
              <option value="+1767">🇩🇲 Dominica +1767</option>
              <option value="+1">🇩🇴 Dominican Republic +1</option>
              <option value="+593">🇪🇨 Ecuador +593</option>
              <option value="+240">🇬🇶 Equatorial Guinea +240</option>
              <option value="+372">🇪🇪 Estonia +372</option>
              <option value="+358">🇫🇮 Finland/Aland Islands +358</option>
              <option value="+33">🇫🇷 France +33</option>
              <option value="+220">🇬🇲 Gambia +220</option>
              <option value="+995">🇬🇪 Georgia +995</option>
              <option value="+49">🇩🇪 Germany +49</option>
              <option value="+233">🇬🇭 Ghana +233</option>
              <option value="+350">🇬🇮 Gibraltar +350</option>
              <option value="+30">🇬🇷 Greece +30</option>
              <option value="+502">🇬🇹 Guatemala +502</option>
              <option value="+592">🇬🇾 Guyana +592</option>
              <option value="+36">🇭🇺 Hungary +36</option>
              <option value="+354">🇮🇸 Iceland +354</option>
              <option value="+62">🇮🇩 Indonesia +62</option>
              <option value="+91">🇮🇳 India +91</option>
              <option value="+353">🇮🇪 Ireland +353</option>
              <option value="+972">🇮🇱 Israel +972</option>
              <option value="+39">🇮🇹 Italy +39</option>
              <option value="+225">🇨🇮 Ivory Coast +225</option>
              <option value="+1876">🇯🇲 Jamaica +1876</option>
              <option value="+81">🇯🇵 Japan +81</option>
              <option value="+962">🇯🇴 Jordan +962</option>
              <option value="+7">🇰🇿 Kazakhstan +7</option>
              <option value="+965">🇰🇼 Kuwait +965</option>
              <option value="+371">🇱🇻 Latvia +371</option>
              <option value="+218">🇱🇾 Libya +218</option>
              <option value="+423">🇱🇮 Liechtenstein +423</option>
              <option value="+370">🇱🇹 Lithuania +370</option>
              <option value="+352">🇱🇺 Luxembourg +352</option>
              <option value="+261">🇲🇬 Madagascar +261</option>
              <option value="+265">🇲🇼 Malawi +265</option>
              <option value="+60">🇲🇾 Malaysia +60</option>
              <option value="+960">🇲🇻 Maldives +960</option>
              <option value="+223">🇲🇱 Mali +223</option>
              <option value="+356">🇲🇹 Malta +356</option>
              <option value="+230">🇲🇺 Mauritius +230</option>
              <option value="+52">🇲🇽 Mexico +52</option>
              <option value="+377">🇲🇨 Monaco +377</option>
              <option value="+382">🇲🇪 Montenegro +382</option>
              <option value="+1664">🇲🇸 Montserrat +1664</option>
              <option value="+258">🇲🇿 Mozambique +258</option>
              <option value="+264">🇳🇦 Namibia +264</option>
              <option value="+31">🇳🇱 Netherlands +31</option>
              <option value="+599">🇳🇱 Netherlands Antilles +599</option>
              <option value="+64">🇳🇿 New Zealand +64</option>
              <option value="+234">🇳🇬 Nigeria +234</option>
              <option value="+47">🇳🇴 Norway +47</option>
              <option value="+63">🇵🇭 Philippines +63</option>
              <option value="+48">🇵🇱 Poland +48</option>
              <option value="+351">🇵🇹 Portugal +351</option>
              <option value="+974">🇶🇦 Qatar +974</option>
              <option value="+40">🇷🇴 Romania +40</option>
              <option value="+250">🇷🇼 Rwanda +250</option>
              <option value="+221">🇸🇳 Senegal +221</option>
              <option value="+381">🇷🇸 Serbia +381</option>
              <option value="+248">🇸🇨 Seychelles +248</option>
              <option value="+65">🇸🇬 Singapore +65</option>
              <option value="+421">🇸🇰 Slovakia +421</option>
              <option value="+386">🇸🇮 Slovenia +386</option>
              <option value="+27">🇿🇦 South Africa +27</option>
              <option value="+82">🇰🇷 South Korea +82</option>
              <option value="+34">🇪🇸 Spain +34</option>
              <option value="+94">🇱🇰 Sri Lanka +94</option>
              <option value="+1758">🇱🇨 St Lucia +1758</option>
              <option value="+249">🇸🇩 Sudan +249</option>
              <option value="+46">🇸🇪 Sweden +46</option>
              <option value="+41">🇨🇭 Switzerland +41</option>
              <option value="+886">🇹🇼 Taiwan +886</option>
              <option value="+255">🇹🇿 Tanzania +255</option>
              <option value="+228">🇹🇬 Togo +228</option>
              <option value="+1868">🇹🇹 Trinidad and Tobago +1868</option>
              <option value="+1649">🇹🇨 Turks and Caicos Islands +1649</option>
              <option value="+256">🇺🇬 Uganda +256</option>
              <option value="+971">🇦🇪 United Arab Emirates +971</option>
              <option value="+44">🇬🇧 United Kingdom +44</option>
              <option value="+1">🇺🇸 United States +1</option>
              <option value="+998">🇺🇿 Uzbekistan +998</option>
              <option value="+58">🇻🇪 Venezuela +58</option>
            </select>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#1a202c",
                ...config.formLabelStyles,
              }}
            >
              {translate("phoneNumber", config.language, config.customText)}
              <span style={{ color: "#FF0000" }}> *</span>
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(handlePhoneInput(e.target.value))
                }
                placeholder="555-555-5555"
                style={{
                  border: "1px solid #e2e8f0", // gray-300
                  borderRadius: "0.375rem",
                  padding: "0.5rem 0.75rem",
                  width: "100%",
                  ...config.formInputStyles,
                }}
              />
            </div>

            {config.displayName && (
              <div style={{ marginTop: "0.25rem" }}>
                {config.displayName == "required" ? (
                  <label
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#1a202c",
                      ...config.formLabelStyles,
                    }}
                    htmlFor="name"
                  >
                    {translate("name", config.language, config.customText)}
                    <span style={{ color: "#FF0000" }}> *</span>
                  </label>
                ) : (
                  <label style={config.formLabelStyles} htmlFor="name">
                    {translate("name", config.language, config.customText)}
                  </label>
                )}
                <input
                  id="name"
                  type="text"
                  value={name}
                  placeholder={translate(
                    "namePlaceholder",
                    config.language,
                    config.customText,
                  )}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    border: "1px solid #e2e8f0", // gray-300
                    borderRadius: "0.375rem",
                    padding: "0.5rem 0.25rem",
                    width: "100%",
                    marginBottom: "0.25rem",
                    ...config.formInputStyles,
                  }}
                />
              </div>
            )}
          </div>
        </form>
      )}

      {!enterCode && config.state.mfaSignIn && (
        <div>
          <select
            value={selectedHint}
            onChange={(e) => setSelectedHint(parseInt(e.target.value))}
            style={{
              border: "1px solid #e2e8f0", // gray-300
              borderRadius: "0.375rem",
              padding: "0.5rem 0.75rem",
              width: "100%",
            }}
          >
            {config.state.mfaResolver?.hints.map((hint, index) => (
              <option value={index} key={index}>
                xxx-xxx-{hint.displayName?.slice(-4)}
              </option>
            ))}
          </select>
          <p>
            {translate(
              "confirmationTextWillBeSent",
              config.language,
              config.customText,
            )}{" "}
            {config.state.mfaResolver?.hints[selectedHint]?.displayName?.slice(
              -4,
            )}
          </p>
        </div>
      )}
      {enterCode && (
        <>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "end",
            }}
          >
            <button
              onClick={() => config.setState({ key: "sendSMS", value: false })}
              style={{
                fontSize: "0.875rem",
                color: "#2b6cb0",
                border: "none",
                backgroundColor: "#fff",
                cursor: "pointer",
                ...config.formSmallButtonStyles,
              }}
            >
              {translate("cancel", config.language, config.customText)}
            </button>
          </div>
          <form style={{ display: "flex", gap: "0.5rem" }}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(e.target.value, index)}
                onKeyDown={(e) => handleBackspace(e, index)}
                style={{
                  border: "1px solid #e2e8f0", // gray-300
                  borderRadius: "0.375rem",
                  padding: "0.5rem 0.75rem",
                  width: "2.5rem", // Equivalent to w-10
                }}
              />
            ))}
          </form>
        </>
      )}
      <div id="recaptcha-container"></div>
      <button
        id="sign-in-button"
        onClick={handleButtonPress}
        style={{
          color: "white",
          fontWeight: "600",
          marginTop: "1.25rem",
          width: "100%",
          height: "2.25rem",
          alignItems: "center",
          transition: "background-color 150ms",
          backgroundColor: phoneNumberValid ? "#60a5fa" : "#9ca3af", // bg-blue-400 for valid, bg-gray-400 for invalid
          cursor: phoneNumberValid ? "pointer" : "default", // cursor changes based on form validity
          ...(phoneNumberValid
            ? { ":hover": { backgroundColor: "#3b82f6" } }
            : {}), // hover effect for valid form
          display: "flex",
          gap: "0.75rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "0.375rem",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          justifyContent: "center",
          border: "none",
          ...config.formButtonStyles,
          ...(phoneNumberValid ? {} : config.formDisabledStyles),
        }}
      >
        <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
          {enterCode
            ? translate("finishSigningIn", config.language, config.customText)
            : translate("sendText", config.language, config.customText)}
        </span>
      </button>
    </>
  );
}
