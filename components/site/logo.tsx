import type { Site } from "@/lib/site/views";
import { ImgWithFallback } from "./safe-image";

/**
 * The official logo files are chosen in Admin → Logo & partners and are only ever shown as supplied
 * (proportions kept, never recoloured). While a file is missing, the organization name is shown as text.
 * "color" is for light backgrounds, "white" for dark/blue ones.
 */
export function Logo({ site, variant = "color", className = "" }: { site: Site; variant?: "color" | "white"; className?: string }) {
  const logo = site.settings.logo;
  const name = site.settings.organization.name;
  const src = variant === "white" ? logo.pathDark : logo.path;
  return (
    <ImgWithFallback
      src={src}
      alt={name}
      width={logo.width}
      height={logo.height}
      className={`h-12 w-auto max-w-[14rem] object-contain sm:h-14 ${className}`}
      fallback={<span className={`font-heading text-xl leading-tight sm:text-2xl ${variant === "white" ? "text-white" : "text-brand-navy"} ${className}`}>{name}</span>}
    />
  );
}
