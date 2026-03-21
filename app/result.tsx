import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PetType = "dog" | "cat";
type PetGender = "male" | "female";

type FortuneResult = {
  summary: string;
  health: string;
  appetite: string;
  mood: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
  recommendedAction: string;
};

type PremiumAccessState = {
  allAccess: boolean;
};

type FortuneHistoryItem = {
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

const PREMIUM_ACCESS_KEY = "mungnyang-premium-access";
const FORTUNE_HISTORY_KEY = "mungnyang-fortune-history";

const luckyColors = [
  "크림 베이지",
  "살구 피치",
  "버터 옐로우",
  "민트 그린",
  "라벤더 퍼플",
  "소프트 핑크",
  "하늘 블루",
  "코코아 브라운",
  "오프화이트",
  "올리브 그린",
];

const luckyItems = [
  "폭신한 담요",
  "좋아하는 간식 한 조각",
  "새 장난감",
  "익숙한 쿠션",
  "평소 쓰던 하네스",
  "부드러운 빗질 시간",
  "창가 햇살 자리",
  "산책 가방",
  "따뜻한 물그릇",
  "보호자 무릎",
];

const recommendedActions = [
  "오늘은 짧고 기분 좋은 놀이로 하루를 시작해 보세요.",
  "과한 자극보다 익숙한 루틴을 지켜주는 게 좋아요.",
  "사진 한 장 남길 만큼 편안한 순간을 만들어주세요.",
  "간식보다 교감 시간을 조금 더 길게 가져가 보세요.",
  "산책이나 놀이 뒤에 충분한 휴식 시간을 챙겨주세요.",
  "좋아하는 공간을 정돈해주면 안정감을 더 느낄 수 있어요.",
  "칭찬 한마디와 부드러운 터치가 큰 힘이 될 수 있어요.",
  "오늘은 속도보다 편안함을 우선해 주세요.",
];

const dogFortunePools = {
  male: {
    summary: [
      "오늘은 신나면 앞뒤 안 보고 달릴 수도 있는 날이에요. 산책길에서 평소보다 들뜬 반응을 보일 수 있으니 리드 조절을 조금 더 신경 써주세요 🐾",
      "간식과 산책 생각에 마음이 먼저 앞서는 하루예요. 좋아하는 냄새나 소리에 반응이 빨라져서 기대감이 얼굴에 바로 드러날 수 있어요 🍖",
      "집사 옆에서 에너지를 잔뜩 뽐내고 싶은 날이에요. 반응만 잘해줘도 기분이 크게 올라가면서 장난기까지 같이 살아날 수 있어요 😎",
      "몸보다 마음이 먼저 뛰어가는 날이에요. 좋아하는 사람과 함께 있을 때 유난히 신이 나서 존재감이 평소보다 커질 수 있어요.",
      "오늘은 새로운 자극에 대한 호기심이 강하게 올라오는 하루예요. 산책 중 냄새 맡는 시간이 길어질 수 있고, 낯선 물건에도 관심을 보일 수 있어요.",
    ],
    health: [
      "기운은 좋지만 흥분이 빨라질 수 있어 짧게 쉬어가는 게 좋아요. 놀고 난 뒤 물 마시는 시간까지 함께 챙겨주면 더 안정적이에요.",
      "가벼운 산책은 좋지만 과한 점프는 조금 조심해 주세요. 들뜬 상태에서 무리하면 피로가 늦게 올라올 수 있어요.",
      "활동량이 많은 날이라 수분 보충을 챙겨주면 좋아요. 기분이 좋다고 계속 움직이기보다 한 템포 쉬는 리듬이 필요해요.",
      "컨디션은 전체적으로 나쁘지 않지만, 신났을 때 자기 페이스를 놓칠 수 있어요. 짧고 안정적인 놀이가 더 잘 맞는 날이에요.",
      "몸은 가볍지만 기분이 앞서면 힘 조절이 어려워질 수 있어요. 실내에서도 미끄러운 바닥이나 좁은 공간은 조금 조심해 주세요.",
    ],
    appetite: [
      "간식 냄새를 평소보다 더 빠르게 눈치챌 수 있어요. 부엌이나 간식통 근처에서 기대감이 크게 올라갈 수 있어요.",
      "먹는 즐거움이 큰 날이라 식사 집중도가 높아질 수 있어요. 익숙한 메뉴라면 반응이 훨씬 더 좋아질 가능성이 있어요.",
      "배가 안 고파도 간식은 또 다른 문제일 수 있어요 🍖 오늘은 식사와 간식을 분리해서 생각하는 느낌이 강할 수 있어요.",
      "입맛이 전반적으로 좋은 편이라 먹는 속도가 빨라질 수 있어요. 너무 급하게 먹지 않도록 속도 조절을 도와주세요.",
      "간식에 대한 기대감이 커지는 날이에요. 보상 타이밍을 잘 잡으면 훈련이나 리액션에도 좋은 흐름이 만들어질 수 있어요.",
    ],
    mood: [
      "기분이 좋으면 장난과 애교가 동시에 늘어나는 편이에요. 리액션을 해줄수록 더 적극적으로 반응할 수 있어요.",
      "집사 반응이 좋을수록 더 신나게 들이댈 수 있어요. 칭찬 한 번에 기분이 크게 올라가는 하루예요.",
      "오늘은 칭찬에 유난히 잘 반응할 수 있어요. 표정이나 꼬리 움직임처럼 감정 표현이 눈에 띄게 커질 수 있어요.",
      "좋아하는 사람 곁에서 안정감과 흥분이 동시에 올라오는 날이에요. 붙어 있고 싶어 하면서도 가볍게 장난을 걸 수 있어요.",
      "기분 자체는 밝은 편이지만, 에너지가 넘치면 살짝 과해질 수 있어요. 중간중간 차분히 진정할 시간을 만들어주면 좋아요.",
    ],
    caution: [
      "산책 중 갑자기 흥분해서 방향을 바꿀 수 있어요. 시선이 빠르게 움직일 수 있으니 리드 줄 여유를 미리 살펴주세요.",
      "다른 친구 간식에 관심을 보일 수 있으니 주의해 주세요. 오늘은 먹을 것에 대한 집중이 평소보다 강할 수 있어요.",
      "신나면 힘 조절이 어려울 수 있어 실내에서도 조심이 필요해요. 가구 모서리나 미끄러운 바닥에서는 속도를 줄여주세요.",
      "좋아하는 상황이 생기면 기다리는 시간이 짧아질 수 있어요. 흥분이 높아질 때는 짧게 멈추는 신호를 써보는 게 좋아요.",
      "오늘은 재미있는 자극을 보면 바로 반응하려는 성향이 강해질 수 있어요. 산책 중 작은 변수에도 예민하게 움직일 수 있어요.",
    ],
  },
  female: {
    summary: [
      "오늘은 애교와 고집이 동시에 올라오는 사랑스러운 날이에요. 예쁘게 다가오다가도 마음에 안 들면 바로 태도를 바꿀 수 있어요 💕",
      "기분이 좋으면 한껏 귀여움을 발휘할 수 있는 하루예요. 좋아하는 사람에게 평소보다 더 자주 시선을 보내거나 가까이 오려 할 수 있어요 🐶",
      "집사 관심을 조용히, 하지만 확실하게 원하는 날이에요. 먼저 다가오진 않아도 관심이 줄어들면 서운함을 티 낼 수 있어요.",
      "오늘은 사랑받고 싶은 마음이 크게 올라오는 하루예요. 기분 좋을 때는 표정과 행동이 훨씬 부드럽고 풍부해질 수 있어요.",
      "애교와 섬세함이 함께 살아나는 날이에요. 반응이 좋으면 더 다정해지지만, 분위기가 어수선하면 쉽게 예민해질 수 있어요.",
    ],
    health: [
      "컨디션은 무난하지만 피곤하면 예민해질 수 있어요. 오래 놀기보다는 기분 좋을 정도에서 마무리하는 게 좋아요.",
      "너무 오래 놀기보다 중간중간 휴식 시간을 챙겨주세요. 오늘은 리듬이 편안할수록 컨디션도 안정적으로 유지될 수 있어요.",
      "오늘은 편안한 리듬으로 움직이는 게 더 잘 맞아요. 갑자기 에너지가 확 올라왔다가 금방 피로해질 수 있어요.",
      "몸 상태는 나쁘지 않지만 기분이 컨디션에 영향을 줄 수 있어요. 익숙한 환경에서 쉬는 시간이 더 중요하게 느껴질 수 있어요.",
      "무리한 활동보다는 산책과 휴식의 균형이 중요한 날이에요. 흥분이 올라오면 잠깐 쉬어가는 시간이 필요해요.",
    ],
    appetite: [
      "간식 취향이 조금 분명해질 수 있는 날이에요. 먹고 싶은 것과 아닌 것의 차이가 평소보다 또렷할 수 있어요.",
      "먹고 싶은 것과 아닌 것의 반응이 확실할 수 있어요. 익숙하고 좋아하는 간식에는 눈빛부터 달라질 수 있어요.",
      "입맛은 괜찮지만 익숙한 메뉴를 더 좋아할 가능성이 있어요. 낯선 맛보다 평소 좋아하던 메뉴가 안정감을 줄 수 있어요.",
      "식욕은 전반적으로 무난하지만, 기분에 따라 반응이 조금 달라질 수 있어요. 편안한 분위기에서 더 잘 먹을 수 있어요.",
      "좋아하는 간식에 대한 기대감은 높지만 식사 리듬은 조금 더 섬세할 수 있어요. 먹는 환경을 안정적으로 맞춰주세요.",
    ],
    mood: [
      "애정 표현이 많아지지만, 싫은 건 또 분명하게 표현할 수 있어요. 오늘은 좋고 싫음의 기준이 더 뚜렷할 수 있어요.",
      "좋아하는 사람에게 더 바짝 붙고 싶어질 수 있어요. 관심을 잘 주면 기분이 빠르게 풀리는 날이에요.",
      "기분이 좋으면 꼬리와 표정에서 티가 많이 나는 날이에요. 작은 칭찬에도 반응이 크게 돌아올 수 있어요.",
      "다정하고 부드러운 기분이 올라오지만, 분위기가 흐트러지면 예민함도 함께 따라올 수 있어요.",
      "오늘은 사랑받는다는 느낌이 중요해요. 반응을 잘 받아주면 더 편안하고 안정된 태도를 보일 수 있어요.",
    ],
    caution: [
      "오늘은 기분 상하는 포인트가 평소보다 빨리 올 수 있어요. 과한 장난이나 갑작스러운 터치는 조금 줄여주세요.",
      "너무 과한 장난은 부담스럽게 느낄 수 있어요. 귀엽다고 계속 반응을 요구하면 살짝 지칠 수 있어요.",
      "낯선 자극보다는 익숙한 분위기가 더 편안한 날이에요. 시끄러운 환경에서는 반응이 예민해질 수 있어요.",
      "좋아하는 것과 싫어하는 것의 차이가 커질 수 있어요. 컨디션을 살피면서 반응을 맞춰주는 게 중요해요.",
      "기분이 흔들릴 때는 혼자만의 시간이 필요할 수 있어요. 억지로 끌고 가기보다 먼저 안정되도록 도와주세요.",
    ],
  },
};

const catFortunePools = {
  male: {
    summary: [
      "오늘은 조용히 상황을 살피다가도 갑자기 움직일 수 있는 날이에요. 겉으로는 무심해 보여도 머릿속은 꽤 바쁘게 돌아갈 수 있어요 🐱",
      "혼자만의 시간과 관심받는 시간이 모두 필요한 하루예요. 다가왔다가도 다시 자기 자리로 돌아가는 패턴이 보일 수 있어요.",
      "겉으론 무심해 보여도 속으로는 꽤 많은 걸 체크하고 있어요. 주변 분위기와 사람의 움직임을 세심하게 살피는 날이에요.",
      "오늘은 자기 페이스를 더 지키고 싶어 하는 하루예요. 억지로 반응을 끌어내기보다 기다려주면 훨씬 편안해할 수 있어요.",
      "차분한 관찰자 모드가 강하게 올라오는 날이에요. 먼저 움직이진 않아도 마음 맞는 사람 곁은 조용히 지키고 싶어 할 수 있어요.",
    ],
    health: [
      "무리한 자극보다 편안한 휴식 환경이 더 중요해요. 오늘은 조용하고 안정적인 공간이 컨디션 유지에 큰 도움이 돼요.",
      "컨디션은 괜찮지만 시끄러운 환경은 피하는 게 좋아요. 작은 스트레스가 피로감으로 이어질 수 있어요.",
      "오늘은 에너지보다 안정감이 더 필요한 날일 수 있어요. 충분히 쉬고 자기 자리를 확보하는 게 중요해요.",
      "몸 상태는 무난해 보여도 감각적으로는 예민할 수 있어요. 낯선 자극을 줄여주는 게 훨씬 편안할 수 있어요.",
      "무리한 놀이는 크게 필요하지 않은 날이에요. 짧고 조용한 교감이 더 잘 맞을 수 있어요.",
    ],
    appetite: [
      "입맛이 조금 까다로워질 수 있으니 익숙한 메뉴가 좋아요. 낯선 향보다는 늘 먹던 패턴에서 안정감을 느낄 수 있어요.",
      "평소보다 먹는 템포가 느려질 수 있어요. 급하게 먹기보다 천천히 확인하며 먹는 모습이 보일 수 있어요.",
      "간식은 반응하지만 전체 식사는 취향을 탈 수 있어요. 선호가 분명해지는 하루예요.",
      "식욕은 나쁘지 않지만 분위기에 영향을 받을 수 있어요. 조용하고 편안할수록 더 안정적으로 먹을 수 있어요.",
      "먹고 싶은 의사는 있지만, 선택 기준이 까다로워질 수 있어요. 익숙한 맛이 더 잘 맞는 날이에요.",
    ],
    mood: [
      "혼자 있는 시간도 좋지만 마음 맞는 사람은 곁에 두고 싶어 해요. 가까이 오지는 않아도 시야 안에 두고 싶어할 수 있어요.",
      "원할 때만 다가오고 싶은 주도권 있는 날이에요. 스스로 정한 타이밍에 애정 표현이 나올 수 있어요.",
      "관심은 받고 싶지만 방식은 스스로 정하고 싶어 할 수 있어요. 지나친 터치보다는 존재감 있는 동행이 좋아요.",
      "기분은 차분하지만 마음이 열리면 은근한 애교가 나올 수 있어요. 조용한 교감이 더 크게 느껴지는 하루예요.",
      "오늘은 혼자만의 리듬을 존중받을수록 더 편안해질 수 있어요. 공간과 거리감이 중요해요.",
    ],
    caution: [
      "갑작스러운 소리나 터치에 예민하게 반응할 수 있어요. 먼저 인기척을 주고 다가가는 게 좋아요.",
      "낯선 환경에선 숨어서 지켜보려는 성향이 강해질 수 있어요. 안정될 시간을 충분히 주세요.",
      "기분이 바뀌는 타이밍을 잘 살펴주는 게 좋아요. 갑자기 다가오는 행동은 부담이 될 수 있어요.",
      "원하지 않는 접촉이 반복되면 거리감을 크게 둘 수 있어요. 오늘은 선택권을 존중하는 게 중요해요.",
      "시끄럽고 바쁜 분위기에서는 스트레스를 받기 쉬울 수 있어요. 조용한 공간이 회복에 더 잘 맞아요.",
    ],
  },
  female: {
    summary: [
      "오늘은 섬세한 기분 변화가 잘 드러나는 예민한 매력의 날이에요. 작은 변화에도 마음이 쉽게 움직일 수 있어요 ✨",
      "조용하지만 분명한 취향을 보여줄 수 있는 하루예요. 좋아하는 것과 불편한 것의 기준이 훨씬 또렷해질 수 있어요.",
      "좋아하는 건 확실히 좋아하고, 아닌 건 바로 티 낼 수 있어요. 감정 표현이 은근하지만 분명한 날이에요.",
      "기분의 결이 섬세하게 바뀌는 하루예요. 편안한 사람 곁에서는 다정하지만 낯선 분위기에서는 단호해질 수 있어요.",
      "오늘은 자기만의 취향과 기준이 크게 살아나는 날이에요. 억지로 맞추기보다 먼저 존중받을수록 더 부드러워질 수 있어요.",
    ],
    health: [
      "컨디션은 안정적이지만 편안한 공간이 중요해요. 스트레스가 적을수록 훨씬 좋은 흐름을 유지할 수 있어요.",
      "피곤함이 쌓이면 예민함으로 먼저 나타날 수 있어요. 활동보다 회복 환경을 챙겨주는 게 좋아요.",
      "자극이 적은 환경에서 더 편안함을 느낄 수 있어요. 오늘은 루틴이 흔들리지 않는 게 중요해요.",
      "몸 상태는 크게 나쁘지 않지만 감정 피로가 먼저 올 수 있어요. 조용하고 익숙한 공간에서 쉬게 해주세요.",
      "오늘은 안정감이 곧 컨디션으로 이어지는 날이에요. 익숙한 자리, 익숙한 시간대가 큰 도움이 돼요.",
    ],
    appetite: [
      "오늘은 입맛 기준이 조금 더 까다로워질 수 있어요. 먹는 양보다 무엇을 먹느냐가 더 중요할 수 있어요.",
      "먹는 양보다 먹는 분위기에 더 영향을 받을 수 있어요. 불편하면 입맛이 바로 줄 수 있어요.",
      "낯선 간식보다는 익숙한 맛이 더 잘 맞을 수 있어요. 익숙함이 안정감을 주는 날이에요.",
      "반응 자체는 있지만 취향이 분명하게 드러날 수 있어요. 오늘은 좋아하는 메뉴를 중심으로 맞춰주는 게 좋아요.",
      "식욕은 무난하지만 기분과 환경에 민감할 수 있어요. 조용한 분위기에서 더 편안하게 먹을 수 있어요.",
    ],
    mood: [
      "기분이 좋으면 조용히 곁에 와서 존재감을 드러낼 수 있어요. 큰 표현보다 은근한 애정이 살아나는 날이에요.",
      "관심받고 싶지만 너무 들이대는 건 부담스러울 수 있어요. 적당한 거리에서 다정함을 느끼고 싶어 해요.",
      "좋아하는 사람에게만 은근한 애교를 보일 수 있어요. 선택된 사람에게 더 따뜻한 반응이 나올 수 있어요.",
      "마음이 열리면 부드럽고 다정하지만, 불편함이 생기면 금방 거리감을 둘 수 있어요.",
      "오늘은 취향과 감정이 예민하게 살아나는 날이라, 편안함을 느끼는 대상에게 더 집중할 수 있어요.",
    ],
    caution: [
      "원치 않는 접촉에는 예민하게 반응할 수 있어요. 먼저 다가오도록 기다려주는 게 좋아요.",
      "낯선 냄새나 소리에 스트레스를 느낄 수 있어요. 변화가 큰 환경은 피하는 게 더 좋아요.",
      "오늘은 억지로 놀기보다 스스로 다가오게 두는 게 좋아요. 주도권을 존중할수록 안정돼요.",
      "불편함이 생기면 반응이 빠르게 차가워질 수 있어요. 컨디션과 기분을 먼저 읽어주세요.",
      "작은 자극이 크게 느껴질 수 있으니 조용한 분위기를 유지하는 게 중요해요.",
    ],
  },
};

function getPetVisual(petType: PetType, breed: string) {
  const lower = breed.toLowerCase();

  if (petType === "dog") {
    if (lower.includes("말티즈")) return "🐶";
    if (lower.includes("포메")) return "🐕";
    if (lower.includes("푸들")) return "🐩";
    if (lower.includes("시츄")) return "🐶";
    if (lower.includes("리트리버")) return "🦮";
    if (lower.includes("웰시")) return "🐕‍🦺";
    return "🐶";
  }

  if (petType === "cat") {
    if (lower.includes("코숏")) return "🐱";
    if (lower.includes("페르시안")) return "🐈";
    if (lower.includes("러시안")) return "🐈‍⬛";
    if (lower.includes("먼치킨")) return "🐱";
    if (lower.includes("스핑크스")) return "🐈";
    return "🐱";
  }

  return "🐾";
}

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function calculateAge(birthDate: string) {
  const onlyNumbers = birthDate.replace(/\D/g, "");

  if (onlyNumbers.length !== 8) {
    return "나이 미확인";
  }

  const year = Number(onlyNumbers.slice(0, 4));
  const month = Number(onlyNumbers.slice(4, 6));
  const day = Number(onlyNumbers.slice(6, 8));

  const today = new Date();
  let age = today.getFullYear() - year;

  const hasNotHadBirthdayYet =
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day);

  if (hasNotHadBirthdayYet) {
    age -= 1;
  }

  if (age < 0) {
    return "나이 미확인";
  }

  return `${age}살`;
}

function getFortunePool(petType: PetType, petGender: PetGender) {
  if (petType === "cat") {
    return petGender === "female"
      ? catFortunePools.female
      : catFortunePools.male;
  }
  return petGender === "female"
    ? dogFortunePools.female
    : dogFortunePools.male;
}

function generateFortune(
  petType: PetType,
  petGender: PetGender,
  isNeutered: boolean
): FortuneResult {
  const pool = getFortunePool(petType, petGender);

  const summaryBase = pickRandom(pool.summary);
  const healthBase = pickRandom(pool.health);
  const appetiteBase = pickRandom(pool.appetite);
  const moodBase = pickRandom(pool.mood);
  const cautionBase = pickRandom(pool.caution);

  const luckyColor = pickRandom(luckyColors);
  const luckyItem = pickRandom(luckyItems);
  const recommendedAction = pickRandom(recommendedActions);

  const summary = isNeutered
    ? `${summaryBase} 전반적으로는 비교적 안정된 흐름 안에서 기분 변화가 나타날 가능성이 커요.`
    : `${summaryBase} 오늘은 감정과 에너지가 생각보다 빠르게 올라올 수 있어요.`;

  const health = isNeutered
    ? `${healthBase} 무리하지 않고 자기 리듬을 지키면 더 편안하게 지나갈 수 있어요.`
    : `${healthBase} 활동 후에는 흥분이 길게 남지 않도록 쉬는 시간을 꼭 챙겨주세요.`;

  const appetite = `${appetiteBase} 먹는 반응을 잘 살피면 오늘의 기분 흐름도 함께 읽을 수 있어요.`;

  const mood = isNeutered
    ? `${moodBase} 전체적으로는 한 템포 차분한 반응으로 이어질 가능성도 있어요.`
    : `${moodBase} 오늘은 기분이 올라오면 표현도 함께 커질 수 있어요.`;

  const caution = isNeutered
    ? `${cautionBase} 무리하게 반응을 끌어내기보다는 편안한 흐름을 유지해 주세요.`
    : `${cautionBase} 오늘은 에너지 조절을 조금 더 신경 써주면 훨씬 안정적이에요.`;

  return {
    summary,
    health,
    appetite,
    mood,
    caution,
    luckyColor,
    luckyItem,
    recommendedAction,
  };
}

function getCharacterVisual(petType: PetType, petGender: PetGender) {
  if (petType === "cat") {
    return petGender === "female"
      ? {
          bg: "#F7D9E3",
          accent: "#C46F95",
        }
      : {
          bg: "#E7E1FF",
          accent: "#7560C9",
        };
  }

  return petGender === "female"
    ? {
        bg: "#FFE4D6",
        accent: "#CC7F58",
      }
    : {
        bg: "#DDF3E4",
        accent: "#4C8C5E",
      };
}

function makeInstagramCaption(args: {
  petName: string;
  petTypeLabel: string;
  breed: string;
  petGenderLabel: string;
  petAge: string;
  fortune: FortuneResult;
}) {
  const {
    petName,
    petTypeLabel,
    breed,
    petGenderLabel,
    petAge,
    fortune,
  } = args;

  return [
    `🔮 ${petName}의 오늘 운세`,
    ``,
    `${petTypeLabel} · ${breed} · ${petGenderLabel} · ${petAge}`,
    ``,
    `✨ 한줄 운세`,
    `${fortune.summary}`,
    ``,
    `💪 건강운`,
    `${fortune.health}`,
    ``,
    `🍖 식욕운`,
    `${fortune.appetite}`,
    ``,
    `😊 기분운`,
    `${fortune.mood}`,
    ``,
    `🎨 행운 컬러: ${fortune.luckyColor}`,
    `🎁 행운 아이템: ${fortune.luckyItem}`,
    `🌟 추천 행동: ${fortune.recommendedAction}`,
    ``,
    `#멍냥사주 #반려동물사주 #오늘의운세 #강아지운세 #고양이운세 #반려동물 #집사일상 #펫스타그램`,
  ].join("\n");
}

async function getStoredPremiumAccess(): Promise<PremiumAccessState> {
  try {
    const saved = await AsyncStorage.getItem(PREMIUM_ACCESS_KEY);

    if (!saved) {
      return {
        allAccess: false,
      };
    }

    const parsed = JSON.parse(saved);

    return {
      allAccess: Boolean(parsed.allAccess),
    };
  } catch (error) {
    console.error("프리미엄 상태 불러오기 실패", error);
    return {
      allAccess: false,
    };
  }
}

async function saveFortuneHistory(item: FortuneHistoryItem) {
  try {
    const saved = await AsyncStorage.getItem(FORTUNE_HISTORY_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const current = Array.isArray(parsed) ? parsed : [];
    const updated = [item, ...current].slice(0, 50);
    await AsyncStorage.setItem(FORTUNE_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("운세 기록 저장 실패", error);
  }
}

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const shareCardRef = useRef<View>(null);

  const petName = String(params.petName ?? "코코");
  const petType = String(params.petType ?? "dog") as PetType;
  const petGender = String(params.petGender ?? "male") as PetGender;
  const isNeutered = String(params.isNeutered ?? "false") === "true";
  const breed = String(params.breed ?? "품종 미입력");
  const birthDate = String(params.birthDate ?? "생일 미입력");
  const birthTime = String(params.birthTime ?? "시간 모름");

  const petEmoji = getPetVisual(petType, breed);
  const petTypeLabel = petType === "cat" ? "고양이" : "강아지";
  const petGenderLabel = petGender === "female" ? "여아" : "남아";
  const petAge = calculateAge(birthDate);
  const neuteredLabel = isNeutered ? "중성화 완료" : "중성화 미완료";
  const characterVisual = getCharacterVisual(petType, petGender);

  const [fortune] = useState(() =>
    generateFortune(petType, petGender, isNeutered)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSharingCaption, setIsSharingCaption] = useState(false);
  const [premiumAccess, setPremiumAccess] = useState<PremiumAccessState>({
    allAccess: false,
  });

  useEffect(() => {
    const loadPremiumAccess = async () => {
      const saved = await getStoredPremiumAccess();
      setPremiumAccess(saved);
    };

    loadPremiumAccess();
  }, []);

  useEffect(() => {
    const item: FortuneHistoryItem = {
      id: `${Date.now()}-${petName}`,
      createdAt: new Date().toISOString(),
      petName,
      petType,
      petGender,
      breed,
      age: petAge,
      summary: fortune.summary,
      health: fortune.health,
      appetite: fortune.appetite,
      mood: fortune.mood,
      caution: fortune.caution,
      luckyColor: fortune.luckyColor,
      luckyItem: fortune.luckyItem,
      recommendedAction: fortune.recommendedAction,
    };

    saveFortuneHistory(item);
  }, []);

  const instagramCaption = makeInstagramCaption({
    petName,
    petTypeLabel,
    breed,
    petGenderLabel,
    petAge,
    fortune,
  });

  const captureShareCard = async () => {
    if (!shareCardRef.current) {
      throw new Error("공유 카드 영역을 찾지 못했습니다.");
    }

    return await captureRef(shareCardRef, {
      format: "png",
      quality: 1,
    });
  };

  const handleSaveImage = async () => {
    try {
      setIsSaving(true);

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "사진 저장을 위해 앨범 접근 권한이 필요합니다.");
        return;
      }

      const uri = await captureShareCard();
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("저장 완료", "공유 카드가 사진첩에 저장되었습니다.");
    } catch (error) {
      console.error(error);
      Alert.alert("저장 실패", "이미지 저장 중 문제가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareImage = async () => {
    try {
      setIsSharing(true);

      const uri = await captureShareCard();
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert("공유 불가", "이 기기에서는 공유 기능을 사용할 수 없습니다.");
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: `${petName}의 오늘 운세 이미지 공유`,
        mimeType: "image/png",
        UTI: "public.png",
      });
    } catch (error) {
      console.error(error);
      Alert.alert("공유 실패", "이미지 공유 중 문제가 발생했습니다.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareCaption = async () => {
    try {
      setIsSharingCaption(true);

      await Share.share(
        {
          message: instagramCaption,
          title: `${petName}의 오늘 운세`,
        },
        {
          dialogTitle: `${petName}의 운세 문구 공유`,
        }
      );
    } catch (error) {
      console.error(error);
      Alert.alert("공유 실패", "문구 공유 중 문제가 발생했습니다.");
    } finally {
      setIsSharingCaption(false);
    }
  };

  const goToPremium = () => {
    router.push({
      pathname: "/premium" as const,
      params: {
        petName,
        petType,
        petGender,
        breed,
        birthDate,
        birthTime,
        isNeutered: isNeutered ? "true" : "false",
      },
    });
  };

  const goToPersonality = () => {
    router.push({
      pathname: "/personality" as const,
      params: {
        petName,
        petType,
        petGender,
        breed,
        birthDate,
        birthTime,
        isNeutered: isNeutered ? "true" : "false",
      },
    });
  };

  const goToNaming = () => {
    router.push({
      pathname: "/naming" as const,
      params: {
        petName,
        petType,
        petGender,
        breed,
        birthDate,
        birthTime,
        isNeutered: isNeutered ? "true" : "false",
      },
    });
  };

  const goToCompatibility = () => {
    router.push({
      pathname: "/compatibility" as const,
      params: {
        petName,
        petType,
        petGender,
        breed,
        birthDate,
        birthTime,
        isNeutered: isNeutered ? "true" : "false",
      },
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>멍냥사주 결과 🐾</Text>

      <View style={styles.infoCard}>
        <Text style={styles.petName}>
          {petEmoji} {petName} ({petAge})
        </Text>
        <Text style={styles.petMeta}>
          {petTypeLabel} · {breed}
        </Text>
        <Text style={styles.subText}>
          성별: {petGenderLabel} · {neuteredLabel}
        </Text>
        <Text style={styles.subText}>생일: {birthDate}</Text>
        <Text style={styles.subText}>태어난 시간: {birthTime}</Text>
      </View>

      <View
        ref={shareCardRef}
        collapsable={false}
        style={[
          styles.storyCard,
          {
            backgroundColor: characterVisual.bg,
            borderColor: characterVisual.accent,
          },
        ]}
      >
        <View style={styles.storyTop}>
          <View style={styles.storyBadge}>
            <Text
              style={[styles.storyBadgeText, { color: characterVisual.accent }]}
            >
              TODAY FORTUNE
            </Text>
          </View>
          <Text style={styles.storyEmoji}>{petEmoji}</Text>
        </View>

        <Text style={styles.storyTitle}>{petName}의 오늘 운세</Text>
        <Text style={styles.storyMeta}>
          {petTypeLabel} · {petGenderLabel} · {petAge}
        </Text>

        <View style={styles.storySummaryBox}>
          <Text style={styles.storySummary}>{fortune.summary}</Text>
        </View>

        <View style={styles.storyGrid}>
          <View style={styles.storyGridCard}>
            <Text style={styles.storyGridLabel}>건강운</Text>
            <Text style={styles.storyGridValue}>{fortune.health}</Text>
          </View>

          <View style={styles.storyGridCard}>
            <Text style={styles.storyGridLabel}>식욕운</Text>
            <Text style={styles.storyGridValue}>{fortune.appetite}</Text>
          </View>

          <View style={styles.storyGridCard}>
            <Text style={styles.storyGridLabel}>기분운</Text>
            <Text style={styles.storyGridValue}>{fortune.mood}</Text>
          </View>

          <View style={styles.storyGridCard}>
            <Text style={styles.storyGridLabel}>주의</Text>
            <Text style={styles.storyGridValue}>{fortune.caution}</Text>
          </View>
        </View>

        <View style={styles.storyBottomRow}>
          <View style={styles.storyMiniCard}>
            <Text style={styles.storyMiniLabel}>행운 컬러</Text>
            <Text style={styles.storyMiniValue}>{fortune.luckyColor}</Text>
          </View>

          <View style={styles.storyMiniCard}>
            <Text style={styles.storyMiniLabel}>행운 아이템</Text>
            <Text style={styles.storyMiniValue}>{fortune.luckyItem}</Text>
          </View>
        </View>

        <View style={styles.storyActionBox}>
          <Text style={styles.storyActionLabel}>오늘의 추천 행동</Text>
          <Text style={styles.storyActionText}>{fortune.recommendedAction}</Text>
        </View>

        <Text style={styles.storyFooter}>멍냥사주 🐾</Text>
      </View>

      <View style={styles.premiumHeader}>
        <Text style={styles.premiumHeaderTitle}>프리미엄 분석</Text>
        <Text style={styles.premiumHeaderSub}>
          {premiumAccess.allAccess
            ? "전체 기능이 열려 있어요"
            : "990원으로 모든 프리미엄 기능을 열 수 있어요"}
        </Text>
      </View>

      <Pressable
        style={
          premiumAccess.allAccess ? styles.unlockedButton : styles.lockedButton
        }
        onPress={premiumAccess.allAccess ? goToPersonality : goToPremium}
      >
        <View style={styles.lockedTextWrap}>
          <Text style={styles.lockedTitle}>
            {premiumAccess.allAccess
              ? "✨ 타고난 성격 분석 보기"
              : "🔒 타고난 성격 분석 보기"}
          </Text>
          <Text style={styles.lockedSub}>
            성향 3가지 · 보호자 팁 · 오행 무드
          </Text>
        </View>
        <Text
          style={premiumAccess.allAccess ? styles.unlockedBadge : styles.badge}
        >
          {premiumAccess.allAccess ? "OPEN" : "₩990"}
        </Text>
      </Pressable>

      <Pressable
        style={
          premiumAccess.allAccess ? styles.unlockedButton : styles.lockedButton
        }
        onPress={premiumAccess.allAccess ? goToNaming : goToPremium}
      >
        <View style={styles.lockedTextWrap}>
          <Text style={styles.lockedTitle}>
            {premiumAccess.allAccess
              ? "✨ 작명 풀이 / 이름 추천 보기"
              : "🔒 작명 풀이 / 이름 추천 보기"}
          </Text>
          <Text style={styles.lockedSub}>
            현재 이름 풀이 · 추천 이름 후보
          </Text>
        </View>
        <Text
          style={premiumAccess.allAccess ? styles.unlockedBadge : styles.badge}
        >
          {premiumAccess.allAccess ? "OPEN" : "₩990"}
        </Text>
      </Pressable>

      <Pressable
        style={
          premiumAccess.allAccess ? styles.unlockedButton : styles.lockedButton
        }
        onPress={premiumAccess.allAccess ? goToCompatibility : goToPremium}
      >
        <View style={styles.lockedTextWrap}>
          <Text style={styles.lockedTitle}>
            {premiumAccess.allAccess
              ? "✨ 보호자와의 궁합 보기"
              : "🔒 보호자와의 궁합 보기"}
          </Text>
          <Text style={styles.lockedSub}>
            궁합 점수 · 잘 맞는 포인트 · 관계 팁
          </Text>
        </View>
        <Text
          style={premiumAccess.allAccess ? styles.unlockedBadge : styles.badge}
        >
          {premiumAccess.allAccess ? "OPEN" : "₩990"}
        </Text>
      </Pressable>

      <View style={styles.actionColumn}>
        <Pressable
          style={styles.captionShareButton}
          onPress={handleShareCaption}
          disabled={isSharingCaption}
        >
          <Text style={styles.captionShareButtonText}>
            {isSharingCaption ? "문구 공유 중..." : "문구 + 해시태그 공유"}
          </Text>
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.saveButton}
            onPress={handleSaveImage}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "저장 중..." : "이미지 저장"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.shareButton}
            onPress={handleShareImage}
            disabled={isSharing}
          >
            <Text style={styles.shareButtonText}>
              {isSharing ? "공유 중..." : "이미지 공유"}
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.primaryButtonText}>다시 등록하기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F3",
  },
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2E2A27",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
  },
  petName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2A27",
  },
  petMeta: {
    marginTop: 4,
    color: "#777",
  },
  subText: {
    marginTop: 6,
    fontSize: 13,
    color: "#8B8178",
  },
  storyCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 2,
  },
  storyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storyBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  storyBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  storyEmoji: {
    fontSize: 34,
  },
  storyTitle: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: "800",
    color: "#2E2A27",
  },
  storyMeta: {
    marginTop: 6,
    fontSize: 13,
    color: "#6A615B",
  },
  storySummaryBox: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 16,
  },
  storySummary: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E2A27",
    lineHeight: 28,
  },
  storyGrid: {
    marginTop: 14,
    gap: 10,
  },
  storyGridCard: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 18,
    padding: 14,
  },
  storyGridLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8B8178",
    marginBottom: 6,
  },
  storyGridValue: {
    fontSize: 14,
    lineHeight: 22,
    color: "#2E2A27",
    fontWeight: "700",
  },
  storyBottomRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  storyMiniCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 18,
    padding: 14,
  },
  storyMiniLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8B8178",
    marginBottom: 6,
  },
  storyMiniValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E2A27",
    lineHeight: 22,
  },
  storyActionBox: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
  },
  storyActionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8B8178",
    marginBottom: 6,
  },
  storyActionText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#2E2A27",
    fontWeight: "700",
  },
  storyFooter: {
    marginTop: 16,
    alignSelf: "center",
    fontSize: 13,
    fontWeight: "800",
    color: "#5F5752",
  },
  premiumHeader: {
    marginTop: 4,
  },
  premiumHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E2A27",
  },
  premiumHeaderSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#8B8178",
  },
  lockedButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6D9CF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unlockedButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CFE7D3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lockedTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  lockedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E2A27",
  },
  lockedSub: {
    marginTop: 6,
    fontSize: 13,
    color: "#7A6F66",
    lineHeight: 18,
  },
  badge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8C5A3C",
    backgroundColor: "#FFE9D6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  unlockedBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E2A27",
    backgroundColor: "#DDF3E4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  actionColumn: {
    gap: 10,
  },
  captionShareButton: {
    backgroundColor: "#FFF0E4",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F2C7A5",
  },
  captionShareButtonText: {
    color: "#8C5A3C",
    fontSize: 15,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6D9CF",
  },
  saveButtonText: {
    color: "#2E2A27",
    fontSize: 15,
    fontWeight: "700",
  },
  shareButton: {
    flex: 1,
    backgroundColor: "#2E2A27",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#8C5A3C",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});