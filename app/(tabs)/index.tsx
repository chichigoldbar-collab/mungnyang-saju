import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const summaryPool = [
  "오늘은 간식 욕심이 폭발하는 날 🍖",
  "집사 옆자리를 더 탐내는 하루예요 🐾",
  "애교 수치가 평소보다 높아졌어요 😳",
  "오늘은 장난기가 유난히 많은 날이에요 😈",
  "낯선 소리에 조금 예민할 수 있어요 💧",
];

const healthPool = [
  "무리한 활동보다는 가벼운 산책이 좋아요",
  "컨디션은 무난하지만 충분한 휴식이 필요해요",
  "너무 신나게 뛰기보다는 리듬 조절이 중요해요",
  "가벼운 놀이 정도가 딱 좋은 컨디션이에요",
  "오늘은 평소보다 피로를 빨리 느낄 수 있어요",
];

const appetitePool = [
  "평소보다 간식을 더 찾을 수 있어요",
  "입맛이 좋아 식사 집중도가 높아지는 날이에요",
  "간식 냄새에 유난히 민감하게 반응할 수 있어요",
  "오늘은 먹는 즐거움이 큰 하루예요",
  "입맛이 조금 까다로워질 수도 있어요",
];

const moodPool = [
  "애교가 많아지고 관심을 더 원해요",
  "혼자 있기보다 함께 있고 싶어 해요",
  "평소보다 차분하고 안정적인 기분이에요",
  "기분이 좋아 엉뚱한 행동을 할 수도 있어요",
  "작은 소리에도 예민하게 반응할 수 있어요",
];

const cautionPool = [
  "다른 친구 간식을 노릴 수 있어요",
  "산책 중 갑자기 흥분할 수 있으니 주의해 주세요",
  "낯선 소리에 놀라지 않게 편안한 환경이 좋아요",
  "오늘은 고집이 조금 세질 수 있어요",
  "장난이 과해져서 실수할 수 있으니 조심해 주세요",
];

type PetType = "dog" | "cat";
type PetGender = "male" | "female";

function pickRandom<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function generateFortune() {
  return {
    summary: pickRandom(summaryPool),
    health: pickRandom(healthPool),
    appetite: pickRandom(appetitePool),
    mood: pickRandom(moodPool),
    caution: pickRandom(cautionPool),
  };
}

function calculateAge(birthDate: string) {
  const trimmed = birthDate.trim();

  if (!trimmed) {
    return "나이 미입력";
  }

  const onlyNumbers = trimmed.replace(/\D/g, "");

  if (onlyNumbers.length !== 8) {
    return "생년월일 형식 확인";
  }

  const year = Number(onlyNumbers.slice(0, 4));
  const month = Number(onlyNumbers.slice(4, 6));
  const day = Number(onlyNumbers.slice(6, 8));

  if (!year || !month || !day) {
    return "생년월일 형식 확인";
  }

  const today = new Date();
  let age = today.getFullYear() - year;

  const hasNotHadBirthdayYet =
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day);

  if (hasNotHadBirthdayYet) {
    age -= 1;
  }

  if (age < 0) {
    return "생년월일 형식 확인";
  }

  return `${age}살`;
}

export default function HomeScreen() {
  const [petNameInput, setPetNameInput] = useState("");
  const [breedInput, setBreedInput] = useState("");
  const [birthDateInput, setBirthDateInput] = useState("");
  const [birthTimeInput, setBirthTimeInput] = useState("");

  const [selectedType, setSelectedType] = useState<PetType>("dog");
  const [selectedGender, setSelectedGender] = useState<PetGender>("male");
  const [isNeuteredInput, setIsNeuteredInput] = useState(false);
  const [isBirthTimeKnownInput, setIsBirthTimeKnownInput] = useState(false);

  const [petName, setPetName] = useState("코코");
  const [petType, setPetType] = useState<PetType>("dog");
  const [petBreed, setPetBreed] = useState("포메라니안");
  const [petAge, setPetAge] = useState("3살");
  const [petBirthDate, setPetBirthDate] = useState("2022.03.18");
  const [petGender, setPetGender] = useState<PetGender>("male");
  const [isNeutered, setIsNeutered] = useState(false);
  const [petBirthTime, setPetBirthTime] = useState("시간 모름");

  const [fortune, setFortune] = useState(generateFortune());

  const petEmoji = petType === "dog" ? "🐶" : "🐱";
  const petTypeLabel = petType === "dog" ? "강아지" : "고양이";
  const petGenderLabel = petGender === "male" ? "남아" : "여아";
  const neuteredLabel = isNeutered ? "중성화 완료" : "중성화 미완료";

  const handleRefreshFortune = () => {
    setFortune(generateFortune());
  };

  const handleRegisterPet = () => {
    if (!petNameInput.trim()) {
      return;
    }

    const finalAge = calculateAge(birthDateInput);
    const finalBreed =
      breedInput.trim() ||
      (selectedType === "dog" ? "견종 미입력" : "묘종 미입력");

    const finalBirthDate = birthDateInput.trim() || "생일 미입력";

    const finalBirthTime = isBirthTimeKnownInput
      ? birthTimeInput.trim() || "시간 미입력"
      : "시간 모름";

    setPetName(petNameInput.trim());
    setPetType(selectedType);
    setPetBreed(finalBreed);
    setPetAge(finalAge);
    setPetBirthDate(finalBirthDate);
    setPetGender(selectedGender);
    setIsNeutered(isNeuteredInput);
    setPetBirthTime(finalBirthTime);
    setFortune(generateFortune());

    setPetNameInput("");
    setBreedInput("");
    setBirthDateInput("");
    setBirthTimeInput("");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>멍냥사주 🐾</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>우리 아이 등록</Text>

        <Text style={styles.label}>이름</Text>
        <TextInput
          value={petNameInput}
          onChangeText={setPetNameInput}
          placeholder="반려동물 이름을 입력하세요"
          placeholderTextColor="#999"
          style={styles.input}
        />

        <Text style={styles.label}>종류</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[
              styles.typeButton,
              selectedType === "dog" && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedType("dog")}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === "dog" && styles.typeButtonTextActive,
              ]}
            >
              🐶 강아지
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.typeButton,
              selectedType === "cat" && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedType("cat")}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === "cat" && styles.typeButtonTextActive,
              ]}
            >
              🐱 고양이
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>성별</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[
              styles.typeButton,
              selectedGender === "male" && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedGender("male")}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedGender === "male" && styles.typeButtonTextActive,
              ]}
            >
              남아
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.typeButton,
              selectedGender === "female" && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedGender("female")}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedGender === "female" && styles.typeButtonTextActive,
              ]}
            >
              여아
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>중성화 여부</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[
              styles.typeButton,
              !isNeuteredInput && styles.typeButtonActive,
            ]}
            onPress={() => setIsNeuteredInput(false)}
          >
            <Text
              style={[
                styles.typeButtonText,
                !isNeuteredInput && styles.typeButtonTextActive,
              ]}
            >
              미완료
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.typeButton,
              isNeuteredInput && styles.typeButtonActive,
            ]}
            onPress={() => setIsNeuteredInput(true)}
          >
            <Text
              style={[
                styles.typeButtonText,
                isNeuteredInput && styles.typeButtonTextActive,
              ]}
            >
              완료
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>품종</Text>
        <TextInput
          value={breedInput}
          onChangeText={setBreedInput}
          placeholder={
            selectedType === "dog"
              ? "예: 포메라니안, 말티즈"
              : "예: 코숏, 페르시안"
          }
          placeholderTextColor="#999"
          style={styles.input}
        />

        <Text style={styles.label}>생년월일</Text>
        <TextInput
          value={birthDateInput}
          onChangeText={setBirthDateInput}
          placeholder="예: 2022.03.18 또는 20220318"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>태어난 시간</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[
              styles.typeButton,
              isBirthTimeKnownInput && styles.typeButtonActive,
            ]}
            onPress={() => setIsBirthTimeKnownInput(true)}
          >
            <Text
              style={[
                styles.typeButtonText,
                isBirthTimeKnownInput && styles.typeButtonTextActive,
              ]}
            >
              알아요
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.typeButton,
              !isBirthTimeKnownInput && styles.typeButtonActive,
            ]}
            onPress={() => setIsBirthTimeKnownInput(false)}
          >
            <Text
              style={[
                styles.typeButtonText,
                !isBirthTimeKnownInput && styles.typeButtonTextActive,
              ]}
            >
              몰라요
            </Text>
          </Pressable>
        </View>

        {isBirthTimeKnownInput && (
          <TextInput
            value={birthTimeInput}
            onChangeText={setBirthTimeInput}
            placeholder="예: 14:30"
            placeholderTextColor="#999"
            style={styles.input}
          />
        )}

        <Pressable style={styles.registerButton} onPress={handleRegisterPet}>
          <Text style={styles.registerButtonText}>아이 정보 등록하기</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.petName}>
          {petEmoji} {petName} ({petAge})
        </Text>
        <Text style={styles.petMeta}>
          {petTypeLabel} · {petBreed}
        </Text>
        <Text style={styles.birthText}>생일: {petBirthDate}</Text>
        <Text style={styles.birthText}>
          성별: {petGenderLabel} · {neuteredLabel}
        </Text>
        <Text style={styles.birthText}>태어난 시간: {petBirthTime}</Text>
      </View>

      <View style={styles.highlight}>
        <Text style={styles.highlightText}>{petName}의 오늘 한줄 운세</Text>
        <Text style={styles.summaryText}>{fortune.summary}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>💪 건강운</Text>
        <Text style={styles.text}>{fortune.health}</Text>

        <Text style={styles.section}>🍖 식욕운</Text>
        <Text style={styles.text}>{fortune.appetite}</Text>

        <Text style={styles.section}>😊 기분운</Text>
        <Text style={styles.text}>{fortune.mood}</Text>

        <Text style={styles.section}>⚠️ 주의</Text>
        <Text style={styles.text}>{fortune.caution}</Text>
      </View>

      <Pressable style={styles.button} onPress={handleRefreshFortune}>
        <Text style={styles.buttonText}>오늘 운세 다시 보기</Text>
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
    marginBottom: 10,
    color: "#2E2A27",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E2A27",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4D4641",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#2E2A27",
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#F2C7A5",
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B625C",
  },
  typeButtonTextActive: {
    color: "#2E2A27",
  },
  registerButton: {
    backgroundColor: "#2E2A27",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
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
  birthText: {
    marginTop: 6,
    fontSize: 13,
    color: "#8B8178",
  },
  highlight: {
    backgroundColor: "#FFE9D6",
    borderRadius: 20,
    padding: 16,
  },
  highlightText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8C5A3C",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E2A27",
    lineHeight: 26,
  },
  section: {
    marginTop: 10,
    fontWeight: "700",
    color: "#2E2A27",
  },
  text: {
    marginTop: 4,
    color: "#444",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#2E2A27",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});