import { CSSProperties } from "react";
import { FirebaseAuthUiConfig } from "./types";

export const defaultConfig: FirebaseAuthUiConfig = {
  callbacks: {},
  signInOptions: ["emailpassword"],
  auth: null,
  state: {},
  setState: () => {},
};

export const styles: Record<string, CSSProperties> = {
  container: {
    margin: "0 auto",
    width: "100%",
    height: "fit-content",
    borderRadius: "0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0.75rem",
    gap: "0.75rem",
  },
  alert: {
    padding: "0.25rem",
    width: "100%",
    backgroundColor: "#fefcbf", // yellow-100
    border: "1px solid #fef9c3", // yellow-200
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    borderRadius: "0.375rem",
    display: "flex",
    flexDirection: "column",
  },
  error: {
    padding: "0.25rem",
    width: "100%",
    backgroundColor: "#fed7d7", // red-100
    border: "1px solid #fecaca", // red-200
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    borderRadius: "0.375rem",
  },
  alertErrorText: { padding: "0.25rem" },
  providerButton: {
    display: "flex",
    gap: "0.75rem",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
  },
  providerButtonText: { fontSize: "0.875rem", fontWeight: "500" },
};
