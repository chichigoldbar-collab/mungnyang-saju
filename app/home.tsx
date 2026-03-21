import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";
import type { PetGender, PetType } from "../types";

const PET_STORAGE_KEY = "mungnyang-pet-profiles";

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

const DOG_BREEDS = [
  "말티즈",
  "포메라니안",
  "푸들",
  "비숑",
  "치와와",
  "시츄",
  "골든리트리버",
  "웰시코기",
  "진돗개",
  "믹스견",
  "직접 입력",
];

const CAT_BREEDS = [
  "코리안숏헤어",
  "페르시안",
  "러시안블루",
  "브리티시숏헤어",
  "랙돌",
  "스코티시폴드",
  "샴",
  "먼치킨",
  "믹스묘",
  "직접 입력",
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 31 }, (_, i) => currentYear - i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);

function getDaysInMonth(year?: number, month?: number) {
  if (!year || !month) return [];
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
}

function parseBirthDateToParts(birthDate: string) {
  const onlyNumbers = birthDate.replace(/\D/g, "");
  if (onlyNumbers.length !== 8) {
    return {
      year: undefined,
      month: undefined,
      day: undefined,
    };
  }

  return {
    year: Number(onlyNumbers.slice(0, 4)),
    month: Number(onlyNumbers.slice(4, 6)),
    day: Number(onlyNumbers.slice(6, 8)),
  };
}

function parseBirthTimeToParts(birthTime: string) {
  const match = birthTime.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return {
      hour: undefined,
      minute: undefined,
    };
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

function formatBirthDate(year?: number, month?: number, day?: number) {
  if (!year || !month || !day) return "생일 미입력";
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}.${mm}.${dd}`;
}

function formatBirthTime(hour?: number, minute?: number) {
  if (hour === undefined || minute === undefined) return "시간 미입력";
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${hh}:${mm}`;
}

function getBreedOptions(type: PetType) {
  return type === "dog" ? DOG_BREEDS : CAT_BREEDS;
}

type SelectorType = "year" | "month" | "day" | "hour" | "minute" | null;

function SelectorModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  formatLabel,
}: {
  visible: boolean;
  title: string;
  options: Array<number | string>;
  selectedValue?: number | string;
  onSelect: (value: number | string) => void;
  onClose: () => void;
  formatLabel?: (value: number | string) => string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option) => {
              const isSelected = selectedValue === option;

              return (
                <Pressable
                  key={String(option)}
                  style={[
                    styles.modalOptionButton,
                    isSelected && styles.modalOptionButtonActive,
                  ]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextActive,
                    ]}
                  >
                    {formatLabel ? formatLabel(option) : String(option)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <AppButton title="닫기" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const [petName, setPetName] = useState("");
  const [customBreedInput, setCustomBreedInput] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");

  const [selectedType, setSelectedType] = useState<PetType>("dog");
  const [selectedGender, setSelectedGender] = useState<PetGender>("male");
  const [isNeutered, setIsNeutered] = useState(false);
  const [isBirthTimeKnown, setIsBirthTimeKnown] = useState(false);

  const [birthYear, setBirthYear] = useState<number | undefined>(undefined);
  const [birthMonth, setBirthMonth] = useState<number | undefined>(undefined);
  const [birthDay, setBirthDay] = useState<number | undefined>(undefined);

  const [birthHour, setBirthHour] = useState<number | undefined>(undefined);
  const [birthMinute, setBirthMinute] = useState<number | undefined>(undefined);

  const [savedPets, setSavedPets] = useState<SavedPetProfile[]>([]);
  const [isLoadingSavedData, setIsLoadingSavedData] = useState(true);

  const [selectorType, setSelectorType] = useState<SelectorType>(null);

  const breedOptions = useMemo(
    () => getBreedOptions(selectedType),
    [selectedType]
  );

  const dayOptions = useMemo(
    () => getDaysInMonth(birthYear, birthMonth),
    [birthYear, birthMonth]
  );

  useEffect(() => {
    loadSavedPets();
  }, []);

  useEffect(() => {
    const options = getBreedOptions(selectedType);
    if (!options.includes(selectedBreed)) {
      setSelectedBreed("");
      setCustomBreedInput("");
    }
  }, [selectedType]);

  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const maxDay = new Date(birthYear, birthMonth, 0).getDate();
      if (birthDay > maxDay) {
        setBirthDay(undefined);
      }
    }
  }, [birthYear, birthMonth, birthDay]);

  const loadSavedPets = async () => {
    try {
      const saved = await AsyncStorage.getItem(PET_STORAGE_KEY);

      if (!saved) {
        setSavedPets([]);
        return;
      }

      const parsed: SavedPetProfile[] = JSON.parse(saved);
      setSavedPets(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error("저장된 반려동물 목록을 불러오지 못했습니다.", error);
      setSavedPets([]);
    } finally {
      setIsLoadingSavedData(false);
    }
  };

  const savePetsToStorage = async (pets: SavedPetProfile[]) => {
    try {
      await AsyncStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pets));
      setSavedPets(pets);
    } catch (error) {
      console.error("반려동물 목록 저장 실패", error);
    }
  };

  const resetForm = () => {
    setPetName("");
    setCustomBreedInput("");
    setSelectedBreed("");
    setSelectedType("dog");
    setSelectedGender("male");
    setIsNeutered(false);
    setIsBirthTimeKnown(false);
    setBirthYear(undefined);
    setBirthMonth(undefined);
    setBirthDay(undefined);
    setBirthHour(undefined);
    setBirthMinute(undefined);
  };

  const getFinalBreed = () => {
    if (selectedBreed === "직접 입력") {
      return (
        customBreedInput.trim() ||
        (selectedType === "dog" ? "견종 미입력" : "묘종 미입력")
      );
    }

    return (
      selectedBreed ||
      (selectedType === "dog" ? "견종 미입력" : "묘종 미입력")
    );
  };

  const goToLoading = (payload: SavedPetProfile) => {
    router.push({
      pathname: "/loading" as const,
      params: {
        petName: payload.petName,
        petType: payload.petType,
        petGender: payload.petGender,
        isNeutered: payload.isNeutered ? "true" : "false",
        breed: payload.breed,
        birthDate: payload.birthDate,
        birthTime: payload.birthTime,
      },
    });
  };

  const handleGoResult = async () => {
    if (!petName.trim()) {
      return;
    }

    const finalBreed = getFinalBreed();
    const finalBirthDate = formatBirthDate(birthYear, birthMonth, birthDay);
    const finalBirthTime = isBirthTimeKnown
      ? formatBirthTime(birthHour, birthMinute)
      : "시간 모름";

    const payload: SavedPetProfile = {
      id: petName.trim().toLowerCase(),
      petName: petName.trim(),
      petType: selectedType,
      petGender: selectedGender,
      isNeutered,
      breed: finalBreed,
      birthDate: finalBirthDate,
      birthTime: finalBirthTime,
      isBirthTimeKnown,
    };

    const existingIndex = savedPets.findIndex((pet) => pet.id === payload.id);

    let updatedPets: SavedPetProfile[] = [];

    if (existingIndex >= 0) {
      updatedPets = [...savedPets];
      updatedPets[existingIndex] = payload;
    } else {
      updatedPets = [payload, ...savedPets];
    }

    await savePetsToStorage(updatedPets);
    goToLoading(payload);
  };

  const handleSelectSavedPet = (pet: SavedPetProfile) => {
    goToLoading(pet);
  };

  const handleEditSavedPet = (pet: SavedPetProfile) => {
    setPetName(pet.petName);
    setSelectedType(pet.petType);
    setSelectedGender(pet.petGender);
    setIsNeutered(pet.isNeutered);

    const breedOptionsForType = getBreedOptions(pet.petType);
    if (breedOptionsForType.includes(pet.breed)) {
      setSelectedBreed(pet.breed);
      setCustomBreedInput("");
    } else {
      setSelectedBreed("직접 입력");
      setCustomBreedInput(
        pet.breed === "견종 미입력" || pet.breed === "묘종 미입력"
          ? ""
          : pet.breed
      );
    }

    const parsedBirth = parseBirthDateToParts(pet.birthDate);
    setBirthYear(parsedBirth.year);
    setBirthMonth(parsedBirth.month);
    setBirthDay(parsedBirth.day);

    const parsedTime = parseBirthTimeToParts(pet.birthTime);
    setBirthHour(parsedTime.hour);
    setBirthMinute(parsedTime.minute);

    setIsBirthTimeKnown(pet.isBirthTimeKnown);
  };

  const handleDeleteSavedPet = async (id: string) => {
    const updatedPets = savedPets.filter((pet) => pet.id !== id);
    await savePetsToStorage(updatedPets);
  };

  const birthDateLabel =
    birthYear && birthMonth && birthDay
      ? `${birthYear}년 ${birthMonth}월 ${birthDay}일`
      : "년 / 월 / 일을 선택하세요";

  const birthTimeLabel =
    birthHour !== undefined && birthMinute !== undefined
      ? `${String(birthHour).padStart(2, "0")}시 ${String(birthMinute).padStart(
          2,
          "0"
        )}분`
      : "시 / 분을 선택하세요";

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>MVP</Text>
          </View>

          <Text style={styles.heroTitle}>멍냥사주 🐾</Text>
          <Text style={styles.heroSubtitle}>
            우리 아이의 오늘 기분, 식욕, 건강운을 가볍고 재미있게 확인해보세요.
          </Text>

          <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoPill}>
              <Text style={styles.heroInfoPillText}>오늘 운세</Text>
            </View>
            <View style={styles.heroInfoPill}>
              <Text style={styles.heroInfoPillText}>성격 분석</Text>
            </View>
            <View style={styles.heroInfoPill}>
              <Text style={styles.heroInfoPillText}>궁합 / 작명</Text>
            </View>
          </View>
        </View>

        <AppButton
          title="운세 기록 보기"
          onPress={() => router.push("/history")}
          variant="outline"
        />

        <SectionCard>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>우리 아이 등록</Text>
            <Text style={styles.sectionCaption}>
              프로필을 만들어 운세를 바로 볼 수 있어요
            </Text>
          </View>

          <Text style={styles.label}>이름</Text>
          <TextInput
            value={petName}
            onChangeText={setPetName}
            placeholder="반려동물 이름을 입력하세요"
            placeholderTextColor="#999"
            style={styles.input}
          />

          <Text style={styles.label}>종류</Text>
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

          <Text style={styles.label}>성별</Text>
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

          <Text style={styles.label}>중성화 여부</Text>
          <View style={styles.row}>
            <Pressable
              style={[
                styles.choiceButton,
                !isNeutered && styles.choiceButtonActive,
              ]}
              onPress={() => setIsNeutered(false)}
            >
              <Text
                style={[
                  styles.choiceText,
                  !isNeutered && styles.choiceTextActive,
                ]}
              >
                미완료
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.choiceButton,
                isNeutered && styles.choiceButtonActive,
              ]}
              onPress={() => setIsNeutered(true)}
            >
              <Text
                style={[
                  styles.choiceText,
                  isNeutered && styles.choiceTextActive,
                ]}
              >
                완료
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>품종</Text>
          <View style={styles.chipWrap}>
            {breedOptions.map((breed) => {
              const active = selectedBreed === breed;

              return (
                <Pressable
                  key={breed}
                  style={[styles.breedChip, active && styles.breedChipActive]}
                  onPress={() => setSelectedBreed(breed)}
                >
                  <Text
                    style={[
                      styles.breedChipText,
                      active && styles.breedChipTextActive,
                    ]}
                  >
                    {breed}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedBreed === "직접 입력" && (
            <TextInput
              value={customBreedInput}
              onChangeText={setCustomBreedInput}
              placeholder={
                selectedType === "dog"
                  ? "견종을 직접 입력하세요"
                  : "묘종을 직접 입력하세요"
              }
              placeholderTextColor="#999"
              style={[styles.input, styles.extraInput]}
            />
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>생년월일</Text>
            <View style={styles.birthRow}>
              <Pressable
                style={styles.dateSelectButton}
                onPress={() => setSelectorType("year")}
              >
                <Text style={styles.dateSelectLabel}>
                  {birthYear ? `${birthYear}년` : "년 선택"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.dateSelectButton}
                onPress={() => setSelectorType("month")}
              >
                <Text style={styles.dateSelectLabel}>
                  {birthMonth ? `${birthMonth}월` : "월 선택"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.dateSelectButton}
                onPress={() => setSelectorType("day")}
              >
                <Text style={styles.dateSelectLabel}>
                  {birthDay ? `${birthDay}일` : "일 선택"}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.selectedDateText}>{birthDateLabel}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>태어난 시간</Text>
            <View style={styles.row}>
              <Pressable
                style={[
                  styles.choiceButton,
                  isBirthTimeKnown && styles.choiceButtonActive,
                ]}
                onPress={() => setIsBirthTimeKnown(true)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    isBirthTimeKnown && styles.choiceTextActive,
                  ]}
                >
                  알아요
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.choiceButton,
                  !isBirthTimeKnown && styles.choiceButtonActive,
                ]}
                onPress={() => setIsBirthTimeKnown(false)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    !isBirthTimeKnown && styles.choiceTextActive,
                  ]}
                >
                  몰라요
                </Text>
              </Pressable>
            </View>

            {isBirthTimeKnown && (
              <>
                <View style={styles.birthRow}>
                  <Pressable
                    style={styles.dateSelectButton}
                    onPress={() => setSelectorType("hour")}
                  >
                    <Text style={styles.dateSelectLabel}>
                      {birthHour !== undefined
                        ? `${String(birthHour).padStart(2, "0")}시`
                        : "시 선택"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.dateSelectButton}
                    onPress={() => setSelectorType("minute")}
                  >
                    <Text style={styles.dateSelectLabel}>
                      {birthMinute !== undefined
                        ? `${String(birthMinute).padStart(2, "0")}분`
                        : "분 선택"}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.selectedDateText}>{birthTimeLabel}</Text>
              </>
            )}
          </View>

          <View style={styles.formButtonRow}>
            <View style={styles.formButtonHalf}>
              <AppButton title="운세 보러 가기" onPress={handleGoResult} />
            </View>
            <View style={styles.formButtonHalf}>
              <AppButton
                title="입력 초기화"
                onPress={resetForm}
                variant="outline"
              />
            </View>
          </View>
        </SectionCard>

        <SectionCard>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>등록된 우리 아이</Text>
            <Text style={styles.sectionCaption}>
              저장된 아이를 눌러 바로 운세를 확인할 수 있어요
            </Text>
          </View>

          {isLoadingSavedData ? (
            <Text style={styles.helperText}>저장된 목록을 불러오는 중...</Text>
          ) : savedPets.length === 0 ? (
            <Text style={styles.helperText}>아직 등록된 반려동물이 없어요.</Text>
          ) : (
            savedPets.map((pet) => {
              const emoji = pet.petType === "cat" ? "🐱" : "🐶";
              const typeLabel = pet.petType === "cat" ? "고양이" : "강아지";

              return (
                <View key={pet.id} style={styles.savedPetCard}>
                  <Pressable
                    style={styles.savedPetMain}
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
            })
          )}
        </SectionCard>
      </ScrollView>

      <SelectorModal
        visible={selectorType === "year"}
        title="년 선택"
        options={YEAR_OPTIONS}
        selectedValue={birthYear}
        onSelect={(value) => setBirthYear(Number(value))}
        onClose={() => setSelectorType(null)}
        formatLabel={(value) => `${value}년`}
      />

      <SelectorModal
        visible={selectorType === "month"}
        title="월 선택"
        options={MONTH_OPTIONS}
        selectedValue={birthMonth}
        onSelect={(value) => setBirthMonth(Number(value))}
        onClose={() => setSelectorType(null)}
        formatLabel={(value) => `${value}월`}
      />

      <SelectorModal
        visible={selectorType === "day"}
        title="일 선택"
        options={dayOptions}
        selectedValue={birthDay}
        onSelect={(value) => setBirthDay(Number(value))}
        onClose={() => setSelectorType(null)}
        formatLabel={(value) => `${value}일`}
      />

      <SelectorModal
        visible={selectorType === "hour"}
        title="시 선택"
        options={HOUR_OPTIONS}
        selectedValue={birthHour}
        onSelect={(value) => setBirthHour(Number(value))}
        onClose={() => setSelectorType(null)}
        formatLabel={(value) => `${String(Number(value)).padStart(2, "0")}시`}
      />

      <SelectorModal
        visible={selectorType === "minute"}
        title="분 선택"
        options={MINUTE_OPTIONS}
        selectedValue={birthMinute}
        onSelect={(value) => setBirthMinute(Number(value))}
        onClose={() => setSelectorType(null)}
        formatLabel={(value) => `${String(Number(value)).padStart(2, "0")}분`}
      />
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
  heroInfoRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 16,
  },
  heroInfoPill: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroInfoPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
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
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4D4641",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  extraInput: {
    marginTop: 10,
  },
  fieldGroup: {
    marginTop: 4,
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
  breedChip: {
    backgroundColor: "#F7F2ED",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  breedChipActive: {
    backgroundColor: COLORS.accent,
  },
  breedChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B625C",
  },
  breedChipTextActive: {
    color: COLORS.text,
  },
  birthRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateSelectButton: {
    flex: 1,
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  dateSelectLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  selectedDateText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  formButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  formButtonHalf: {
    flex: 1,
  },
  savedPetCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  savedPetMain: {
    marginBottom: 12,
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
  savedPetActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionHalf: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  modalList: {
    marginBottom: 14,
  },
  modalOptionButton: {
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  modalOptionButtonActive: {
    backgroundColor: COLORS.accent,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalOptionTextActive: {
    color: COLORS.text,
  },
});