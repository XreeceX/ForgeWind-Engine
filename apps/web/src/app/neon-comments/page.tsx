import { neon } from "@neondatabase/serverless";

/**
 * Neon + Next.js App Router demo (Server Action → Postgres).
 * Create the table in the Neon SQL Editor first:
 *
 * CREATE TABLE IF NOT EXISTS comments (comment TEXT);
 *
 * Open: http://localhost:3000/neon-comments (public route; no login required)
 */
export default function NeonCommentsPage() {
  async function create(formData: FormData) {
    "use server";

    const databaseUrl =
      process.env.DATABASE_URL?.trim() || process.env.STORAGE_URL?.trim();
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL or STORAGE_URL is not set. Run `vercel env pull .env.development.local`, or add one of them to `.env.local` (Vercel Neon Storage with prefix STORAGE sets STORAGE_URL).",
      );
    }

    const raw = formData.get("comment");
    if (typeof raw !== "string" || !raw.trim()) {
      throw new Error("Please enter a comment.");
    }
    const comment = raw.trim();

    const sql = neon(databaseUrl);
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6 py-16 text-foreground">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Neon comments</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Demo from the Neon + Next.js guide. Ensure the{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
            comments
          </code>{" "}
          table exists in your Neon project, and{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
            DATABASE_URL
          </code>{" "}
          is loaded (e.g.{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
            vercel env pull .env.development.local
          </code>
          ).
        </p>
      </div>

      <form action={create} className="flex flex-col gap-3">
        <label className="text-sm font-medium" htmlFor="comment">
          Comment
        </label>
        <input
          id="comment"
          name="comment"
          type="text"
          placeholder="Write a comment"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-950"
          autoComplete="off"
          required
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
