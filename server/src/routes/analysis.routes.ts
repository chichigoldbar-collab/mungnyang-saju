import { Router } from "express";
import { generateCompatibility } from "../services/compatibility-generator.service";

const router = Router();

router.post("/compatibility", (req, res) => {
  const { petName, petType, ownerName, ownerBirthDate } = req.body;

  const result = generateCompatibility({
    petName,
    petType,
    ownerName,
    ownerBirthDate,
  });

  res.json({
    success: true,
    data: result,
  });
});

export default router;