/**
 * Page-builder block catalogue. PURE (no Node imports): shared by the server
 * (validation, completeness), the admin editor (which builds its forms from these
 * specs) and the public renderer.
 *
 * Model: a block is  { id, type, data: { en: Data, fr: Data } }.
 * Both languages always have the SAME structure (same fields, same list items in
 * the same order). Fields marked `translatable: false` (images, links, numbers…)
 * are "shared": the server copies the English value to French, so they can never
 * drift apart. Translatable fields are edited per language, and a page is only
 * shown in a language once all its required texts exist in that language.
 */

export const PAGE_LOCALES = ["en", "fr"] as const;
export type PageLocale = (typeof PAGE_LOCALES)[number];

export type FieldKind = "text" | "textarea" | "select" | "image" | "href" | "toggle" | "number";

export interface FieldSpec {
  key: string;
  label: string;
  kind: FieldKind;
  /** false = shared by both languages (one value, copied EN → FR) */
  translatable: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  max?: number;
  hint?: string;
  hidden?: boolean;
  default?: string | number | boolean;
}

export interface ListSpec {
  label: string;
  itemLabel: string;
  fields: FieldSpec[];
  min: number;
  max: number;
}

export interface BlockSpec {
  type: BlockType;
  label: string;
  description: string;
  fields: FieldSpec[];
  list?: ListSpec;
}

export const BLOCK_TYPES = ["heading", "text", "image", "buttons", "cards", "stats", "testimonials", "faq", "cta"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

const align = (def = "left"): FieldSpec => ({
  key: "align",
  label: "Alignment",
  kind: "select",
  translatable: false,
  default: def,
  options: [
    { value: "left", label: "Left" },
    { value: "center", label: "Centred" },
  ],
});

export const BLOCK_SPECS: Record<BlockType, BlockSpec> = {
  heading: {
    type: "heading",
    label: "Heading",
    description: "A title or subtitle that structures the page.",
    fields: [
      { key: "text", label: "Heading text", kind: "text", translatable: true, required: true, max: 200 },
      {
        key: "level",
        label: "Size",
        kind: "select",
        translatable: false,
        default: "h2",
        options: [
          { value: "h2", label: "Title (large)" },
          { value: "h3", label: "Subtitle (smaller)" },
        ],
      },
      align(),
    ],
  },
  text: {
    type: "text",
    label: "Text",
    description: "One or more paragraphs.",
    fields: [{ key: "body", label: "Text", kind: "textarea", translatable: true, required: true, max: 10000, hint: "Leave an empty line between paragraphs." }],
  },
  image: {
    type: "image",
    label: "Image",
    description: "A picture with a description and an optional caption.",
    fields: [
      { key: "src", label: "Image", kind: "image", translatable: false, required: true },
      { key: "alt", label: "Description (for screen readers)", kind: "text", translatable: true, required: true, max: 200, hint: "Say what the picture shows." },
      { key: "caption", label: "Caption (optional)", kind: "text", translatable: true, max: 300 },
      {
        key: "size",
        label: "Width",
        kind: "select",
        translatable: false,
        default: "wide",
        options: [
          { value: "narrow", label: "Narrow" },
          { value: "wide", label: "Wide" },
          { value: "full", label: "Full width" },
        ],
      },
      { key: "width", label: "Width px", kind: "number", translatable: false, hidden: true },
      { key: "height", label: "Height px", kind: "number", translatable: false, hidden: true },
    ],
  },
  buttons: {
    type: "buttons",
    label: "Buttons / links",
    description: "One or more buttons that lead to a page or a website.",
    fields: [align()],
    list: {
      label: "Buttons",
      itemLabel: "Button",
      min: 1,
      max: 6,
      fields: [
        { key: "label", label: "Button text", kind: "text", translatable: true, required: true, max: 60 },
        { key: "href", label: "Links to", kind: "href", translatable: false, required: true, hint: "A site page such as /contact, or a full https:// link." },
        {
          key: "style",
          label: "Look",
          kind: "select",
          translatable: false,
          default: "primary",
          options: [
            { value: "primary", label: "Solid blue" },
            { value: "secondary", label: "Solid yellow" },
            { value: "outline", label: "Outline" },
          ],
        },
        { key: "newTab", label: "Open in a new tab", kind: "toggle", translatable: false, default: false },
      ],
    },
  },
  cards: {
    type: "cards",
    label: "Cards",
    description: "A grid of cards, each with an image, a title, a short text and an optional link.",
    fields: [
      { key: "title", label: "Section title (optional)", kind: "text", translatable: true, max: 200 },
      {
        key: "columns",
        label: "Cards per row",
        kind: "select",
        translatable: false,
        default: "3",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
    ],
    list: {
      label: "Cards",
      itemLabel: "Card",
      min: 1,
      max: 12,
      fields: [
        { key: "image", label: "Image (optional)", kind: "image", translatable: false },
        { key: "title", label: "Card title", kind: "text", translatable: true, required: true, max: 120 },
        { key: "text", label: "Short text (optional)", kind: "textarea", translatable: true, max: 600 },
        { key: "linkLabel", label: "Link text (optional)", kind: "text", translatable: true, max: 60 },
        { key: "href", label: "Link to (optional)", kind: "href", translatable: false },
      ],
    },
  },
  stats: {
    type: "stats",
    label: "Key figures",
    description: "Large numbers with a label. Enter only figures you can stand behind.",
    fields: [{ key: "title", label: "Section title (optional)", kind: "text", translatable: true, max: 200 }],
    list: {
      label: "Figures",
      itemLabel: "Figure",
      min: 1,
      max: 8,
      fields: [
        { key: "value", label: "Number", kind: "text", translatable: false, required: true, max: 20, hint: "e.g. 1,200 or 85%" },
        { key: "label", label: "Label", kind: "text", translatable: true, required: true, max: 100 },
      ],
    },
  },
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    description: "Quotes from real people, with their name and role.",
    fields: [{ key: "title", label: "Section title (optional)", kind: "text", translatable: true, max: 200 }],
    list: {
      label: "Testimonials",
      itemLabel: "Testimonial",
      min: 1,
      max: 8,
      fields: [
        { key: "quote", label: "Quote", kind: "textarea", translatable: true, required: true, max: 600 },
        { key: "name", label: "Name", kind: "text", translatable: false, required: true, max: 100 },
        { key: "role", label: "Role / place (optional)", kind: "text", translatable: true, max: 100 },
        { key: "photo", label: "Photo (optional)", kind: "image", translatable: false },
      ],
    },
  },
  faq: {
    type: "faq",
    label: "FAQ",
    description: "Questions that open to show their answer.",
    fields: [{ key: "title", label: "Section title (optional)", kind: "text", translatable: true, max: 200 }],
    list: {
      label: "Questions",
      itemLabel: "Question",
      min: 1,
      max: 20,
      fields: [
        { key: "question", label: "Question", kind: "text", translatable: true, required: true, max: 200 },
        { key: "answer", label: "Answer", kind: "textarea", translatable: true, required: true, max: 2000 },
      ],
    },
  },
  cta: {
    type: "cta",
    label: "Call to action",
    description: "A coloured banner with a message and one button.",
    fields: [
      { key: "heading", label: "Heading", kind: "text", translatable: true, required: true, max: 200 },
      { key: "text", label: "Text (optional)", kind: "textarea", translatable: true, max: 600 },
      { key: "buttonLabel", label: "Button text", kind: "text", translatable: true, required: true, max: 60 },
      { key: "buttonHref", label: "Button links to", kind: "href", translatable: false, required: true },
      {
        key: "tone",
        label: "Colour",
        kind: "select",
        translatable: false,
        default: "blue",
        options: [
          { value: "blue", label: "Blue" },
          { value: "dark", label: "Dark (anthracite)" },
          { value: "yellow", label: "Yellow" },
        ],
      },
    ],
  },
};

/* ───────────────────────── types ───────────────────────── */

export type Scalar = string | number | boolean;
export interface BlockItem {
  id: string;
  [k: string]: Scalar;
}
export interface BlockData {
  [k: string]: Scalar | BlockItem[];
}
export interface Block {
  id: string;
  type: BlockType;
  data: Record<PageLocale, BlockData>;
}

/* ───────────────────────── creation ───────────────────────── */

const defaultOf = (f: FieldSpec): Scalar => (f.default !== undefined ? f.default : f.kind === "toggle" ? false : f.kind === "number" ? 0 : "");

export function emptyItem(spec: ListSpec, id: string): BlockItem {
  const item: BlockItem = { id };
  for (const f of spec.fields) item[f.key] = defaultOf(f);
  return item;
}

export function newBlock(type: BlockType, id: string, itemId: () => string): Block {
  const spec = BLOCK_SPECS[type];
  const mk = (): BlockData => {
    const d: BlockData = {};
    for (const f of spec.fields) d[f.key] = defaultOf(f);
    return d;
  };
  const en = mk();
  const fr = mk();
  if (spec.list) {
    const iid = itemId();
    en.items = [emptyItem(spec.list, iid)];
    fr.items = [emptyItem(spec.list, iid)];
  }
  return { id, type, data: { en, fr } };
}

/* ───────────────────────── validation (structure + format) ───────────────────────── */

const HREF_RE = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;
const IMG_RE = /^\/[A-Za-z0-9._~\-/]+$/;
const ID_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Error keys: block fields  → blocks.<i>.<en|fr>.<field>
 *             list items    → blocks.<i>.items.<k>.<en|fr>.<field>
 *             whole list    → blocks.<i>.items
 */
/** Validates one value against its spec. Returns the normalised value or an error message. */
function checkValue(f: FieldSpec, v: unknown): { ok: true; value: Scalar } | { ok: false; error: string } {
  if (v === undefined || v === null) return { ok: true, value: defaultOf(f) };
  switch (f.kind) {
    case "toggle":
      return typeof v === "boolean" ? { ok: true, value: v } : { ok: false, error: "Must be on or off." };
    case "number": {
      const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
      return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 20000 ? { ok: true, value: n } : { ok: false, error: "Must be a whole number." };
    }
    case "select":
      return typeof v === "string" && (f.options ?? []).some((o) => o.value === v) ? { ok: true, value: v } : { ok: false, error: "Choose one of the listed options." };
    default: {
      if (typeof v !== "string") return { ok: false, error: "Must be text." };
      const s = f.kind === "textarea" ? v.replace(/\r\n/g, "\n") : v.trim();
      if (s.length > (f.max ?? 500)) return { ok: false, error: `Too long (maximum ${f.max ?? 500} characters).` };
      if (f.kind === "href" && s !== "" && !HREF_RE.test(s)) return { ok: false, error: "Use a site path like /contact, or a link starting with https://, mailto: or tel:." };
      if (f.kind === "image" && s !== "" && (!IMG_RE.test(s) || s.includes(".."))) return { ok: false, error: "Pick an image from the media library, or use a site path like /images/photo.jpg." };
      return { ok: true, value: s };
    }
  }
}

function checkFields(
  fields: FieldSpec[],
  en: Record<string, unknown>,
  fr: Record<string, unknown>,
  prefix: string,
  errors: Record<string, string>
): { en: Record<string, Scalar>; fr: Record<string, Scalar> } {
  const outEn: Record<string, Scalar> = {};
  const outFr: Record<string, Scalar> = {};
  for (const f of fields) {
    const e = checkValue(f, en[f.key]);
    if (!e.ok) errors[`${prefix}.en.${f.key}`] = e.error;
    const value = e.ok ? e.value : defaultOf(f);
    outEn[f.key] = value;
    if (f.translatable) {
      const r = checkValue(f, fr[f.key]);
      if (!r.ok) errors[`${prefix}.fr.${f.key}`] = r.error;
      outFr[f.key] = r.ok ? r.value : defaultOf(f);
    } else {
      outFr[f.key] = value; // shared: English is authoritative
    }
  }
  return { en: outEn, fr: outFr };
}

export function validateBlocks(input: unknown): { ok: true; blocks: Block[] } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!Array.isArray(input)) return { ok: false, errors: { blocks: "Blocks must be a list." } };
  if (input.length > 60) return { ok: false, errors: { blocks: "A page can have at most 60 blocks." } };
  const seen = new Set<string>();
  const out: Block[] = [];

  input.forEach((raw, i) => {
    const p = `blocks.${i}`;
    if (!isObj(raw) || typeof raw.type !== "string" || !(BLOCK_TYPES as readonly string[]).includes(raw.type)) {
      errors[p] = "Unknown block type.";
      return;
    }
    const type = raw.type as BlockType;
    const spec = BLOCK_SPECS[type];
    if (typeof raw.id !== "string" || !ID_RE.test(raw.id) || seen.has(raw.id)) {
      errors[p] = "Invalid or duplicate block ID.";
      return;
    }
    seen.add(raw.id);
    const data = isObj(raw.data) ? raw.data : {};
    const en = isObj(data.en) ? data.en : {};
    const fr = isObj(data.fr) ? data.fr : {};
    const base = checkFields(spec.fields, en, fr, p, errors);
    const outEn: BlockData = { ...base.en };
    const outFr: BlockData = { ...base.fr };

    if (spec.list) {
      const lEn = Array.isArray(en.items) ? en.items : [];
      const lFr = Array.isArray(fr.items) ? fr.items : [];
      if (lEn.length > spec.list.max) errors[`${p}.items`] = `At most ${spec.list.max} items.`;
      const sameShape = lEn.length === lFr.length && lEn.every((a, k) => isObj(a) && isObj(lFr[k]) && (a as Record<string, unknown>).id === (lFr[k] as Record<string, unknown>).id);
      if (!sameShape) errors[`${p}.items`] = "The English and French lists must have the same items in the same order.";
      const ids = new Set<string>();
      const itemsEn: BlockItem[] = [];
      const itemsFr: BlockItem[] = [];
      lEn.slice(0, spec.list.max).forEach((a, k) => {
        const ip = `${p}.items.${k}`;
        if (!isObj(a) || typeof a.id !== "string" || !ID_RE.test(a.id) || ids.has(a.id)) {
          errors[ip] = "Invalid or duplicate item ID.";
          return;
        }
        ids.add(a.id);
        const b = isObj(lFr[k]) ? (lFr[k] as Record<string, unknown>) : {};
        const r = checkFields(spec.list!.fields, a, b, ip, errors);
        itemsEn.push({ id: a.id, ...r.en });
        itemsFr.push({ id: a.id, ...r.fr });
      });
      outEn.items = itemsEn;
      outFr.items = itemsFr;
    }
    out.push({ id: raw.id, type, data: { en: outEn, fr: outFr } });
  });

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, blocks: out };
}

/* ───────────────────────── completeness ───────────────────────── */

export interface Issue {
  /** "all" = blocks every language (shared field) */
  locale: PageLocale | "all";
  blockId: string | null;
  message: string;
}

const isEmpty = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/** What is still missing before this block can be shown, per language. Never invents text. */
export function blockIssues(block: Block, index: number): Issue[] {
  const spec = BLOCK_SPECS[block.type];
  const where = `Block ${index + 1} (${spec.label})`;
  const out: Issue[] = [];
  const check = (fields: FieldSpec[], get: (loc: PageLocale) => Record<string, unknown>, label: string) => {
    for (const f of fields) {
      if (!f.required) continue;
      if (f.translatable) {
        for (const loc of PAGE_LOCALES) if (isEmpty(get(loc)[f.key])) out.push({ locale: loc, blockId: block.id, message: `${label}: “${f.label}” is empty` });
      } else if (isEmpty(get("en")[f.key])) out.push({ locale: "all", blockId: block.id, message: `${label}: “${f.label}” is empty` });
    }
  };
  check(spec.fields, (l) => block.data[l], where);
  if (spec.list) {
    const items = (block.data.en.items ?? []) as BlockItem[];
    if (items.length < spec.list.min) out.push({ locale: "all", blockId: block.id, message: `${where}: add at least ${spec.list.min} ${spec.list.itemLabel.toLowerCase()}` });
    items.forEach((_, k) =>
      check(
        spec.list!.fields,
        (l) => ((block.data[l].items ?? []) as BlockItem[])[k] ?? {},
        `${where}, ${spec.list!.itemLabel.toLowerCase()} ${k + 1}`
      )
    );
  }
  return out;
}

export interface Readiness {
  ready: Record<PageLocale, boolean>;
  issues: Issue[];
}

/** Per-language completeness of a whole page (title + blocks). Live in the editor, authoritative on the server. */
export function pageReadiness(page: { title: Record<PageLocale, string>; blocks: Block[] }): Readiness {
  const issues: Issue[] = [];
  for (const loc of PAGE_LOCALES) if (!page.title[loc]?.trim()) issues.push({ locale: loc, blockId: null, message: "The page title is empty" });
  if (page.blocks.length === 0) issues.push({ locale: "all", blockId: null, message: "The page has no content yet: add at least one block" });
  page.blocks.forEach((b, i) => issues.push(...blockIssues(b, i)));
  const blocked = (loc: PageLocale) => issues.some((i) => i.locale === loc || i.locale === "all");
  return { ready: { en: !blocked("en"), fr: !blocked("fr") }, issues };
}
