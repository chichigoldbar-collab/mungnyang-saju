import type { PetType } from "../types";

export const luckyColors = [
  "크림 베이지",
  "따뜻한 아이보리",
  "부드러운 살구색",
  "꿀빛 노랑",
  "연한 코랄",
  "차분한 로즈",
  "포근한 브라운",
  "올리브 그린",
  "세이지 그린",
  "하늘빛 블루",
  "딥 네이비",
  "라벤더",
  "은은한 보라",
  "밀크 화이트",
] as const;

export const luckyItems = [
  "푹신한 담요",
  "새 장난감",
  "좋아하는 간식",
  "깨끗한 물그릇",
  "익숙한 쿠션",
  "산책 리드줄",
  "스크래처",
  "숨숨집",
  "포근한 방석",
  "낚싯대 장난감",
  "터그 장난감",
  "공놀이 장난감",
  "창가 자리",
  "노즈워크 매트",
] as const;

export const luckyItemsBySpecies = {
  dog: [
    "산책 리드줄",
    "노즈워크 매트",
    "공놀이 장난감",
    "터그 장난감",
    "좋아하는 간식",
    "깨끗한 물그릇",
    "푹신한 담요",
    "포근한 방석",
  ],
  cat: [
    "스크래처",
    "숨숨집",
    "낚싯대 장난감",
    "창가 자리",
    "익숙한 쿠션",
    "깨끗한 물그릇",
    "좋아하는 간식",
    "포근한 방석",
  ],
} as const;

export type BreedSizeKey = "small" | "medium" | "large" | "unknown";
export type BreedEnergyKey = "low" | "mid" | "high";
export type BreedTemperamentTag =
  | "affectionate"
  | "social"
  | "curious"
  | "sensitive"
  | "independent"
  | "calm"
  | "active"
  | "alert";

export type BreedProfile = {
  size: BreedSizeKey;
  energy: BreedEnergyKey;
  temperamentTags: BreedTemperamentTag[];
};

/**
 * 프리미엄 성격분석용 확장 프로필
 * 기존 무료운세 구조는 유지하면서,
 * 더 정교한 성격분석 로직에서 사용할 수 있도록 추가
 */
export type PersonalityLevel = "low" | "mid" | "high";

export type BreedPersonalityProfile = {
  energy: PersonalityLevel;
  sociability: PersonalityLevel;
  dependency: PersonalityLevel;
  sensitivity: PersonalityLevel;
  activity: PersonalityLevel;
  routine: PersonalityLevel;
};

export const dogBreedProfiles: Record<string, BreedProfile> = {
  말티즈: {
    size: "small",
    energy: "mid",
    temperamentTags: ["affectionate", "sensitive", "social"],
  },
  말티푸: {
    size: "small",
    energy: "mid",
    temperamentTags: ["affectionate", "curious", "social"],
  },
  포메라니안: {
    size: "small",
    energy: "high",
    temperamentTags: ["alert", "curious", "sensitive"],
  },
  푸들: {
    size: "medium",
    energy: "high",
    temperamentTags: ["curious", "active", "social"],
  },
  토이푸들: {
    size: "small",
    energy: "high",
    temperamentTags: ["curious", "social", "affectionate"],
  },
  미니어처푸들: {
    size: "small",
    energy: "high",
    temperamentTags: ["curious", "active", "social"],
  },
  비숑프리제: {
    size: "small",
    energy: "high",
    temperamentTags: ["social", "affectionate", "active"],
  },
  치와와: {
    size: "small",
    energy: "mid",
    temperamentTags: ["alert", "sensitive", "affectionate"],
  },
  시츄: {
    size: "small",
    energy: "low",
    temperamentTags: ["calm", "affectionate", "social"],
  },
  요크셔테리어: {
    size: "small",
    energy: "high",
    temperamentTags: ["alert", "active", "curious"],
  },
  닥스훈트: {
    size: "small",
    energy: "mid",
    temperamentTags: ["curious", "alert", "independent"],
  },
  웰시코기: {
    size: "medium",
    energy: "high",
    temperamentTags: ["active", "social", "alert"],
  },
  골든리트리버: {
    size: "large",
    energy: "high",
    temperamentTags: ["social", "affectionate", "active"],
  },
  래브라도리트리버: {
    size: "large",
    energy: "high",
    temperamentTags: ["social", "active", "affectionate"],
  },
  진돗개: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["independent", "alert", "calm"],
  },
  시바견: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["independent", "alert", "curious"],
  },
  프렌치불도그: {
    size: "medium",
    energy: "low",
    temperamentTags: ["affectionate", "social", "calm"],
  },
  퍼그: {
    size: "small",
    energy: "low",
    temperamentTags: ["affectionate", "social", "calm"],
  },
  스피츠: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["alert", "social", "curious"],
  },
  보더콜리: {
    size: "medium",
    energy: "high",
    temperamentTags: ["active", "curious", "alert"],
  },
  슈나우저: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["alert", "curious", "social"],
  },
  코카스파니엘: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["affectionate", "social", "curious"],
  },
  비글: {
    size: "medium",
    energy: "high",
    temperamentTags: ["active", "curious", "social"],
  },
  사모예드: {
    size: "large",
    energy: "high",
    temperamentTags: ["social", "active", "affectionate"],
  },
  알래스칸말라뮤트: {
    size: "large",
    energy: "high",
    temperamentTags: ["active", "independent", "alert"],
  },
  시베리안허스키: {
    size: "large",
    energy: "high",
    temperamentTags: ["active", "curious", "independent"],
  },
  파피용: {
    size: "small",
    energy: "high",
    temperamentTags: ["curious", "social", "active"],
  },
  페키니즈: {
    size: "small",
    energy: "low",
    temperamentTags: ["calm", "independent", "affectionate"],
  },
  보스턴테리어: {
    size: "small",
    energy: "high",
    temperamentTags: ["active", "social", "affectionate"],
  },
  도베르만: {
    size: "large",
    energy: "high",
    temperamentTags: ["alert", "active", "social"],
  },
  셰틀랜드쉽독: {
    size: "medium",
    energy: "high",
    temperamentTags: ["alert", "social", "curious"],
  },
  믹스견: {
    size: "unknown",
    energy: "mid",
    temperamentTags: ["curious", "social", "affectionate"],
  },
};

export const catBreedProfiles: Record<string, BreedProfile> = {
  코리안숏헤어: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["curious", "independent", "social"],
  },
  페르시안: {
    size: "medium",
    energy: "low",
    temperamentTags: ["calm", "affectionate", "sensitive"],
  },
  러시안블루: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["independent", "sensitive", "calm"],
  },
  브리티시숏헤어: {
    size: "medium",
    energy: "low",
    temperamentTags: ["calm", "independent", "affectionate"],
  },
  브리티시롱헤어: {
    size: "medium",
    energy: "low",
    temperamentTags: ["calm", "independent", "affectionate"],
  },
  랙돌: {
    size: "large",
    energy: "low",
    temperamentTags: ["affectionate", "calm", "social"],
  },
  스코티시폴드: {
    size: "medium",
    energy: "low",
    temperamentTags: ["calm", "affectionate", "sensitive"],
  },
  샴: {
    size: "medium",
    energy: "high",
    temperamentTags: ["social", "active", "curious"],
  },
  먼치킨: {
    size: "small",
    energy: "mid",
    temperamentTags: ["curious", "affectionate", "social"],
  },
  노르웨이숲: {
    size: "large",
    energy: "mid",
    temperamentTags: ["independent", "curious", "calm"],
  },
  메인쿤: {
    size: "large",
    energy: "mid",
    temperamentTags: ["social", "curious", "affectionate"],
  },
  벵갈: {
    size: "medium",
    energy: "high",
    temperamentTags: ["active", "curious", "alert"],
  },
  터키시앙고라: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["curious", "social", "independent"],
  },
  아비시니안: {
    size: "medium",
    energy: "high",
    temperamentTags: ["active", "curious", "social"],
  },
  봄베이: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["affectionate", "social", "curious"],
  },
  아메리칸숏헤어: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["calm", "curious", "independent"],
  },
  엑조틱숏헤어: {
    size: "medium",
    energy: "low",
    temperamentTags: ["calm", "affectionate", "sensitive"],
  },
  스핑크스: {
    size: "medium",
    energy: "high",
    temperamentTags: ["social", "affectionate", "active"],
  },
  버만: {
    size: "medium",
    energy: "mid",
    temperamentTags: ["affectionate", "calm", "social"],
  },
  데본렉스: {
    size: "small",
    energy: "high",
    temperamentTags: ["active", "social", "curious"],
  },
  코니시렉스: {
    size: "small",
    energy: "high",
    temperamentTags: ["active", "social", "curious"],
  },
  믹스묘: {
    size: "unknown",
    energy: "mid",
    temperamentTags: ["curious", "independent", "social"],
  },
};

/**
 * 프리미엄 성격분석용 세부 프로필
 * 같은 품종이라도 더 세밀한 성향 문장 분기에 사용
 */
export const dogBreedPersonalityProfiles: Record<string, BreedPersonalityProfile> =
  {
    말티즈: {
      energy: "mid",
      sociability: "high",
      dependency: "high",
      sensitivity: "high",
      activity: "mid",
      routine: "mid",
    },
    말티푸: {
      energy: "mid",
      sociability: "high",
      dependency: "high",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
    포메라니안: {
      energy: "high",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "high",
      activity: "high",
      routine: "low",
    },
    푸들: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "mid",
    },
    토이푸들: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "mid",
    },
    미니어처푸들: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "mid",
    },
    비숑프리제: {
      energy: "high",
      sociability: "high",
      dependency: "high",
      sensitivity: "mid",
      activity: "high",
      routine: "low",
    },
    치와와: {
      energy: "mid",
      sociability: "low",
      dependency: "high",
      sensitivity: "high",
      activity: "mid",
      routine: "high",
    },
    시츄: {
      energy: "low",
      sociability: "high",
      dependency: "high",
      sensitivity: "mid",
      activity: "low",
      routine: "high",
    },
    요크셔테리어: {
      energy: "high",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "high",
      activity: "high",
      routine: "mid",
    },
    닥스훈트: {
      energy: "mid",
      sociability: "low",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "high",
    },
    웰시코기: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "mid",
    },
    골든리트리버: {
      energy: "high",
      sociability: "high",
      dependency: "high",
      sensitivity: "low",
      activity: "high",
      routine: "mid",
    },
    래브라도리트리버: {
      energy: "high",
      sociability: "high",
      dependency: "high",
      sensitivity: "low",
      activity: "high",
      routine: "mid",
    },
    진돗개: {
      energy: "mid",
      sociability: "low",
      dependency: "low",
      sensitivity: "mid",
      activity: "mid",
      routine: "high",
    },
    시바견: {
      energy: "mid",
      sociability: "low",
      dependency: "low",
      sensitivity: "mid",
      activity: "mid",
      routine: "high",
    },
    프렌치불도그: {
      energy: "low",
      sociability: "high",
      dependency: "high",
      sensitivity: "mid",
      activity: "low",
      routine: "high",
    },
    퍼그: {
      energy: "low",
      sociability: "high",
      dependency: "high",
      sensitivity: "mid",
      activity: "low",
      routine: "high",
    },
    스피츠: {
      energy: "mid",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
    보더콜리: {
      energy: "high",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "high",
      activity: "high",
      routine: "high",
    },
    슈나우저: {
      energy: "mid",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "high",
    },
    코카스파니엘: {
      energy: "mid",
      sociability: "high",
      dependency: "high",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
    비글: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "low",
    },
    사모예드: {
      energy: "high",
      sociability: "high",
      dependency: "high",
      sensitivity: "low",
      activity: "high",
      routine: "mid",
    },
    알래스칸말라뮤트: {
      energy: "high",
      sociability: "mid",
      dependency: "low",
      sensitivity: "mid",
      activity: "high",
      routine: "mid",
    },
    시베리안허스키: {
      energy: "high",
      sociability: "mid",
      dependency: "low",
      sensitivity: "mid",
      activity: "high",
      routine: "low",
    },
    파피용: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "mid",
    },
    페키니즈: {
      energy: "low",
      sociability: "low",
      dependency: "mid",
      sensitivity: "mid",
      activity: "low",
      routine: "high",
    },
    보스턴테리어: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "mid",
    },
    도베르만: {
      energy: "high",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "high",
    },
    셰틀랜드쉽독: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "high",
      activity: "high",
      routine: "high",
    },
    믹스견: {
      energy: "mid",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
  };

export const catBreedPersonalityProfiles: Record<string, BreedPersonalityProfile> =
  {
    코리안숏헤어: {
      energy: "mid",
      sociability: "mid",
      dependency: "low",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
    페르시안: {
      energy: "low",
      sociability: "low",
      dependency: "mid",
      sensitivity: "high",
      activity: "low",
      routine: "high",
    },
    러시안블루: {
      energy: "mid",
      sociability: "low",
      dependency: "low",
      sensitivity: "high",
      activity: "mid",
      routine: "high",
    },
    브리티시숏헤어: {
      energy: "low",
      sociability: "low",
      dependency: "low",
      sensitivity: "mid",
      activity: "low",
      routine: "high",
    },
    브리티시롱헤어: {
      energy: "low",
      sociability: "low",
      dependency: "low",
      sensitivity: "mid",
      activity: "low",
      routine: "high",
    },
    랙돌: {
      energy: "low",
      sociability: "high",
      dependency: "high",
      sensitivity: "mid",
      activity: "low",
      routine: "mid",
    },
    스코티시폴드: {
      energy: "low",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "high",
      activity: "low",
      routine: "high",
    },
    샴: {
      energy: "high",
      sociability: "high",
      dependency: "high",
      sensitivity: "mid",
      activity: "high",
      routine: "low",
    },
    먼치킨: {
      energy: "mid",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
    노르웨이숲: {
      energy: "mid",
      sociability: "low",
      dependency: "low",
      sensitivity: "mid",
      activity: "mid",
      routine: "high",
    },
    메인쿤: {
      energy: "mid",
      sociability: "high",
      dependency: "mid",
      sensitivity: "low",
      activity: "mid",
      routine: "mid",
    },
    벵갈: {
      energy: "high",
      sociability: "mid",
      dependency: "low",
      sensitivity: "mid",
      activity: "high",
      routine: "low",
    },
    터키시앙고라: {
      energy: "mid",
      sociability: "mid",
      dependency: "low",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
    아비시니안: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "low",
    },
    봄베이: {
      energy: "mid",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
    아메리칸숏헤어: {
      energy: "mid",
      sociability: "mid",
      dependency: "low",
      sensitivity: "mid",
      activity: "mid",
      routine: "high",
    },
    엑조틱숏헤어: {
      energy: "low",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "high",
      activity: "low",
      routine: "high",
    },
    스핑크스: {
      energy: "high",
      sociability: "high",
      dependency: "high",
      sensitivity: "mid",
      activity: "high",
      routine: "low",
    },
    버만: {
      energy: "mid",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
    데본렉스: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "low",
    },
    코니시렉스: {
      energy: "high",
      sociability: "high",
      dependency: "mid",
      sensitivity: "mid",
      activity: "high",
      routine: "low",
    },
    믹스묘: {
      energy: "mid",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    },
  };

export function normalizeBreedName(breed: string) {
  return breed.trim().replace(/\s+/g, "");
}

export function getBreedProfile(petType: PetType, breed: string): BreedProfile {
  const normalized = normalizeBreedName(breed);

  if (petType === "dog") {
    return (
      dogBreedProfiles[normalized] ?? {
        size: "unknown",
        energy: "mid",
        temperamentTags: ["curious", "social"],
      }
    );
  }

  return (
    catBreedProfiles[normalized] ?? {
      size: "unknown",
      energy: "mid",
      temperamentTags: ["curious", "independent"],
    }
  );
}

export function getBreedPersonalityProfile(
  petType: PetType,
  breed: string
): BreedPersonalityProfile {
  const normalized = normalizeBreedName(breed);

  if (petType === "dog") {
    return (
      dogBreedPersonalityProfiles[normalized] ?? {
        energy: "mid",
        sociability: "mid",
        dependency: "mid",
        sensitivity: "mid",
        activity: "mid",
        routine: "mid",
      }
    );
  }

  return (
    catBreedPersonalityProfiles[normalized] ?? {
      energy: "mid",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    }
  );
}

export function getLuckyItemsBySpecies(petType: PetType) {
  return luckyItemsBySpecies[petType];
}

export const personalityDescriptions = {
  energetic: {
    dog: [
      "반응이 빠르고 활동 욕구가 살아나는 성향이 강해요.",
      "움직임과 교감이 함께 올라오면 만족감이 커지는 타입이에요.",
    ],
    cat: [
      "흥미가 생기면 눈빛과 움직임이 빠르게 살아나는 편이에요.",
      "가만히 있어 보여도 자극이 맞으면 에너지가 또렷하게 올라오는 타입이에요.",
    ],
  },
  gentle: {
    dog: [
      "자극보다 안정감을 중시하는 편이라 차분한 리듬이 잘 맞아요.",
      "편안한 분위기에서 만족도가 더 크게 올라가는 성향이에요.",
    ],
    cat: [
      "과한 변화보다 익숙한 흐름을 선호하는 차분한 성향이 있어요.",
      "조용한 교감과 안정적인 환경에서 편안함을 느끼는 편이에요.",
    ],
  },
  curious: {
    dog: [
      "새로운 냄새와 움직임에 대한 관심이 높은 편이에요.",
      "탐색 욕구가 살아나면 집중력도 함께 올라가는 타입이에요.",
    ],
    cat: [
      "관찰하고 확인하는 과정 자체에서 흥미를 느끼는 성향이 있어요.",
      "환경을 천천히 읽은 뒤 반응하는 탐색형 기질이 살아 있어요.",
    ],
  },
  independent: {
    dog: [
      "혼자만의 템포를 지키려는 성향이 있어 거리 조절이 중요해요.",
      "항상 붙어 있기보다 자기 리듬을 존중받을 때 안정감을 느껴요.",
    ],
    cat: [
      "자기 거리와 자기 자리를 중요하게 여기는 성향이 강해요.",
      "먼저 다가오기보다 스스로 타이밍을 정하는 편이에요.",
    ],
  },
  affectionate: {
    dog: [
      "보호자와의 교감에서 정서적 안정이 크게 올라가는 타입이에요.",
      "칭찬과 반응이 하루 컨디션에 좋은 영향을 주는 편이에요.",
    ],
    cat: [
      "가까운 존재를 의식하고 정서적으로 기대는 흐름이 살아 있어요.",
      "길게 표현하지 않아도 익숙한 사람 곁에서 안정감을 느끼는 편이에요.",
    ],
  },
  sensitive: {
    dog: [
      "분위기와 말투, 낯선 자극에 예민하게 반응할 수 있어요.",
      "작은 변화도 크게 느낄 수 있어 템포 조절이 중요해요.",
    ],
    cat: [
      "소리와 환경 변화에 대한 감각이 섬세한 편이에요.",
      "불편한 자극이 겹치면 평소보다 빨리 거리 두기를 할 수 있어요.",
    ],
  },
} as const;