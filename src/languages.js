// Spotify catalogue language codes use ISO 639-1
export const supportedLanguages = [
  { code: "", name: "Any language" },
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

const languageScripts = {
  zh: /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u,
  ja: /[\u3040-\u30ff]/u,
  ko: /[\uac00-\ud7af]/u,
  ar: /[\u0600-\u06ff]/u,
  hi: /[\u0900-\u097f]/u,
};

const languageSearchTerms = {
  en: ["English podcast"],
  fr: ["podcast français"],
  es: ["podcast español"],
  pt: ["podcast português"],
  de: ["deutscher podcast"],
  it: ["podcast italiano"],
  nl: ["Nederlandse podcast"],
  ja: ["日本語 ポッドキャスト"],
  ko: ["한국어 팟캐스트"],
  zh: ["中文 podcast", "Chinese podcast"],
  ar: ["بودكاست عربي"],
  hi: ["हिंदी podcast"],
};

export function languageName(code) {
  return supportedLanguages.find((language) => language.code === code)?.name || "Any language";
}

export function languageSearchTermsFor(code) {
  return languageSearchTerms[code] || [];
}

export function matchesLanguage(item, language) {
  if (!language) return true;
  const values = [
    ...(Array.isArray(item?.languages) ? item.languages : []),
    ...(typeof item?.language === "string" ? [item.language] : []),
  ];
  const wanted = language.toLowerCase();
  const declaredMatch = values.some((value) => {
    const normalized = String(value).toLowerCase();
    return normalized === wanted || normalized.startsWith(wanted + "-");
  });
  if (declaredMatch) return true;

  const pattern = languageScripts[wanted];
  if (!pattern) return false;
  const text = [item?.name, item?.description, item?.publisher?.name].filter(Boolean).join(" ");
  return Array.from(text).filter((character) => pattern.test(character)).length >= 2;
}
