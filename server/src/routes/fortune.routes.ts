import { Router } from "express";
import { generateFortune } from "../services/fortune-generator.service";
import {
  addFortuneHistory,
  getRecentFortuneHistory,
} from "../services/fortune-history.service";

const router = Router();

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

router.post("/daily", (req, res) => {
  const {
    petId,
    petName,
    petType,
    petGender,
    isNeutered,
    breed,
    birthDate,
    birthTime,
  } = req.body;

  const recentHistory = getRecentFortuneHistory(String(petId), 7);

  const result = generateFortune({
    petId,
    petName,
    petType,
    petGender,
    isNeutered,
    breed,
    birthDate,
    birthTime,
    dateKey: getTodayKey(),
    recentHistory,
  });

  addFortuneHistory({
    petId: result.petId,
    dateKey: result.dateKey,
    summary: result.summary,
    health: result.health,
    appetite: result.appetite,
    mood: result.mood,
    caution: result.caution,
    luckyColor: result.luckyColor,
    luckyItem: result.luckyItem,
    recommendedAction: result.recommendedAction,
  });

  res.json({
    success: true,
    data: result,
  });
});

export default router;