import express from "express";
import analysisRoutes from "./routes/analysis.routes";
import fortuneRouter from "./routes/fortune.routes";
import namesRoutes from "./routes/names.routes";
import premiumRoutes from "./routes/premium.routes";

const app = express();
const port = 4000;

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "server is running" });
});

app.use("/api/fortune", fortuneRouter);
app.use("/api/analysis", analysisRoutes);
app.use("/api/names", namesRoutes);
app.use("/api/premium", premiumRoutes);

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});


