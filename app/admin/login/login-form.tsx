"use client";

import { type AdminLoginState, loginAdmin } from "@/app/admin/actions";
import { useActionState } from "react";

type AdminLoginFormProps = {
  nextPath: string;
};

const initialAdminLoginState: AdminLoginState = {
  error: "",
};

export default function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAdmin,
    initialAdminLoginState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      <div>
        <label
          htmlFor="username"
          className="text-sm font-semibold text-[#35576b]"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          className="mt-2 h-12 w-full rounded-2xl border border-[#d7e3ea] bg-white px-4 text-sm font-medium text-[#17384a] outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-semibold text-[#35576b]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-2 h-12 w-full rounded-2xl border border-[#d7e3ea] bg-white px-4 text-sm font-medium text-[#17384a] outline-none"
        />
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-[#f1b6b6] bg-[#fff4f4] px-4 py-3 text-sm font-medium text-[#9d2f2f]">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-2xl bg-[#114a6c] text-sm font-bold tracking-wide text-white shadow-md disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "MEMERIKSA..." : "MASUK KE ADMIN"}
      </button>
    </form>
  );
}
