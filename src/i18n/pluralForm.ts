/**
 * A CLDR-style plural form set. `other` is mandatory (every locale has it);
 * the remaining categories are optional and only populated for locales
 * whose grammar needs them (e.g. Russian needs one/few/many/other).
 */
export interface PluralForm {
  readonly other: string;
  readonly zero?: string;
  readonly one?: string;
  readonly two?: string;
  readonly few?: string;
  readonly many?: string;
}

/**
 * Identity helper used only to force the TypeScript inferred type of a
 * plural leaf to the full optional `PluralForm` shape (instead of the
 * narrow literal shape of whatever categories the English source happens
 * to use). This lets other locales legally supply extra categories (e.g.
 * Russian's `few`/`many`) without violating the shared translation schema.
 */
export function pluralForm(form: PluralForm): PluralForm {
  return form;
}
