export type PetType = "dog" | "cat";
export type PetGender = "male" | "female";

export type SavedPetProfile = {
  id: string;
  petName: string;
  petType: PetType;
  petGender: PetGender;
  isNeutered: boolean;
  breed: string;
  birthDate: string;
  birthTime: string;
  isBirthTimeKnown: boolean;
};

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

export type FortuneHistoryItem = FortuneResult & {
  id: string;
  petId: string;
  createdAt: string;
  petName: string;
  petType: PetType;
  petGender: PetGender;
  breed: string;
  age: string;
  personalityKey?: string;
  moodKey?: string;
  focusKey?: string;
  cautionKey?: string;
};