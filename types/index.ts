export type PetType = "dog" | "cat";
export type PetGender = "male" | "female";

export type FortuneResult = {
  summary: string;
  health: string;
  appetite: string;
  mood: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
  recommendedAction: string;
};

export type PremiumAccessState = {
  allAccess: boolean;
};

export type FortuneHistoryItem = {
  id: string;
  createdAt: string;
  petName: string;
  petType: string;
  petGender: string;
  breed: string;
  age: string;
  summary: string;
  health: string;
  appetite: string;
  mood: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
  recommendedAction: string;
};