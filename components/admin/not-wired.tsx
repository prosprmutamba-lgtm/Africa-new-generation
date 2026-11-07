import { WIRED, type WiringKey } from "@/lib/cms/wiring";

/** Honest status banner: shown while a saved setting is not yet read by the public site. */
export function NotWiredNotice({ feature, what }: { feature: WiringKey; what: string }) {
  if (WIRED[feature]) return null;
  return (
    <div role="note" className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">Saved here, but not shown on the public site yet</p>
      <p className="mt-0.5">
        Your changes to {what} are stored safely, but the website pages do not read them yet. A developer needs to connect this part once
        (see <code>docs/ADMIN_WIRING.md</code>). Nothing you enter here is lost in the meantime.
      </p>
    </div>
  );
}
