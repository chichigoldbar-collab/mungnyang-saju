import { Router } from "express";
import { getRecommendedNames } from "../services/name-recommend.service";

const router = Router();

router.post("/recommend", async (req, res) => {
  try {
    const { petType, gender, kind, style, limit } = req.body;

    if (!petType || !gender || !kind || !style) {
      return res.status(400).json({
        success: false,
        message: "petType, gender, kind, style 값이 필요해요.",
      });
    }

    const result = await getRecommendedNames({
      petType,
      gender,
      kind,
      style,
      limit: typeof limit === "number" ? limit : 10,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("이름 추천 라우트 오류", error);

    return res.status(500).json({
      success: false,
      message: "이름 추천을 불러오지 못했어요.",
    });
  }
});

export default router;