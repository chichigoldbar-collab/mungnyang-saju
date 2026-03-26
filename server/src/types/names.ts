export type NameKind = "animation" | "art" | "myth" | "meaning";

export type NameStyle =
  | "cute"
  | "soft"
  | "luxury"
  | "trendy"
  | "unique";

export type PetType = "dog" | "cat";
export type PetGender = "male" | "female";

export type NameCandidate = {
  id: string;
  name: string;
  kinds: NameKind[];
  moodTags: NameStyle[];
  petTypes: Array<PetType | "all">;
  genders: Array<PetGender | "all">;
  source: string;
  meaning: string;
  story: string;
  weight?: number;
  aliases?: string[];
  regionTags?: Array<"korean" | "global">;
  hiddenTags?: string[];
};

export type NameRecommendRequest = {
  petType: PetType;
  gender: PetGender;
  kind: NameKind;
  style: NameStyle;
  limit?: number;
};

export type NameRecommendResult = {
  name: string;
  source: string;
  meaning: string;
  story: string;
  tags: string[];
};