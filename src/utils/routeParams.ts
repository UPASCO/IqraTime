import type { AyahId, HadithId } from "@/domain/types";

/** AyahId is "surah:ayah" (e.g. "94:5"); routes use "surah-ayah" to avoid encoding ':' in URLs/deep links. */
export function ayahIdToRouteParam(id: AyahId): string {
  return id.replace(":", "-");
}

export function routeParamToAyahId(param: string): AyahId {
  return param.replace("-", ":");
}

/** HadithId is "collection:hadithNumber" (e.g. "bukhari:1"); same "-" route-param convention as AyahId. */
export function hadithIdToRouteParam(id: HadithId): string {
  return id.replace(":", "-");
}

export function routeParamToHadithId(param: string): HadithId {
  return param.replace("-", ":");
}
