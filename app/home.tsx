import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";
import type { PetGender, PetType } from "../types";

const PET_STORAGE_KEY = "mungnyang-pet-profiles";
const CURRENT_PET_KEY = "mungnyang-current-pet";
const FORTUNE_HISTORY_KEY = "mungnyang-fortune-history";
const DAILY_FORTUNE_CACHE_KEY = "mungnyang-daily-fortune-cache";
const NAME_RECOMMEND_HISTORY_KEY = "mungnyang-name-recommend-history";

type SavedPetProfile = {
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

type DailyFortuneCacheItem = {
  petId: string;
  dateKey: string;
  petName: string;
  petType: PetType;
  petGender: PetGender;
  isNeutered: boolean;
  breed: string;
  birthDate: string;
  birthTime: string;
  summary: string;
  health: string;
  appetite: string;
  mood: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
  recommendedAction: string;
};

type NameStyle =
  | "cute"
  | "soft"
  | "luxury"
  | "trendy"
  | "korean"
  | "unique";

type NameKind = "animation" | "art" | "myth" | "meaning";
type RegionTag = "korean" | "global";

type NameCandidate = {
  name: string;
  kinds: NameKind[];
  moodTags: NameStyle[];
  regionTags: RegionTag[];
  petTypes: Array<PetType | "all">;
  genders: Array<PetGender | "all">;
  source: string;
  meaning: string;
  story: string;
};

type RecommendedNameItem = {
  name: string;
  source: string;
  meaning: string;
  story: string;
  tags: string[];
};

const STYLE_OPTIONS: Array<{ key: NameStyle; label: string }> = [
  { key: "cute", label: "귀여운" },
  { key: "soft", label: "부드러운" },
  { key: "luxury", label: "고급스러운" },
  { key: "trendy", label: "트렌디한" },
  { key: "korean", label: "한국적인" },
  { key: "unique", label: "유니크한" },
];

const KIND_OPTIONS: Array<{ key: NameKind; label: string }> = [
  { key: "animation", label: "애니 · 영화" },
  { key: "art", label: "명화 · 예술" },
  { key: "myth", label: "신화 · 전설" },
  { key: "meaning", label: "좋은 의미" },
];

const tagLabelMap: Record<NameStyle | NameKind, string> = {
  cute: "귀여운",
  soft: "부드러운",
  luxury: "고급스러운",
  trendy: "트렌디한",
  korean: "한국적인",
  unique: "유니크한",
  animation: "애니 · 영화",
  art: "명화 · 예술",
  myth: "신화 · 전설",
  meaning: "좋은 의미",
};

const NAME_CANDIDATES: NameCandidate[] = [
  // animation / korean
  {
    name: "하니",
    kinds: ["animation"],
    moodTags: ["cute", "korean", "trendy"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "한국 애니 《달려라 하니》",
    meaning: "씩씩하고 사랑스러운 주인공의 이미지",
    story:
      "밝고 당찬 에너지가 있는 아이, 작아도 존재감이 분명한 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "둘리",
    kinds: ["animation"],
    moodTags: ["cute", "korean", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "한국 애니 《아기공룡 둘리》",
    meaning: "장난기 많고 미워할 수 없는 개구쟁이 이미지",
    story:
      "장난꾸러기지만 정이 많이 가는 아이에게 잘 어울리는 대표적인 한국 감성 이름이에요.",
  },
  {
    name: "또치",
    kinds: ["animation"],
    moodTags: ["cute", "korean"],
    regionTags: ["korean"],
    petTypes: ["cat", "all"],
    genders: ["female", "all"],
    source: "한국 애니 《아기공룡 둘리》",
    meaning: "새침하지만 귀여운 캐릭터 이미지",
    story:
      "도도하면서도 귀여운 분위기를 가진 아이, 고양이처럼 자기 페이스가 있는 아이에게 잘 어울려요.",
  },
  {
    name: "도우너",
    kinds: ["animation"],
    moodTags: ["unique", "korean", "trendy"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "한국 애니 《아기공룡 둘리》",
    meaning: "엉뚱하고 독특한 매력의 이미지",
    story:
      "조금 엉뚱하고 예측 불가한 매력이 있는 아이에게 잘 어울리는 한국 애니 스타일 이름이에요.",
  },
  {
    name: "희동",
    kinds: ["animation"],
    moodTags: ["cute", "korean", "soft"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "한국 애니 《아기공룡 둘리》",
    meaning: "복슬복슬하고 순한 이미지",
    story:
      "사람을 잘 따르고 포근한 인상을 주는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "뽀로로",
    kinds: ["animation"],
    moodTags: ["cute", "korean", "trendy"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "한국 애니 《뽀롱뽀롱 뽀로로》",
    meaning: "활발하고 밝은 대표 캐릭터 이미지",
    story:
      "늘 신나 있고, 반응이 빠르고, 함께 있으면 분위기가 밝아지는 아이에게 잘 어울려요.",
  },
  {
    name: "루피",
    kinds: ["animation"],
    moodTags: ["cute", "korean", "soft"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "한국 애니 《뽀롱뽀롱 뽀로로》",
    meaning: "다정하고 사랑스러운 이미지",
    story:
      "포근하고 애교 많은 아이, 부드러운 인상을 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "패티",
    kinds: ["animation"],
    moodTags: ["trendy", "korean", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "한국 애니 《뽀롱뽀롱 뽀로로》",
    meaning: "단정하고 자신감 있는 이미지",
    story:
      "차분하지만 존재감이 있는 아이, 또렷한 인상을 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "크롱",
    kinds: ["animation"],
    moodTags: ["cute", "korean", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "한국 애니 《뽀롱뽀롱 뽀로로》",
    meaning: "짧고 귀엽고 반응 좋은 캐릭터 이미지",
    story:
      "짧고 입에 붙는 이름을 원할 때 좋고, 작고 귀여운 에너지가 있는 아이에게 잘 어울려요.",
  },
  {
    name: "콩순",
    kinds: ["animation"],
    moodTags: ["cute", "korean", "soft"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "한국 애니 《콩순이》",
    meaning: "밝고 친근한 한국 아동 캐릭터 이미지",
    story:
      "사랑스럽고 귀여운 분위기를 가진 아이에게 잘 어울리는 따뜻한 한국형 이름이에요.",
  },
  {
    name: "라바",
    kinds: ["animation"],
    moodTags: ["unique", "korean", "trendy"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "한국 애니 《라바》",
    meaning: "통통 튀고 유쾌한 이미지",
    story:
      "재밌고 장난기 많은 아이, 계속 웃음 나게 하는 매력을 가진 아이에게 잘 어울려요.",
  },
  {
    name: "점박",
    kinds: ["animation"],
    moodTags: ["unique", "korean"],
    regionTags: ["korean"],
    petTypes: ["dog", "all"],
    genders: ["male", "all"],
    source: "한국 애니 영화 《점박이》",
    meaning: "강하지만 가족을 지키는 이미지",
    story:
      "보호자와 가족을 잘 따르고 든든한 존재감을 가진 아이에게 잘 어울리는 이름이에요.",
  },

  // animation / global
  {
    name: "엘사",
    kinds: ["animation"],
    moodTags: ["luxury", "soft"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "디즈니 《겨울왕국》",
    meaning: "차분하고 우아한 얼음 공주의 이미지",
    story:
      "조용하지만 존재감이 크고, 맑고 도도한 분위기를 가진 아이에게 특히 잘 어울리는 이름이에요.",
  },
  {
    name: "안나",
    kinds: ["animation"],
    moodTags: ["cute", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "디즈니 《겨울왕국》",
    meaning: "따뜻하고 적극적으로 마음을 표현하는 이미지",
    story:
      "사람을 잘 따르고 애정 표현이 많은 아이에게 잘 어울리는 다정한 이름이에요.",
  },
  {
    name: "올라프",
    kinds: ["animation"],
    moodTags: ["cute", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "디즈니 《겨울왕국》",
    meaning: "순수하고 해맑은 눈사람 캐릭터",
    story:
      "장난기 많고 보면 저절로 웃음이 나는 밝은 아이에게 특히 잘 어울리는 이름이에요.",
  },
  {
    name: "버즈",
    kinds: ["animation"],
    moodTags: ["trendy", "unique"],
    regionTags: ["global"],
    petTypes: ["dog", "all"],
    genders: ["male", "all"],
    source: "픽사 《토이 스토리》",
    meaning: "용감하고 주인을 지키려는 장난감의 이미지",
    story:
      "보호자에게 충성심이 강하고 자신감 있는 분위기를 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "우디",
    kinds: ["animation"],
    moodTags: ["soft", "cute"],
    regionTags: ["global"],
    petTypes: ["dog", "all"],
    genders: ["male", "all"],
    source: "픽사 《토이 스토리》",
    meaning: "주인을 아끼고 끝까지 곁을 지키는 이미지",
    story:
      "보호자를 잘 따르고 정이 많은 아이에게 어울리는 따뜻한 스토리형 이름이에요.",
  },
  {
    name: "심바",
    kinds: ["animation"],
    moodTags: ["trendy", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "디즈니 《라이온 킹》",
    meaning: "용기와 성장, 왕의 기운을 품은 이미지",
    story:
      "씩씩하고 당당한 인상을 가진 아이에게 잘 맞는 이름이에요.",
  },
  {
    name: "날라",
    kinds: ["animation"],
    moodTags: ["soft", "luxury"],
    regionTags: ["global"],
    petTypes: ["cat", "all"],
    genders: ["female", "all"],
    source: "디즈니 《라이온 킹》",
    meaning: "우아하고 강단 있는 이미지",
    story:
      "도도하면서도 보호자에게는 다정한 매력을 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "모아나",
    kinds: ["animation"],
    moodTags: ["unique", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "디즈니 《모아나》",
    meaning: "자유롭고 바다 같은 생동감을 가진 이미지",
    story:
      "활발하고 호기심이 많으며 새로운 환경에도 금방 적응하는 아이에게 잘 어울려요.",
  },
  {
    name: "치히로",
    kinds: ["animation"],
    moodTags: ["soft", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "지브리 《센과 치히로의 행방불명》",
    meaning: "순수하지만 단단하게 성장하는 이미지",
    story:
      "처음엔 조심스럽지만 시간이 갈수록 신뢰를 주는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "하울",
    kinds: ["animation"],
    moodTags: ["luxury", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "지브리 《하울의 움직이는 성》",
    meaning: "신비롭고 세련된 존재감",
    story:
      "우아하고 조금은 특별한 분위기가 있는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "키키",
    kinds: ["animation"],
    moodTags: ["cute", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "지브리 《마녀 배달부 키키》",
    meaning: "밝고 가볍고 사랑스러운 울림",
    story:
      "통통 튀고 애교가 많으며 보호자와의 교감이 빠른 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "토토로",
    kinds: ["animation"],
    moodTags: ["cute", "soft"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "지브리 《이웃집 토토로》",
    meaning: "포근하고 편안하게 지켜주는 존재의 이미지",
    story:
      "보고만 있어도 마음이 편해지는 포근한 아이에게 특히 잘 어울리는 이름이에요.",
  },

  // art / korean
  {
    name: "혜원",
    kinds: ["art"],
    moodTags: ["korean", "soft", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "조선 화가 신윤복의 호",
    meaning: "섬세하고 우아한 한국 미감",
    story:
      "부드럽고 예쁜 분위기, 은근한 고급스러움이 있는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "단원",
    kinds: ["art"],
    moodTags: ["korean", "unique", "trendy"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "조선 화가 김홍도의 호",
    meaning: "생동감 있고 한국적인 예술 감성",
    story:
      "표정이 풍부하고 생기 있는 아이에게 잘 어울리는 한국 예술 계열 이름이에요.",
  },
  {
    name: "오원",
    kinds: ["art"],
    moodTags: ["korean", "unique", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "조선 화가 장승업의 호",
    meaning: "자유롭고 강렬한 예술성",
    story:
      "개성이 뚜렷하고 쉽게 잊히지 않는 분위기의 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "중섭",
    kinds: ["art"],
    moodTags: ["korean", "soft", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "화가 이중섭",
    meaning: "따뜻하고 정감 있는 한국 근대미술의 이미지",
    story:
      "작아도 마음을 끄는 정이 많고 진한 존재감을 가진 아이에게 잘 어울려요.",
  },
  {
    name: "천경",
    kinds: ["art"],
    moodTags: ["korean", "luxury", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "화가 천경자",
    meaning: "화려하고 이국적이면서도 깊은 한국적 감성",
    story:
      "눈빛이 인상적이고 분위기가 화려한 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "나혜",
    kinds: ["art"],
    moodTags: ["korean", "soft", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "화가 나혜석",
    meaning: "단정하고 지적인 예술 감성",
    story:
      "차분하고 또렷한 매력을 가진 아이에게 잘 어울리는 한국 예술 이름이에요.",
  },
  {
    name: "솔거",
    kinds: ["art"],
    moodTags: ["korean", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "신라 화가 솔거",
    meaning: "한국 고전미술의 상징적인 이미지",
    story:
      "묵직하고 조금은 고풍스러운 분위기를 가진 아이에게 잘 어울려요.",
  },
  {
    name: "수월",
    kinds: ["art"],
    moodTags: ["korean", "soft", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "한국 불화의 고요한 정서에서 착안",
    meaning: "맑고 고요하게 흐르는 미감",
    story:
      "차분하고 은은한 분위기의 아이에게 잘 어울리는 한국적인 예술 이름이에요.",
  },

  // art / global
  {
    name: "모네",
    kinds: ["art"],
    moodTags: ["soft", "luxury"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "화가 클로드 모네",
    meaning: "빛과 색을 부드럽게 담아내는 인상주의의 이미지",
    story:
      "잔잔하고 감성적인 분위기를 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "고흐",
    kinds: ["art"],
    moodTags: ["unique", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "화가 빈센트 반 고흐",
    meaning: "강한 개성과 따뜻한 감성을 함께 가진 이미지",
    story:
      "눈빛이나 표정이 인상적이고 존재감이 분명한 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "클림트",
    kinds: ["art"],
    moodTags: ["luxury", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "화가 구스타프 클림트",
    meaning: "황금빛의 화려함과 우아한 장식미",
    story:
      "고급스럽고 시선을 끄는 분위기를 가진 아이에게 어울리는 예술형 이름이에요.",
  },
  {
    name: "르누아르",
    kinds: ["art"],
    moodTags: ["soft", "luxury"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "화가 피에르 오귀스트 르누아르",
    meaning: "따뜻하고 온화한 색감의 이미지",
    story:
      "사람을 편안하게 만드는 부드러운 매력을 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "세잔",
    kinds: ["art"],
    moodTags: ["unique", "soft"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "화가 폴 세잔",
    meaning: "차분하고 구조감 있는 안정된 이미지",
    story:
      "과하지 않지만 묵직한 매력이 있는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "프리다",
    kinds: ["art"],
    moodTags: ["unique", "luxury"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "화가 프리다 칼로",
    meaning: "자기만의 개성과 강단을 가진 이미지",
    story:
      "작아도 존재감이 분명하고 자신만의 분위기가 있는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "달리",
    kinds: ["art"],
    moodTags: ["unique", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "화가 살바도르 달리",
    meaning: "기발하고 독특한 상상력의 이미지",
    story:
      "조금 엉뚱하고 예측 불가한 매력을 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "미로",
    kinds: ["art"],
    moodTags: ["trendy", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "화가 호안 미로",
    meaning: "가볍고 개성 있는 현대 예술 감성",
    story:
      "가볍고 센스 있는 분위기를 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "마티스",
    kinds: ["art"],
    moodTags: ["luxury", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "화가 앙리 마티스",
    meaning: "대담하고 세련된 색감의 이미지",
    story:
      "도도하고 세련된 분위기를 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "드가",
    kinds: ["art"],
    moodTags: ["soft", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "화가 에드가 드가",
    meaning: "우아하고 관찰적인 예술 감성",
    story:
      "차분하고 보는 맛이 있는 아이, 살펴볼수록 매력 있는 아이에게 잘 어울려요.",
  },

  // myth / korean
  {
    name: "미르",
    kinds: ["myth", "meaning"],
    moodTags: ["korean", "unique", "trendy"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "한국 설화 · 용의 이미지",
    meaning: "강하지만 신비로운 존재감",
    story:
      "작아도 존재감이 묵직하거나 눈빛이 선명한 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "해치",
    kinds: ["myth"],
    moodTags: ["korean", "unique", "trendy"],
    regionTags: ["korean"],
    petTypes: ["dog", "all"],
    genders: ["male", "all"],
    source: "한국 상상 동물 해치",
    meaning: "수호와 보호의 상징",
    story:
      "든든하고 씩씩한 분위기를 가진 아이, 집을 지키는 느낌의 아이에게 잘 어울려요.",
  },
  {
    name: "바리",
    kinds: ["myth"],
    moodTags: ["korean", "soft", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "한국 신화 바리데기",
    meaning: "강한 운명과 회복의 상징",
    story:
      "조용하지만 단단한 내면을 가진 아이, 오래 볼수록 깊은 매력이 느껴지는 아이에게 잘 어울려요.",
  },
  {
    name: "자청",
    kinds: ["myth"],
    moodTags: ["korean", "luxury", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "제주 신화 자청비",
    meaning: "풍요와 생명의 이미지",
    story:
      "우아하면서도 생기 있는 분위기의 아이에게 잘 어울리는 한국 신화 이름이에요.",
  },
  {
    name: "백호",
    kinds: ["myth"],
    moodTags: ["korean", "luxury", "trendy"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "한국 사신 백호",
    meaning: "강인함과 수호의 상징",
    story:
      "카리스마 있고 당당한 존재감을 가진 아이에게 특히 잘 어울리는 이름이에요.",
  },
  {
    name: "청룡",
    kinds: ["myth"],
    moodTags: ["korean", "unique", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "한국 사신 청룡",
    meaning: "권위와 신비로운 힘의 상징",
    story:
      "존재감이 크고 신비로운 분위기를 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "연화",
    kinds: ["myth"],
    moodTags: ["korean", "soft", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "한국 설화적 정서에서 착안",
    meaning: "맑고 우아한 꽃의 상징",
    story:
      "부드럽고 깨끗한 인상을 가진 아이에게 잘 어울리는 한국 전설풍 이름이에요.",
  },
  {
    name: "가람",
    kinds: ["myth"],
    moodTags: ["korean", "soft", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "한국적 자연·설화 감성",
    meaning: "강처럼 흐르는 생명감",
    story:
      "자유롭고 흐름이 좋은 아이, 편안하게 곁에 머무는 아이에게 잘 어울려요.",
  },

  // myth / global
  {
    name: "아폴로",
    kinds: ["myth"],
    moodTags: ["luxury", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "그리스 신화",
    meaning: "태양, 빛, 예술, 자신감의 이미지",
    story:
      "밝고 당당하며 리더 같은 존재감을 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "아르테미스",
    kinds: ["myth"],
    moodTags: ["unique", "soft"],
    regionTags: ["global"],
    petTypes: ["cat", "all"],
    genders: ["female", "all"],
    source: "그리스 신화",
    meaning: "자유롭고 독립적인 달의 여신 이미지",
    story:
      "자기 리듬이 분명하고 우아한 거리감이 있는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "토르",
    kinds: ["myth"],
    moodTags: ["trendy", "unique"],
    regionTags: ["global"],
    petTypes: ["dog", "all"],
    genders: ["male", "all"],
    source: "북유럽 신화",
    meaning: "강함과 보호의 상징",
    story:
      "든든하고 용감한 느낌, 보호자를 지키는 듯한 인상을 주는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "로키",
    kinds: ["myth"],
    moodTags: ["unique", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "북유럽 신화",
    meaning: "장난기와 영리함의 이미지",
    story:
      "머리 회전이 빠르고 장난기 많은 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "헤라",
    kinds: ["myth"],
    moodTags: ["luxury", "soft"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "그리스 신화",
    meaning: "품위와 권위를 가진 여왕의 이미지",
    story:
      "우아하고 정돈된 존재감을 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "아테나",
    kinds: ["myth"],
    moodTags: ["luxury", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "그리스 신화",
    meaning: "지혜와 냉정한 균형의 이미지",
    story:
      "차분하고 똑똑한 인상을 주는 아이에게 특히 잘 어울리는 이름이에요.",
  },
  {
    name: "셀레네",
    kinds: ["myth"],
    moodTags: ["soft", "unique"],
    regionTags: ["global"],
    petTypes: ["cat", "all"],
    genders: ["female", "all"],
    source: "달의 여신",
    meaning: "고요하고 은은한 달빛의 이미지",
    story:
      "차분하고 신비로운 느낌의 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "프레이야",
    kinds: ["myth"],
    moodTags: ["luxury", "soft"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "북유럽 신화",
    meaning: "사랑과 아름다움의 상징",
    story:
      "고급스럽고 예쁜 분위기, 우아하게 시선을 끄는 아이에게 잘 어울려요.",
  },
  {
    name: "오딘",
    kinds: ["myth"],
    moodTags: ["unique", "luxury"],
    regionTags: ["global"],
    petTypes: ["dog", "all"],
    genders: ["male", "all"],
    source: "북유럽 신화",
    meaning: "지혜와 권위의 상징",
    story:
      "묵직한 존재감과 조금은 신비로운 분위기를 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "에코",
    kinds: ["myth"],
    moodTags: ["soft", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "그리스 신화",
    meaning: "메아리처럼 오래 남는 이미지",
    story:
      "은은하지만 한 번 보면 기억에 남는 매력을 가진 아이에게 잘 어울리는 이름이에요.",
  },

  // meaning / korean
  {
    name: "하마",
    kinds: ["meaning"],
    moodTags: ["cute", "korean", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "하쿠나마타타에서 떠올린 별칭",
    meaning: "괜찮아, 다 잘 될 거야라는 긍정의 이미지",
    story:
      "밝고 편안한 기운을 주는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "라온",
    kinds: ["meaning"],
    moodTags: ["korean", "soft"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "순우리말",
    meaning: "즐거운, 기쁜",
    story:
      "가족에게 웃음과 밝은 에너지를 주는 아이에게 잘 어울리는 따뜻한 이름이에요.",
  },
  {
    name: "다온",
    kinds: ["meaning"],
    moodTags: ["korean", "soft"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "좋은 것이 다 온다는 뜻의 느낌",
    meaning: "좋은 기운이 가득 오는 이미지",
    story:
      "새 가족이 된 뒤 집안 분위기를 환하게 바꾸는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "해온",
    kinds: ["meaning"],
    moodTags: ["korean", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "따뜻한 햇살의 이미지",
    meaning: "따뜻하게 비추는 존재",
    story:
      "집안 분위기를 포근하게 바꾸는 아이에게 잘 어울려요.",
  },
  {
    name: "온유",
    kinds: ["meaning"],
    moodTags: ["soft", "korean"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "온화하고 부드러운 성품의 의미",
    meaning: "차분하고 순한 기운",
    story:
      "부드럽고 온순한 인상, 보호자에게 안정감을 주는 아이에게 특히 잘 어울리는 이름이에요.",
  },
  {
    name: "하랑",
    kinds: ["meaning"],
    moodTags: ["korean", "soft"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "함께의 느낌을 담은 이름",
    meaning: "함께 오래가고 싶은 따뜻한 이미지",
    story:
      "가족과의 정이 깊게 쌓이는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "가온",
    kinds: ["meaning"],
    moodTags: ["korean", "trendy", "soft"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "순우리말",
    meaning: "가운데, 중심",
    story:
      "가족의 중심처럼 사랑받는 아이, 존재감이 자연스럽게 큰 아이에게 잘 어울려요.",
  },
  {
    name: "별",
    kinds: ["meaning"],
    moodTags: ["korean", "cute"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "반짝이는 존재를 비유한 이름",
    meaning: "가족의 시선을 사로잡는 소중한 별 같은 이미지",
    story:
      "예쁘고 사랑스럽고 눈에 띄는 매력을 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "솔",
    kinds: ["meaning"],
    moodTags: ["korean", "soft"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "자연을 닮은 이름",
    meaning: "소나무처럼 곧고 편안한 이미지",
    story:
      "차분하고 맑은 분위기를 가진 아이에게 잘 어울리는 단정한 이름이에요.",
  },
  {
    name: "노을",
    kinds: ["meaning"],
    moodTags: ["korean", "soft", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "해질녘의 따뜻한 이미지",
    meaning: "부드럽고 감성적인 빛의 느낌",
    story:
      "은은하고 예쁜 분위기, 보고 있으면 마음이 풀리는 아이에게 잘 어울려요.",
  },
  {
    name: "마루",
    kinds: ["meaning"],
    moodTags: ["korean", "trendy"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "하늘, 꼭대기의 의미",
    meaning: "맑고 시원한 인상",
    story:
      "밝고 씩씩한 분위기, 반듯한 인상을 주는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "한결",
    kinds: ["meaning"],
    moodTags: ["korean", "soft", "luxury"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["all"],
    source: "늘 한결같은 마음의 의미",
    meaning: "변함없고 안정적인 이미지",
    story:
      "보호자에게 꾸준히 위로를 주는 아이, 오래 갈수록 더 깊게 정드는 아이에게 잘 어울려요.",
  },
  {
    name: "윤슬",
    kinds: ["meaning"],
    moodTags: ["korean", "luxury", "unique"],
    regionTags: ["korean"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "햇빛에 반짝이는 물결",
    meaning: "반짝이고 감성적인 이미지",
    story:
      "조용하지만 눈에 들어오는 매력을 가진 아이에게 잘 어울리는 한국적 이름이에요.",
  },

  // meaning / global
  {
    name: "노바",
    kinds: ["meaning"],
    moodTags: ["trendy", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "새로운 별, 새로운 시작의 이미지",
    meaning: "새로운 출발과 설렘",
    story:
      "새 가족이 된 순간을 특별하게 기억하고 싶은 경우 잘 어울리는 이름이에요.",
  },
  {
    name: "루미",
    kinds: ["meaning"],
    moodTags: ["soft", "luxury"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "빛을 떠올리게 하는 이름",
    meaning: "은은하게 빛나는 존재의 이미지",
    story:
      "작지만 반짝이는 분위기, 조용히 존재감을 남기는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "세라",
    kinds: ["meaning"],
    moodTags: ["soft", "luxury"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "맑고 깨끗한 울림의 이름",
    meaning: "정돈되고 부드러운 인상",
    story:
      "차분하고 깔끔한 분위기를 가진 아이에게 잘 어울려요.",
  },
  {
    name: "모리",
    kinds: ["meaning"],
    moodTags: ["soft", "unique"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "숲을 떠올리게 하는 이름",
    meaning: "편안하고 자연스러운 힐링의 이미지",
    story:
      "곁에 있으면 마음이 안정되는 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "노엘",
    kinds: ["meaning"],
    moodTags: ["luxury", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "기쁨과 축복의 의미를 가진 이름",
    meaning: "선물처럼 찾아온 존재의 이미지",
    story:
      "새 가족으로 온 순간 자체가 큰 기쁨이었던 아이에게 특히 잘 어울리는 이름이에요.",
  },
  {
    name: "루나",
    kinds: ["meaning"],
    moodTags: ["luxury", "soft"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "달의 이미지",
    meaning: "은은하고 고요하게 빛나는 존재",
    story:
      "차분하고 우아한 분위기를 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "리오",
    kinds: ["meaning"],
    moodTags: ["trendy", "soft"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "강처럼 힘있게 흐르는 이미지",
    meaning: "생동감 있고 밝은 에너지",
    story:
      "활발하고 표정이 풍부하며 함께 있으면 분위기가 살아나는 아이에게 잘 어울려요.",
  },
  {
    name: "피치",
    kinds: ["meaning"],
    moodTags: ["cute", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "복숭아의 상큼하고 사랑스러운 이미지",
    meaning: "달콤하고 화사한 매력",
    story:
      "상큼하고 사랑스러운 분위기의 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "버터",
    kinds: ["meaning"],
    moodTags: ["cute", "unique", "soft"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["all"],
    source: "부드럽고 말랑한 이미지를 담은 별명형 이름",
    meaning: "포근하고 귀여운 무드",
    story:
      "둥글둥글하고 애교 많은 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "조이",
    kinds: ["meaning"],
    moodTags: ["cute", "trendy"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "기쁨과 즐거움의 의미",
    meaning: "함께 있으면 기분 좋아지는 이미지",
    story:
      "가족에게 웃음을 많이 주는 아이에게 잘 어울리는 밝은 이름이에요.",
  },
  {
    name: "벨",
    kinds: ["meaning"],
    moodTags: ["luxury", "soft"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["female", "all"],
    source: "아름다움을 떠올리게 하는 이름",
    meaning: "고운 인상과 단정한 분위기",
    story:
      "예쁘고 우아한 인상을 가진 아이에게 잘 어울리는 이름이에요.",
  },
  {
    name: "아몬",
    kinds: ["meaning"],
    moodTags: ["unique", "luxury"],
    regionTags: ["global"],
    petTypes: ["all"],
    genders: ["male", "all"],
    source: "신비로운 울림의 이름",
    meaning: "단단하고 존재감 있는 이미지",
    story:
      "묵직한 분위기와 독특한 매력을 함께 가진 아이에게 잘 어울리는 이름이에요.",
  },
];

function getTodayKey() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function uniqueCandidatesByName(items: NameCandidate[]) {
  const seen = new Set<string>();
  const result: NameCandidate[] = [];

  for (const item of items) {
    const key = `${item.name}|${item.source}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

function buildRecentHistoryKey(args: {
  kind: NameKind;
  style: NameStyle;
  petType: PetType;
  gender: PetGender;
}) {
  const { kind, style, petType, gender } = args;
  return `${kind}__${style}__${petType}__${gender}`;
}

async function getRecentNames(queryKey: string) {
  try {
    const raw = await AsyncStorage.getItem(NAME_RECOMMEND_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object" && Array.isArray(parsed[queryKey])) {
      return parsed[queryKey] as string[];
    }
    return [];
  } catch {
    return [];
  }
}

async function saveRecentNames(queryKey: string, names: string[]) {
  try {
    const raw = await AsyncStorage.getItem(NAME_RECOMMEND_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = parsed && typeof parsed === "object" ? parsed : {};
    const prevNames = Array.isArray(next[queryKey]) ? next[queryKey] : [];
    next[queryKey] = [...names, ...prevNames].slice(0, 30);
    await AsyncStorage.setItem(NAME_RECOMMEND_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // noop
  }
}

function filterByTypeGender(items: NameCandidate[], petType: PetType, gender: PetGender) {
  return items.filter((item) => {
    const typeMatch = item.petTypes.includes("all") || item.petTypes.includes(petType);
    const genderMatch = item.genders.includes("all") || item.genders.includes(gender);
    return typeMatch && genderMatch;
  });
}

function filterByRegion(items: NameCandidate[], style: NameStyle) {
  if (style !== "korean") return items;
  return items.filter((item) => item.regionTags.includes("korean"));
}

function filterByMood(items: NameCandidate[], style: NameStyle) {
  if (style === "korean") return items;
  return items.filter((item) => item.moodTags.includes(style));
}

function getFilteredCandidates(args: {
  kind: NameKind;
  style: NameStyle;
  petType: PetType;
  gender: PetGender;
}) {
  const { kind, style, petType, gender } = args;

  const sameKind = NAME_CANDIDATES.filter((item) => item.kinds.includes(kind));
  const sameKindSameRegion = filterByRegion(sameKind, style);

  const tier1 = filterByMood(
    filterByTypeGender(sameKindSameRegion, petType, gender),
    style
  );

  const tier2 = filterByTypeGender(sameKindSameRegion, petType, gender);

  const tier3 = filterByMood(sameKindSameRegion, style);

  const tier4 = sameKindSameRegion;

  // region이 너무 좁아서 결과가 적으면 같은 kind 내에서만 완화
  const tier5 = filterByMood(filterByTypeGender(sameKind, petType, gender), style);
  const tier6 = filterByTypeGender(sameKind, petType, gender);
  const tier7 = filterByMood(sameKind, style);
  const tier8 = sameKind;

  return uniqueCandidatesByName([
    ...tier1,
    ...tier2,
    ...tier3,
    ...tier4,
    ...tier5,
    ...tier6,
    ...tier7,
    ...tier8,
  ]);
}

async function buildNameRecommendations(args: {
  kind: NameKind;
  style: NameStyle;
  petType: PetType;
  gender: PetGender;
  requestCount: number;
}) {
  const { kind, style, petType, gender, requestCount } = args;

  const candidates = getFilteredCandidates({ kind, style, petType, gender });
  const queryKey = buildRecentHistoryKey({ kind, style, petType, gender });
  const recentNames = await getRecentNames(queryKey);

  const seed = hashString(
    `${kind}|${style}|${petType}|${gender}|${requestCount}|${getTodayKey()}`
  );

  const sorted = [...candidates].sort((a, b) => {
    const aScore = hashString(`${a.name}|${a.source}|${seed}`);
    const bScore = hashString(`${b.name}|${b.source}|${seed}`);
    return aScore - bScore;
  });

  const fresh = sorted.filter((item) => !recentNames.includes(item.name));
  const source = fresh.length >= 10 ? fresh : sorted;

  const picked = source.slice(0, 10).map((item) => ({
    name: item.name,
    source: item.source,
    meaning: item.meaning,
    story: item.story,
    tags: [tagLabelMap[kind], tagLabelMap[style]],
  }));

  await saveRecentNames(
    queryKey,
    picked.map((item) => item.name)
  );

  return picked;
}

export default function HomeScreen() {
  const [savedPets, setSavedPets] = useState<SavedPetProfile[]>([]);
  const [dailyCacheMap, setDailyCacheMap] = useState<
    Record<string, DailyFortuneCacheItem>
  >({});
  const [isLoadingSavedData, setIsLoadingSavedData] = useState(true);

  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<PetType>("dog");
  const [selectedGender, setSelectedGender] = useState<PetGender>("male");
  const [selectedKind, setSelectedKind] = useState<NameKind>("animation");
  const [selectedStyle, setSelectedStyle] = useState<NameStyle>("cute");
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [nameRequestCount, setNameRequestCount] = useState(0);
  const [recommendations, setRecommendations] = useState<RecommendedNameItem[]>([]);

  const loadSavedData = useCallback(async () => {
    try {
      const [savedPetsRaw, dailyCacheRaw] = await Promise.all([
        AsyncStorage.getItem(PET_STORAGE_KEY),
        AsyncStorage.getItem(DAILY_FORTUNE_CACHE_KEY),
      ]);

      const parsedPets: SavedPetProfile[] = savedPetsRaw
        ? JSON.parse(savedPetsRaw)
        : [];
      const pets = Array.isArray(parsedPets) ? parsedPets : [];
      setSavedPets(pets);

      const parsedCache = dailyCacheRaw ? JSON.parse(dailyCacheRaw) : {};
      setDailyCacheMap(
        parsedCache && typeof parsedCache === "object" ? parsedCache : {}
      );

      const currentPet = await AsyncStorage.getItem(CURRENT_PET_KEY);
      if (!currentPet && pets.length > 0) {
        await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(pets[0]));
      }
    } catch (error) {
      console.error("저장된 데이터를 불러오지 못했습니다.", error);
      setSavedPets([]);
      setDailyCacheMap({});
    } finally {
      setIsLoadingSavedData(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedData();
    }, [loadSavedData])
  );

  const savePetsToStorage = async (pets: SavedPetProfile[]) => {
    await AsyncStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pets));
    setSavedPets(pets);

    if (pets.length > 0) {
      await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(pets[0]));
    } else {
      await AsyncStorage.removeItem(CURRENT_PET_KEY);
    }
  };

  const handleSelectSavedPet = async (pet: SavedPetProfile) => {
    await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(pet));

    const todayKey = getTodayKey();
    const todayFortune = dailyCacheMap[pet.id];

    if (todayFortune && todayFortune.dateKey === todayKey) {
      router.push({
        pathname: "/(tabs)/result" as const,
        params: {
          petId: todayFortune.petId,
          petName: todayFortune.petName,
          petType: todayFortune.petType,
          petGender: todayFortune.petGender,
          isNeutered: todayFortune.isNeutered ? "true" : "false",
          breed: todayFortune.breed,
          birthDate: todayFortune.birthDate,
          birthTime: todayFortune.birthTime,
          summary: todayFortune.summary,
          health: todayFortune.health,
          appetite: todayFortune.appetite,
          mood: todayFortune.mood,
          caution: todayFortune.caution,
          luckyColor: todayFortune.luckyColor,
          luckyItem: todayFortune.luckyItem,
          recommendedAction: todayFortune.recommendedAction,
        },
      });
      return;
    }

    router.push({
      pathname: "/(tabs)/loading" as const,
      params: {
        petId: pet.id,
        petName: pet.petName,
        petType: pet.petType,
        petGender: pet.petGender,
        isNeutered: pet.isNeutered ? "true" : "false",
        breed: pet.breed,
        birthDate: pet.birthDate,
        birthTime: pet.birthTime,
      },
    });
  };

  const handleDeleteSavedPet = async (id: string) => {
    const targetPet = savedPets.find((pet) => pet.id === id);
    if (!targetPet) return;

    const runDelete = async () => {
      try {
        const updatedPets = savedPets.filter((pet) => pet.id !== id);

        const [historyRaw, dailyCacheRaw] = await Promise.all([
          AsyncStorage.getItem(FORTUNE_HISTORY_KEY),
          AsyncStorage.getItem(DAILY_FORTUNE_CACHE_KEY),
        ]);

        const parsedHistory = historyRaw ? JSON.parse(historyRaw) : [];
        const parsedDailyCache = dailyCacheRaw ? JSON.parse(dailyCacheRaw) : {};

        const updatedHistory = Array.isArray(parsedHistory)
          ? parsedHistory.filter((item: any) => item.petId !== id)
          : [];

        const updatedDailyCache: Record<string, DailyFortuneCacheItem> =
          parsedDailyCache && typeof parsedDailyCache === "object"
            ? (Object.fromEntries(
                Object.entries(
                  parsedDailyCache as Record<string, DailyFortuneCacheItem>
                ).filter(([key]) => key !== id)
              ) as Record<string, DailyFortuneCacheItem>)
            : {};

        await Promise.all([
          savePetsToStorage(updatedPets),
          AsyncStorage.setItem(
            FORTUNE_HISTORY_KEY,
            JSON.stringify(updatedHistory)
          ),
          AsyncStorage.setItem(
            DAILY_FORTUNE_CACHE_KEY,
            JSON.stringify(updatedDailyCache)
          ),
        ]);

        setDailyCacheMap(updatedDailyCache);
      } catch (error) {
        console.error("반려동물 삭제 실패", error);

        if (Platform.OS === "web") {
          window.alert("반려동물을 삭제하지 못했어요.");
        } else {
          Alert.alert("삭제 실패", "반려동물을 삭제하지 못했어요.");
        }
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `${targetPet.petName} 정보를 삭제할까요?\n운세 기록과 오늘 운세 데이터도 함께 삭제됩니다.`
      );

      if (confirmed) {
        await runDelete();
      }
      return;
    }

    Alert.alert(
      "반려동물 삭제",
      `${targetPet.petName} 정보를 삭제할까요?\n운세 기록과 오늘 운세 데이터도 함께 삭제됩니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            runDelete();
          },
        },
      ]
    );
  };

  const handleEditSavedPet = async (pet: SavedPetProfile) => {
    await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(pet));

    router.push({
      pathname: "/(tabs)/register",
      params: {
        editId: pet.id,
        petName: pet.petName,
        petType: pet.petType,
        petGender: pet.petGender,
        isNeutered: pet.isNeutered ? "true" : "false",
        breed: pet.breed,
        birthDate: pet.birthDate,
        birthTime: pet.birthTime,
        isBirthTimeKnown: pet.isBirthTimeKnown ? "true" : "false",
      },
    });
  };

  const handleRecommendNames = () => {
    setIsNameLoading(true);

    setTimeout(async () => {
      const next = await buildNameRecommendations({
        kind: selectedKind,
        style: selectedStyle,
        petType: selectedType,
        gender: selectedGender,
        requestCount: nameRequestCount,
      });

      setRecommendations(next);
      setNameRequestCount((prev) => prev + 1);
      setIsNameLoading(false);
    }, 3000);
  };

  const openNameModal = () => {
    setRecommendations([]);
    setIsNameLoading(false);
    setIsNameModalVisible(true);
  };

  const closeNameModal = () => {
    if (isNameLoading) return;
    setIsNameModalVisible(false);
  };

  const todayKey = getTodayKey();

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>FREE FORTUNE</Text>
          </View>

          <Text style={styles.heroTitle}>무료운세 🐾</Text>
          <Text style={styles.heroSubtitle}>
            등록된 우리 아이 카드를 눌러 오늘의 운세를 확인해보세요.
          </Text>
        </View>

        <SectionCard>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>등록된 우리 아이</Text>
            <Text style={styles.sectionCaption}>
              하루 1번 운세를 볼 수 있고, 본 뒤에는 오늘 결과를 다시 열 수 있어요.
            </Text>
          </View>

          {isLoadingSavedData ? (
            <Text style={styles.helperText}>저장된 목록을 불러오는 중...</Text>
          ) : savedPets.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>아직 등록된 아이가 없어요</Text>
              <Text style={styles.emptyDesc}>
                먼저 등록 탭에서 반려동물을 등록해 주세요.
              </Text>

              <AppButton
                title="아이 등록하기"
                onPress={() => router.push("/(tabs)/register")}
                variant="secondary"
              />
            </View>
          ) : (
            <>
              {savedPets.map((pet) => {
                const emoji = pet.petType === "cat" ? "🐱" : "🐶";
                const typeLabel = pet.petType === "cat" ? "고양이" : "강아지";
                const todayFortune = dailyCacheMap[pet.id];
                const hasViewedToday =
                  !!todayFortune && todayFortune.dateKey === todayKey;

                return (
                  <View key={pet.id} style={styles.savedPetCard}>
                    <Pressable
                      style={[
                        styles.savedPetMain,
                        hasViewedToday && styles.savedPetMainDone,
                      ]}
                      onPress={() => handleSelectSavedPet(pet)}
                    >
                      <View style={styles.savedPetTopRow}>
                        <Text style={styles.savedPetName}>
                          {emoji} {pet.petName}
                        </Text>

                        <View style={styles.savedPetTypeBadge}>
                          <Text style={styles.savedPetTypeBadgeText}>
                            {typeLabel}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.savedPetMeta}>{pet.breed}</Text>
                      <Text style={styles.savedPetMeta}>
                        생일 · {pet.birthDate}
                      </Text>
                      <Text style={styles.savedPetMeta}>
                        시간 · {pet.birthTime}
                      </Text>

                      <View style={styles.fortuneStatusRow}>
                        <View
                          style={[
                            styles.statusBadge,
                            hasViewedToday
                              ? styles.statusBadgeDone
                              : styles.statusBadgeReady,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              hasViewedToday
                                ? styles.statusBadgeTextDone
                                : styles.statusBadgeTextReady,
                            ]}
                          >
                            {hasViewedToday ? "오늘 운세 완료" : "오늘 운세 가능"}
                          </Text>
                        </View>

                        <Text style={styles.fortuneCTA}>
                          {hasViewedToday
                            ? "눌러서 오늘 결과 다시 보기"
                            : "눌러서 오늘 운세 보기"}
                        </Text>
                      </View>
                    </Pressable>

                    <View style={styles.savedPetActions}>
                      <View style={styles.actionHalf}>
                        <AppButton
                          title="수정"
                          onPress={() => handleEditSavedPet(pet)}
                          variant="secondary"
                        />
                      </View>

                      <View style={styles.actionHalf}>
                        <AppButton
                          title="삭제"
                          onPress={() => handleDeleteSavedPet(pet.id)}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}

              <View style={styles.bottomAddWrap}>
                <AppButton
                  title="아이 등록하기"
                  onPress={() => router.push("/(tabs)/register")}
                  variant="outline"
                />
              </View>
            </>
          )}
        </SectionCard>

        <SectionCard>
          <View style={styles.nameRecommendCard}>
            <View style={styles.nameRecommendTop}>
              <Text style={styles.nameRecommendEmoji}>✨</Text>
              <Text style={styles.nameRecommendTitle}>
                새로 가족이 된 아이, 이름이 필요하신가요?
              </Text>
            </View>

            <Text style={styles.nameRecommendDesc}>
              이름 종류와 분위기를 같이 반영해서
              {"\n"}
              스토리가 있는 이름을 추천해드려요.
            </Text>

            <View style={styles.nameRecommendButtonWrap}>
              <AppButton
                title="이름 추천받기"
                onPress={openNameModal}
                variant="secondary"
              />
            </View>
          </View>
        </SectionCard>
      </ScrollView>

      <Modal
        visible={isNameModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeNameModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleBox}>
                  <Text style={styles.modalTitle}>이름 추천 ✨</Text>
                  <Text style={styles.modalSubtitle}>
                    종류와 분위기를 함께 반영해서 이름 10개를 추천해드려요.
                  </Text>
                </View>

                <Pressable
                  style={styles.modalCloseButton}
                  onPress={closeNameModal}
                  disabled={isNameLoading}
                >
                  <Text style={styles.modalCloseText}>닫기</Text>
                </Pressable>
              </View>

              <Text style={styles.nameSectionTitle}>아이 종류</Text>
              <View style={styles.row}>
                <Pressable
                  style={[
                    styles.choiceButton,
                    selectedType === "dog" && styles.choiceButtonActive,
                  ]}
                  onPress={() => setSelectedType("dog")}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selectedType === "dog" && styles.choiceTextActive,
                    ]}
                  >
                    🐶 강아지
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.choiceButton,
                    selectedType === "cat" && styles.choiceButtonActive,
                  ]}
                  onPress={() => setSelectedType("cat")}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selectedType === "cat" && styles.choiceTextActive,
                    ]}
                  >
                    🐱 고양이
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.nameSectionTitle}>성별</Text>
              <View style={styles.row}>
                <Pressable
                  style={[
                    styles.choiceButton,
                    selectedGender === "male" && styles.choiceButtonActive,
                  ]}
                  onPress={() => setSelectedGender("male")}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selectedGender === "male" && styles.choiceTextActive,
                    ]}
                  >
                    남아
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.choiceButton,
                    selectedGender === "female" && styles.choiceButtonActive,
                  ]}
                  onPress={() => setSelectedGender("female")}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selectedGender === "female" && styles.choiceTextActive,
                    ]}
                  >
                    여아
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.nameSectionTitle}>이름 종류</Text>
              <View style={styles.chipWrap}>
                {KIND_OPTIONS.map((item) => {
                  const active = selectedKind === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setSelectedKind(item.key)}
                    >
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.nameSectionTitle}>원하는 분위기</Text>
              <View style={styles.chipWrap}>
                {STYLE_OPTIONS.map((style) => {
                  const active = selectedStyle === style.key;
                  return (
                    <Pressable
                      key={style.key}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setSelectedStyle(style.key)}
                    >
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {style.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.nameRecommendButtonWrap}>
                <AppButton
                  title={recommendations.length > 0 ? "다시 추천받기" : "이름 추천받기"}
                  onPress={handleRecommendNames}
                  variant="secondary"
                />
              </View>

              {isNameLoading && (
                <View style={styles.loadingCard}>
                  <Text style={styles.loadingEmoji}>
                    {selectedType === "dog" ? "🐶" : "🐱"}
                  </Text>
                  <ActivityIndicator size="large" color={COLORS.secondary} />
                  <Text style={styles.loadingTitle}>이름을 찾고 있어요...</Text>
                  <Text style={styles.loadingDesc}>
                    {selectedKind === "animation" &&
                      "선택한 분위기에 맞는 애니 · 영화 이름을 고르는 중..."}
                    {selectedKind === "art" &&
                      "선택한 분위기에 맞는 명화 · 예술 이름을 고르는 중..."}
                    {selectedKind === "myth" &&
                      "선택한 분위기에 맞는 신화 · 전설 이름을 고르는 중..."}
                    {selectedKind === "meaning" &&
                      "선택한 분위기에 맞는 의미형 이름을 고르는 중..."}
                  </Text>
                </View>
              )}

              {!isNameLoading && recommendations.length > 0 && (
                <View style={styles.recommendListWrap}>
                  <Text style={styles.recommendListTitle}>추천 이름 10개</Text>
                  <Text style={styles.recommendListSub}>
                    같은 조건이어도 최근 본 이름은 최대한 피해서 보여드려요.
                  </Text>

                  {recommendations.map((item, index) => (
                    <View key={`${item.name}-${index}`} style={styles.nameCard}>
                      <View style={styles.nameTopRow}>
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.nameValue}>{item.name}</Text>
                      </View>

                      <Text style={styles.nameSource}>{item.source}</Text>
                      <Text style={styles.nameMeaning}>의미 · {item.meaning}</Text>
                      <Text style={styles.nameStory}>{item.story}</Text>

                      <View style={styles.tagWrap}>
                        {item.tags.map((tag) => (
                          <View key={`${item.name}-${tag}`} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: 20,
    paddingBottom: 44,
    gap: 16,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    padding: 22,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: "#F5ECE5",
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  sectionCaption: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
  emptyBox: {
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  savedPetCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  savedPetMain: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 4,
  },
  savedPetMainDone: {
    backgroundColor: "#FFF8F0",
  },
  savedPetTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  savedPetName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },
  savedPetTypeBadge: {
    backgroundColor: COLORS.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  savedPetTypeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  savedPetMeta: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 18,
  },
  fortuneStatusRow: {
    marginTop: 12,
    gap: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeReady: {
    backgroundColor: "#EEF8EE",
  },
  statusBadgeDone: {
    backgroundColor: "#FFF1E4",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusBadgeTextReady: {
    color: "#2F7D32",
  },
  statusBadgeTextDone: {
    color: "#A85C1C",
  },
  fortuneCTA: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  savedPetActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionHalf: {
    flex: 1,
  },
  bottomAddWrap: {
    marginTop: 14,
  },
  nameRecommendCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 20,
    padding: 18,
  },
  nameRecommendTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameRecommendEmoji: {
    fontSize: 22,
  },
  nameRecommendTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 24,
  },
  nameRecommendDesc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  nameRecommendButtonWrap: {
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.34)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
  },
  modalContent: {
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  modalTitleBox: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.subText,
  },
  modalCloseButton: {
    backgroundColor: "#F3EAE2",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },
  nameSectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  choiceButtonActive: {
    backgroundColor: COLORS.accent,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B625C",
  },
  choiceTextActive: {
    color: COLORS.text,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#F7F2ED",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B625C",
  },
  chipTextActive: {
    color: COLORS.text,
  },
  loadingCard: {
    alignItems: "center",
    paddingVertical: 18,
    marginTop: 18,
    backgroundColor: "#FFFDFB",
    borderRadius: 18,
  },
  loadingEmoji: {
    fontSize: 34,
    marginBottom: 12,
  },
  loadingTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  loadingDesc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  recommendListWrap: {
    marginTop: 18,
  },
  recommendListTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  recommendListSub: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  nameCard: {
    backgroundColor: "#F7F2ED",
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  nameTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },
  nameValue: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },
  nameSource: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  nameMeaning: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
  },
  nameStory: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.subText,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: "#FFFDFB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.secondary,
  },
});