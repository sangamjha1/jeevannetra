"use client";

import { CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface PasswordValidatorProps {
  password: string;
  confirmPassword?: string;
  showValidation?: boolean;
}

export function PasswordValidator({
  password,
  confirmPassword,
  showValidation = true,
}: PasswordValidatorProps) {
  const [validation, setValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasLowercase: false,
    passwordsMatch: true,
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const passwordsMatch =
      !confirmPassword || password === confirmPassword;

    const allValid =
      minLength && hasUppercase && hasNumber && hasLowercase && passwordsMatch;

    setValidation({
      minLength,
      hasUppercase,
      hasNumber,
      hasLowercase,
      passwordsMatch,
    });

    setIsValid(allValid);
  }, [password, confirmPassword]);

  if (!showValidation) return null;

  const requirements = [
    { label: "At least 8 characters", met: validation.minLength },
    { label: "One uppercase letter", met: validation.hasUppercase },
    { label: "One lowercase letter", met: validation.hasLowercase },
    { label: "One number", met: validation.hasNumber },
  ];

  return (
    <div className="space-y-2 p-3 rounded-md bg-slate-900/40 border border-slate-700">
      {requirements.map((req, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          {req.met ? (
            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-slate-500 flex-shrink-0" />
          )}
          <span
            className={
              req.met ? "text-green-400" : "text-slate-400"
            }
          >
            {req.label}
          </span>
        </div>
      ))}

      {confirmPassword !== undefined && (
        <div className="pt-2 border-t border-slate-700 mt-2">
          <div className="flex items-center gap-2 text-sm">
            {validation.passwordsMatch ? (
              <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            )}
            <span
              className={
                validation.passwordsMatch
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              Passwords match
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
