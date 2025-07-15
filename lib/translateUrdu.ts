const dictionary: Record<string, string> = {
  "This": "یہ",
  "blog": "بلاگ",
  "talks": "بات کرتا ہے",
  "about": "کے بارے میں",
  "technology": "ٹیکنالوجی",
}

export function translateToUrdu(text: string): string {
  return text.split(" ").map(word => dictionary[word] || word).join(" ")
}
