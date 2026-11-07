import { ArrowRight, MapPin } from "lucide-react";
import type { Site, StoryView } from "@/lib/site/views";
import { programView } from "@/lib/site/views";
import { Photo } from "./safe-image";
import { SmartLink } from "./smart-link";

const initials = (s: string) => s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export function ProgramCard({ site, program }: { site: Site; program: ReturnType<typeof programView> }) {
  const { t, locale } = site;
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-shadow hover:shadow-soft">
      <SmartLink href={`/programs/${program.slug}`} locale={locale} className="relative block aspect-[16/10]" aria-label={program.title}>
        <Photo src={program.cover} alt="" label={initials(program.title)} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
      </SmartLink>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-2xl text-brand-navy">{program.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{program.short}</p>
        <SmartLink href={`/programs/${program.slug}`} locale={locale} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-500 hover:underline">
          {t("common.learnMore")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">— {program.title}</span>
        </SmartLink>
      </div>
    </li>
  );
}

export function StoryCard({ site, story }: { site: Site; story: StoryView }) {
  const { t, locale } = site;
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-shadow hover:shadow-soft">
      <SmartLink href={`/impact-stories/${story.slug}`} locale={locale} className="relative block aspect-[16/10]" aria-label={story.title}>
        <Photo src={story.cover} alt="" label={initials(story.title)} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
      </SmartLink>
      <div className="flex flex-1 flex-col p-6">
        {story.location && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-blue-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {story.location}
          </p>
        )}
        <h3 className="font-heading text-2xl leading-snug text-brand-navy">{story.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{story.excerpt}</p>
        <SmartLink href={`/impact-stories/${story.slug}`} locale={locale} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-500 hover:underline">
          {t("common.readStory")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">— {story.title}</span>
        </SmartLink>
      </div>
    </li>
  );
}

export function Avatar({ src, name, className = "h-12 w-12" }: { src?: string; name: string; className?: string }) {
  return <Photo src={src} alt="" label={initials(name)} className={`${className} shrink-0 rounded-full`} />;
}
