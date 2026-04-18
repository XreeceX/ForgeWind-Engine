import { redirect } from "next/navigation";

/** Registration is disabled; ForgeWind uses a single development credentials sign-in. */
export default function SignupPage() {
  redirect("/login");
}
