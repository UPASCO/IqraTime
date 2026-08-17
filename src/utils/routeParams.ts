import type { AyahId } from "@/domain/types";

/** AyahId is "surah:ayah" (e.g. "94:5"); routes use "surah-ayah" to avoid encoding ':' in URLs/deep links. */
export function ayahIdToRouteParam(id: AyahId): string {
  return id.replace(":", "-");
}

export function routeParamToAyahId(param: string): AyahId {
  return param.replace("-", ":");
}
