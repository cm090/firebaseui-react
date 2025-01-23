"use client"

import React from "react";
import { sendEmailVerification } from "firebase/auth"
import { useEffect, useState } from "react";

export default function VerifyEmail({ user, setAlert, redirectUrl }) {
    const [sent, setSent] = useState(false)

    return (
        <>
            <h1>Email Verification</h1>
            {!sent && <p>You'll need to verify your email to continue.</p>}
            {!sent && <button onClick={async (e) => {
                e.preventDefault();
                await sendEmailVerification(user, {
                    url: redirectUrl,
                }).then(() => {
                    setSent(true)
                    setAlert(`An email has been sent to ${user.email}`)
                })

            }}>Send a link to {user.email}</button>}
        </>
    )
}