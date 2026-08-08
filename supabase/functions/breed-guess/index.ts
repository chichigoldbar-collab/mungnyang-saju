import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const TOSS_ALLOWED_ORIGINS = new Set([
  "https://ganadna.apps.tossmini.com",
  "https://ganadna.private-apps.tossmini.com",
]);

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": TOSS_ALLOWED_ORIGINS.has(origin) ? origin : "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

const DEFAULT_MODEL_ENDPOINT =
  "https://router.huggingface.co/hf-inference/models/prithivMLmods/Dog-Breed-120";
const DEFAULT_CAT_MODEL_ENDPOINT =
  "https://api-inference.huggingface.co/models/dima806/cat_breed_image_detection";
// 전용 모델 서버가 슬립 상태에서 깨어나는 시간까지 고려합니다.
// 기존 7초 제한은 정상 추론도 중간에 취소시키는 경우가 있었습니다.
const HF_REQUEST_TIMEOUT_MS = 25_000;
const HF_MAX_ATTEMPTS = 2;

const BREED_KO_MAP: Record<string, string> = {
  affenpinscher: "아펜핀셔",
  "afghan hound": "아프간하운드",
  "afghan_hound": "아프간하운드",
  airedale: "에어데일테리어",
  "airedale terrier": "에어데일테리어",
  "akita": "아키타",
  "alaskan malamute": "알래스칸말라뮤트",
  "alaskan_malamute": "알래스칸말라뮤트",
  "american staffordshire terrier": "아메리칸스태퍼드셔테리어",
  "american_staffordshire_terrier": "아메리칸스태퍼드셔테리어",
  basenji: "바센지",
  basset: "바셋하운드",
  "basset hound": "바셋하운드",
  beagle: "비글",
  "bedlington terrier": "베들링턴테리어",
  "bedlington_terrier": "베들링턴테리어",
  "bernese mountain dog": "버니즈마운틴독",
  "bernese_mountain_dog": "버니즈마운틴독",
  "black-and-tan coonhound": "블랙앤탄쿤하운드",
  "black_and_tan_coonhound": "블랙앤탄쿤하운드",
  bloodhound: "블러드하운드",
  bluetick: "블루틱쿤하운드",
  "border collie": "보더콜리",
  "border_collie": "보더콜리",
  "border terrier": "보더테리어",
  "border_terrier": "보더테리어",
  borzoi: "보르조이",
  "boston bull": "보스턴테리어",
  "boston terrier": "보스턴테리어",
  "boston_bull": "보스턴테리어",
  bouvier: "부비에데플랑드르",
  boxer: "복서",
  "brabancon griffon": "브뤼셀그리폰",
  "brabancon_griffon": "브뤼셀그리폰",
  briard: "브리아드",
  brittany: "브리타니스파니엘",
  "brittany spaniel": "브리타니스파니엘",
  "brittany_spaniel": "브리타니스파니엘",
  "bull mastiff": "불마스티프",
  bullmastiff: "불마스티프",
  "cairn terrier": "케언테리어",
  cairn: "케언테리어",
  cardigan: "웰시코기 카디건",
  "chesapeake bay retriever": "체서피크베이리트리버",
  "chesapeake_bay_retriever": "체서피크베이리트리버",
  chihuahua: "치와와",
  "chow chow": "차우차우",
  chow: "차우차우",
  "clumber spaniel": "클럼버스파니엘",
  clumber: "클럼버스파니엘",
  "cocker spaniel": "코카스파니엘",
  "cocker_spaniel": "코카스파니엘",
  collie: "콜리",
  "curly-coated retriever": "컬리코티드리트리버",
  "curly-coated_retriever": "컬리코티드리트리버",
  "dandie dinmont": "댄디딘몬트테리어",
  "dandie_dinmont": "댄디딘몬트테리어",
  dhole: "돌",
  dingo: "딩고",
  "doberman pinscher": "도베르만",
  doberman: "도베르만",
  "english foxhound": "잉글리시폭스하운드",
  "english_foxhound": "잉글리시폭스하운드",
  "english setter": "잉글리시세터",
  "english_setter": "잉글리시세터",
  "english springer": "잉글리시스프링거스파니엘",
  "english_springer": "잉글리시스프링거스파니엘",
  entlebucher: "엔틀부허마운틴독",
  "eskimo dog": "에스키모독",
  "eskimo_dog": "에스키모독",
  "flat-coated retriever": "플랫코티드리트리버",
  "flat coated retriever": "플랫코티드리트리버",
  "flat-coated_retriever": "플랫코티드리트리버",
  "french bulldog": "프렌치불도그",
  "french_bulldog": "프렌치불도그",
  "german shepherd": "저먼셰퍼드",
  "german_shepherd": "저먼셰퍼드",
  "german short-haired pointer": "저먼쇼트헤어드포인터",
  "german_short-haired_pointer": "저먼쇼트헤어드포인터",
  "giant schnauzer": "자이언트슈나우저",
  "giant_schnauzer": "자이언트슈나우저",
  "golden retriever": "골든리트리버",
  "golden_retriever": "골든리트리버",
  "gordon setter": "고든세터",
  "gordon_setter": "고든세터",
  "great dane": "그레이트데인",
  "great_dane": "그레이트데인",
  "great pyrenees": "그레이트피레니즈",
  "great_pyrenees": "그레이트피레니즈",
  "greater swiss mountain dog": "그레이터스위스마운틴독",
  "greater_swiss_mountain_dog": "그레이터스위스마운틴독",
  groenendael: "그로넨달",
  "ibizan hound": "이비전하운드",
  "ibizan_hound": "이비전하운드",
  "irish setter": "아이리시세터",
  "irish_setter": "아이리시세터",
  "irish terrier": "아이리시테리어",
  "irish_terrier": "아이리시테리어",
  "irish water spaniel": "아이리시워터스파니엘",
  "irish_water_spaniel": "아이리시워터스파니엘",
  "irish wolfhound": "아이리시울프하운드",
  "irish_wolfhound": "아이리시울프하운드",
  "italian greyhound": "이탈리안그레이하운드",
  "italian_greyhound": "이탈리안그레이하운드",
  "japanese spaniel": "재패니즈친",
  "japanese_spaniel": "재패니즈친",
  keeshond: "키스혼드",
  kelpie: "켈피",
  komondor: "코몬도르",
  kuvasz: "쿠바스",
  labrador: "래브라도리트리버",
  "labrador retriever": "래브라도리트리버",
  "labrador_retriever": "래브라도리트리버",
  leonberg: "레온베르거",
  "lhasa apso": "라사압소",
  lhasa: "라사압소",
  malamute: "알래스칸말라뮤트",
  malinois: "말리노이즈",
  maltese: "말티즈",
  "maltese dog": "말티즈",
  "maltese_dog": "말티즈",
  "mexican hairless": "멕시칸헤어리스",
  "mexican_hairless": "멕시칸헤어리스",
  "miniature pinscher": "미니어처핀셔",
  "miniature_pinscher": "미니어처핀셔",
  "miniature poodle": "미니어처푸들",
  "miniature_poodle": "미니어처푸들",
  "miniature schnauzer": "미니어처슈나우저",
  "miniature_schnauzer": "미니어처슈나우저",
  "newfoundland": "뉴펀들랜드",
  "norfolk terrier": "노퍽테리어",
  "norfolk_terrier": "노퍽테리어",
  "norwegian elkhound": "노르웨이엘크하운드",
  "norwegian_elkhound": "노르웨이엘크하운드",
  "norwich terrier": "노리치테리어",
  "norwich_terrier": "노리치테리어",
  "old english sheepdog": "올드잉글리시쉽독",
  "old_english_sheepdog": "올드잉글리시쉽독",
  otterhound: "오터하운드",
  papillon: "파피용",
  pekinese: "페키니즈",
  pembroke: "웰시코기 펨브로크",
  pomeranian: "포메라니안",
  pug: "퍼그",
  "redbone": "레드본쿤하운드",
  "rhodesian ridgeback": "로디지안리지백",
  "rhodesian_ridgeback": "로디지안리지백",
  rottweiler: "로트와일러",
  "saint bernard": "세인트버나드",
  "saint_bernard": "세인트버나드",
  saluki: "살루키",
  samoyed: "사모예드",
  schipperke: "스키퍼키",
  "scotch terrier": "스코티시테리어",
  "scotch_terrier": "스코티시테리어",
  "scottish deerhound": "스코티시디어하운드",
  "scottish_deerhound": "스코티시디어하운드",
  "sealyham terrier": "실리엄테리어",
  "sealyham_terrier": "실리엄테리어",
  "shetland sheepdog": "셰틀랜드쉽독",
  "shetland_sheepdog": "셰틀랜드쉽독",
  "shih-tzu": "시츄",
  "shih tzu": "시츄",
  "shih_tzu": "시츄",
  "siberian husky": "시베리안허스키",
  "siberian_husky": "시베리안허스키",
  "silky terrier": "실키테리어",
  "silky_terrier": "실키테리어",
  "soft-coated wheaten terrier": "소프트코티드휘튼테리어",
  "soft-coated_wheaten_terrier": "소프트코티드휘튼테리어",
  "staffordshire bullterrier": "스태퍼드셔불테리어",
  "staffordshire_bullterrier": "스태퍼드셔불테리어",
  "standard poodle": "스탠더드푸들",
  "standard_poodle": "스탠더드푸들",
  "standard schnauzer": "스탠더드슈나우저",
  "standard_schnauzer": "스탠더드슈나우저",
  "sussex spaniel": "서식스스파니엘",
  "sussex_spaniel": "서식스스파니엘",
  "tibetan mastiff": "티베탄마스티프",
  "tibetan_mastiff": "티베탄마스티프",
  "tibetan terrier": "티베탄테리어",
  "tibetan_terrier": "티베탄테리어",
  "toy poodle": "토이푸들",
  "toy_poodle": "토이푸들",
  "toy terrier": "토이테리어",
  "toy_terrier": "토이테리어",
  vizsla: "비즐라",
  "walker hound": "워커하운드",
  "walker_hound": "워커하운드",
  "weimaraner": "와이마라너",
  "welsh springer spaniel": "웰시스프링거스파니엘",
  "welsh_springer_spaniel": "웰시스프링거스파니엘",
  "west highland white terrier": "웨스트하이랜드화이트테리어",
  "west_highland_white_terrier": "웨스트하이랜드화이트테리어",
  whippet: "휘핏",
  "wire-haired fox terrier": "와이어폭스테리어",
  "wire-haired_fox_terrier": "와이어폭스테리어",
  "yorkshire terrier": "요크셔테리어",
  "yorkshire_terrier": "요크셔테리어",
};

// dima806/cat_breed_image_detection의 48개 실제 라벨을 모두 한글로 표시합니다.
const CAT_BREED_KO_MAP: Record<string, string> = {
  abyssinian: "아비시니안",
  "american bobtail": "아메리칸 밥테일",
  "american curl": "아메리칸 컬",
  "american shorthair": "아메리칸 쇼트헤어",
  "applehead siamese": "애플헤드 샴",
  balinese: "발리니즈",
  bengal: "뱅갈",
  birman: "버만",
  bombay: "봄베이",
  "british shorthair": "브리티시 숏헤어",
  burmese: "버미즈",
  calico: "칼리코",
  "cornish rex": "코니시 렉스",
  "devon rex": "데본 렉스",
  "dilute calico": "딜루트 칼리코",
  "dilute tortoiseshell": "딜루트 토터셸",
  "domestic long hair": "도메스틱 롱헤어",
  "domestic medium hair": "도메스틱 미디엄헤어",
  "domestic short hair": "도메스틱 쇼트헤어",
  "egyptian mau": "이집션 마우",
  "exotic shorthair": "엑조틱 쇼트헤어",
  "extra toes cat hemingway polydactyl": "헤밍웨이 폴리닥틸",
  havana: "하바나 브라운",
  himalayan: "히말라얀",
  "japanese bobtail": "재패니즈 밥테일",
  "maine coon": "메인쿤",
  manx: "맹크스",
  munchkin: "먼치킨",
  nebelung: "네벨룽",
  "norwegian forest": "노르웨이 숲",
  "oriental short hair": "오리엔탈 쇼트헤어",
  persian: "페르시안",
  ragamuffin: "라가머핀",
  ragdoll: "랙돌",
  "russian blue": "러시안 블루",
  "scottish fold": "스코티시 폴드",
  siamese: "샴",
  siberian: "시베리안",
  snowshoe: "스노우슈",
  sphynx: "스핑크스",
  tabby: "태비",
  tiger: "타이거",
  tonkinese: "통키니즈",
  torbie: "토비",
  tortoiseshell: "토터셸",
  "turkish angora": "터키시 앙고라",
  "turkish van": "터키시 밴",
  tuxedo: "턱시도",
};

type BreedPrediction = {
  breedKo: string;
  breedEn: string;
  confidence: number;
  note: string;
};

type Species = "dog" | "cat";

type HuggingFacePrediction = {
  label?: string;
  breedKo?: string;
  breedEn?: string;
  score?: number;
  confidence?: number;
  probability?: number;
  note?: string;
};

function json(body: Record<string, unknown>, headers: HeadersInit, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

function normalizeLabel(label: string) {
  return label
    .replace(/^n\d+\s*/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toKoBreed(label: string, species: Species) {
  const normalized = normalizeLabel(label).toLowerCase();
  const map = species === "cat" ? CAT_BREED_KO_MAP : BREED_KO_MAP;
  return map[normalized] ?? map[normalized.replace(/\s+/g, "_")] ?? normalizeLabel(label);
}

function hasKorean(value: string) {
  return /[가-힣]/.test(value);
}

function normalizePredictions(raw: unknown, species: Species, limit: number): BreedPrediction[] {
  const predictions = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { predictions?: unknown[] })?.predictions)
      ? (raw as { predictions: unknown[] }).predictions
      : Array.isArray((raw as { data?: unknown[] })?.data)
        ? (raw as { data: unknown[] }).data
        : [];

  return predictions
    .map((item) => {
      const row = item as HuggingFacePrediction;
      const label = String(row.label ?? row.breedEn ?? row.breedKo ?? "");
      const confidence = Number(row.score ?? row.confidence ?? row.probability);
      const breedEn = normalizeLabel(String(row.breedEn ?? label));
      const rawBreedKo = String(row.breedKo ?? "");
      const breedKo = rawBreedKo && hasKorean(rawBreedKo)
        ? rawBreedKo
        : toKoBreed(breedEn || label || rawBreedKo, species);

      return {
        breedKo,
        breedEn,
        confidence: Number.isFinite(confidence) ? confidence : 0,
        note: row.note ?? "사진 기반 AI 추정 후보입니다.",
      };
    })
    .filter((item) => item.breedEn.length > 0 || item.breedKo.length > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

function normalizePredictionResponse(payload: unknown, species: Species, limit: number): BreedPrediction[] {
  const direct = normalizePredictions(payload, species, limit);

  if (direct.length > 0) {
    return direct;
  }

  const nestedData = (payload as { data?: unknown })?.data;

  if (Array.isArray(nestedData)) {
    for (const item of nestedData) {
      const nested = normalizePredictions(item, species, limit);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function dataUrlToBytes(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("이미지 데이터 형식이 올바르지 않습니다. 사진을 다시 선택해주세요.");
  }

  const [, mimeType, base64] = match;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return { bytes, mimeType };
}

function getBase64Payload(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("이미지 데이터 형식이 올바르지 않습니다. 사진을 다시 선택해주세요.");
  }

  return {
    mimeType: match[1],
    base64: match[2],
  };
}

function resolveEndpoint(species: Species) {
  // The existing shared endpoint is dog-only. Never send a cat image there:
  // older deployments silently return dog labels instead of an explicit error.
  const configured = species === "cat"
    ? Deno.env.get("HF_CAT_BREED_GUESS_ENDPOINT")?.trim()
    : Deno.env.get("HF_BREED_GUESS_ENDPOINT")?.trim();

  if (!configured) {
    return species === "cat" ? DEFAULT_CAT_MODEL_ENDPOINT : DEFAULT_MODEL_ENDPOINT;
  }

  return configured;
}

function getErrorMessage(payload: unknown) {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "error" in payload) {
    return String((payload as { error?: unknown }).error ?? "");
  }
  return "";
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callHuggingFace(imageDataUrl: string, species: Species) {
  const endpoint = resolveEndpoint(species);
  const token = Deno.env.get("HF_BREED_GUESS_TOKEN")?.trim() ?? "";
  const requiresAuth =
    endpoint.includes("huggingface.co") || endpoint.includes(".hf.space");

  if (requiresAuth && !token) {
    throw new Error("AI 품종 분석 토큰이 설정되지 않았습니다. HF_BREED_GUESS_TOKEN을 먼저 설정해주세요.");
  }

  const { bytes } = dataUrlToBytes(imageDataUrl);
  const { base64, mimeType } = getBase64Payload(imageDataUrl);
  let lastMessage = "";
  const usesJsonEndpoint =
    endpoint.includes(".hf.space") || endpoint.endsWith("/predict");
  const usesRouterModelEndpoint = endpoint.includes("/hf-inference/models/");
  const authHeaders =
    requiresAuth && token ? { Authorization: `Bearer ${token}` } : {};

  for (let attempt = 1; attempt <= HF_MAX_ATTEMPTS; attempt += 1) {
    try {
      const requestBody = usesJsonEndpoint
        ? JSON.stringify({ imageDataUrl, species, topK: species === "cat" ? 3 : 5 })
        : usesRouterModelEndpoint
          ? JSON.stringify({
              inputs: base64,
              parameters: {
                top_k: species === "cat" ? 3 : 5,
                function_to_apply: "softmax",
              },
            })
          : bytes;

      const response = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: usesJsonEndpoint || usesRouterModelEndpoint
            ? {
                ...authHeaders,
                "Content-Type": "application/json",
                Accept: "application/json",
              }
            : {
                ...authHeaders,
                "Content-Type": mimeType,
                Accept: "application/json",
              },
          body: requestBody,
        },
        HF_REQUEST_TIMEOUT_MS
      );

      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (response.ok) {
        const predictions = normalizePredictionResponse(payload, species, species === "cat" ? 3 : 5);

        if (predictions.length > 0) {
          return predictions;
        }

        lastMessage = getErrorMessage(payload) || (
          species === "cat"
            ? "고양이를 찾지 못했어요. 고양이가 선명하게 나온 사진으로 다시 시도해주세요."
            : "견종 추정 모델 응답에서 후보를 찾지 못했습니다."
        );
      } else {
        lastMessage =
          getErrorMessage(payload) ||
          `견종 추정 모델 응답 실패: ${response.status}`;
      }

      const retryable =
        response.status === 429 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504 ||
        lastMessage.toLowerCase().includes("loading") ||
        lastMessage.toLowerCase().includes("currently loading");

      if (!retryable || attempt === HF_MAX_ATTEMPTS) {
        break;
      }
    } catch (error) {
      const isAbortError =
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message.toLowerCase().includes("aborted"));
      const isNetworkError = error instanceof Error;

      lastMessage = isAbortError
        ? "AI 분석 서버 응답이 지연되고 있어요. 다시 연결 중입니다."
        : error instanceof Error
          ? error.message
          : "AI 품종 분석 서버 연결이 잠시 불안정합니다.";

      if (!isNetworkError || attempt === HF_MAX_ATTEMPTS) {
        break;
      }
    }

    // 짧은 백오프로 모델 서버 기동/일시적 과부하를 흡수합니다.
    await sleep(1500 * attempt);
  }

  throw new Error(
    lastMessage ||
      "AI 분석 서버가 아직 준비되지 않았어요. 잠시 후 다시 시도해주세요."
  );
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, message: "POST 요청만 지원합니다." }, corsHeaders, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const imageDataUrl = String(body.imageDataUrl ?? body.imageBase64 ?? "");
    const species: Species = body.species === "cat" ? "cat" : "dog";

    if (!imageDataUrl.startsWith("data:image/")) {
      return json(
        {
          success: false,
          message: "이미지 데이터가 필요합니다. 사진을 다시 선택해주세요.",
        },
        corsHeaders,
        400
      );
    }

    const predictions = await callHuggingFace(imageDataUrl, species);

    return json({
      success: true,
      source: "huggingface",
      predictions,
      disclaimer: species === "cat"
        ? "AI가 사진을 기반으로 예측한 결과입니다. 실제 혈통 및 유전자 검사 결과와는 차이가 있을 수 있습니다."
        : "댕댕 AI 유전자 검사는 사진 기반 AI 참고용이며 실제 유전자 검사, 혈통 인증, 진단 결과로 사용할 수 없습니다.",
    }, corsHeaders);
  } catch (error) {
    console.error("breed-guess 실패", error);
    return json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "견종 추정 중 오류가 발생했습니다.",
      },
      corsHeaders,
      500
    );
  }
});
