import type { AuthState } from "@/stores/auth.store";
import { DEMO_USER } from "@/lib/auth/demo-user";

/** Line up Zustand with the demo session after NextAuth sign-in (easy to replace with API tokens later). */
export function syncDemoSessionToStore(login: AuthState["login"]) {
  login(
    {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      headline: "CareerOS demo session",
      linkedinConnected: DEMO_USER.linkedinConnected,
    },
    "demo-access-token",
    "demo-refresh-token"
  );
}
