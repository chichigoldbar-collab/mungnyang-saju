import { Router } from "express";
import { generateNamingAnalysis } from "../services/naming-generator.service";
import { generatePersonalityAnalysis } from "../services/personality-generator.service";

const router = Router();

router.post("/personality", (req, res) => {
  try {
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

    if (!petId || !petName || !petType || !petGender || !breed || !birthDate) {
      return res.status(400).json({
        success: false,
        message: "필수 값이 비어 있어요.",
      });
    }

    const result = generatePersonalityAnalysis({
      petId,
      petName,
      petType,
      petGender,
      isNeutered: Boolean(isNeutered),
      breed,
      birthDate,
      birthTime: birthTime ?? "",
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("성격분석 생성 실패", error);

    return res.status(500).json({
      success: false,
      message: "성격분석 결과를 생성하지 못했어요.",
    });
  }
});

router.post("/naming", (req, res) => {
  try {
    const { petName, petType, petGender, birthDate } = req.body;

    if (!petName || !petType || !petGender || !birthDate) {
      return res.status(400).json({
        success: false,
        message: "필수 값이 비어 있어요.",
      });
    }

    const result = generateNamingAnalysis({
      petName,
      petType,
      petGender,
      birthDate,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("작명풀이 생성 실패", error);

    return res.status(500).json({
      success: false,
      message: "작명풀이 결과를 생성하지 못했어요.",
    });
  }
});

export default router;