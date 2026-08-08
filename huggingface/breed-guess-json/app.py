import base64
import io
import re
import time
from contextlib import asynccontextmanager
from functools import lru_cache
from typing import Any

from fastapi import FastAPI, HTTPException
from fastai.vision.all import load_learner, PILImage
from huggingface_hub import hf_hub_download
from pydantic import BaseModel
from transformers import pipeline


MODEL_REPO_ID = "duchaba/120dog_breeds"
MODEL_FILENAME = "ada.pkl"
CAT_MODEL_REPO_ID = "dima806/cat_breed_image_detection"
MAX_IMAGE_BYTES = 6 * 1024 * 1024

BREED_KO = {
    "affenpinscher": "아펜핀셔",
    "afghan_hound": "아프간 하운드",
    "airedale": "에어데일 테리어",
    "akita": "아키타",
    "alaskan_malamute": "알래스칸 말라뮤트",
    "american_staffordshire_terrier": "아메리칸 스태퍼드셔 테리어",
    "appenzeller": "아펜젤러",
    "australian_terrier": "오스트레일리안 테리어",
    "basenji": "바센지",
    "basset": "바셋 하운드",
    "beagle": "비글",
    "bedlington_terrier": "베들링턴 테리어",
    "bernese_mountain_dog": "버니즈 마운틴 독",
    "black-and-tan_coonhound": "블랙 앤 탄 쿤하운드",
    "blenheim_spaniel": "블레넘 스패니얼",
    "bloodhound": "블러드하운드",
    "bluetick": "블루틱 쿤하운드",
    "border_collie": "보더콜리",
    "border_terrier": "보더 테리어",
    "borzoi": "보르조이",
    "boston_bull": "보스턴 테리어",
    "bouvier_des_flandres": "부비에 데 플랑드르",
    "boxer": "복서",
    "brabancon_griffon": "브뤼셀 그리폰",
    "briard": "브리아드",
    "brittany_spaniel": "브리타니 스패니얼",
    "bull_mastiff": "불마스티프",
    "cairn": "케언 테리어",
    "cardigan": "웰시코기 카디건",
    "chesapeake_bay_retriever": "체서피크 베이 리트리버",
    "chihuahua": "치와와",
    "chow": "차우차우",
    "clumber": "클럼버 스패니얼",
    "cocker_spaniel": "코카 스패니얼",
    "collie": "콜리",
    "curly-coated_retriever": "컬리 코티드 리트리버",
    "dandie_dinmont": "댄디 딘몬트 테리어",
    "dhole": "돌",
    "dingo": "딩고",
    "doberman": "도베르만",
    "english_foxhound": "잉글리시 폭스하운드",
    "english_setter": "잉글리시 세터",
    "english_springer": "잉글리시 스프링거 스패니얼",
    "entlebucher": "엔틀레부허 마운틴 독",
    "eskimo_dog": "에스키모 도그",
    "flat-coated_retriever": "플랫 코티드 리트리버",
    "french_bulldog": "프렌치 불도그",
    "german_shepherd": "저먼 셰퍼드",
    "german_short-haired_pointer": "저먼 쇼트헤어드 포인터",
    "giant_schnauzer": "자이언트 슈나우저",
    "golden_retriever": "골든 리트리버",
    "gordon_setter": "고든 세터",
    "great_dane": "그레이트 데인",
    "great_pyrenees": "그레이트 피레니즈",
    "greater_swiss_mountain_dog": "그레이터 스위스 마운틴 독",
    "groenendael": "그로넨달",
    "ibizan_hound": "이비전 하운드",
    "irish_setter": "아이리시 세터",
    "irish_terrier": "아이리시 테리어",
    "irish_water_spaniel": "아이리시 워터 스패니얼",
    "irish_wolfhound": "아이리시 울프하운드",
    "italian_greyhound": "이탈리안 그레이하운드",
    "japanese_spaniel": "재패니즈 친",
    "keeshond": "키스혼드",
    "kelpie": "켈피",
    "kerry_blue_terrier": "케리 블루 테리어",
    "komondor": "코몬도르",
    "kuvasz": "쿠바츠",
    "labrador_retriever": "래브라도 리트리버",
    "lakeland_terrier": "레이크랜드 테리어",
    "leonberg": "레온베르거",
    "lhasa": "라사 압소",
    "malinois": "말리노이즈",
    "maltese_dog": "말티즈",
    "mexican_hairless": "멕시칸 헤어리스",
    "miniature_pinscher": "미니어처 핀셔",
    "miniature_poodle": "미니어처 푸들",
    "miniature_schnauzer": "미니어처 슈나우저",
    "newfoundland": "뉴펀들랜드",
    "norfolk_terrier": "노퍽 테리어",
    "norwegian_elkhound": "노르웨이 엘크하운드",
    "norwich_terrier": "노리치 테리어",
    "old_english_sheepdog": "올드 잉글리시 쉽독",
    "otterhound": "오터하운드",
    "papillon": "파피용",
    "pekinese": "페키니즈",
    "pembroke": "웰시코기 펨브로크",
    "pomeranian": "포메라니안",
    "pug": "퍼그",
    "redbone": "레드본 쿤하운드",
    "rhodesian_ridgeback": "로디지안 리지백",
    "rottweiler": "로트와일러",
    "saint_bernard": "세인트 버나드",
    "saluki": "살루키",
    "samoyed": "사모예드",
    "schipperke": "스키퍼키",
    "scotch_terrier": "스코티시 테리어",
    "scottish_deerhound": "스코티시 디어하운드",
    "sealyham_terrier": "실리엄 테리어",
    "shetland_sheepdog": "셰틀랜드 쉽독",
    "shih-tzu": "시츄",
    "siberian_husky": "시베리안 허스키",
    "silky_terrier": "실키 테리어",
    "soft-coated_wheaten_terrier": "소프트 코티드 휘튼 테리어",
    "staffordshire_bullterrier": "스태퍼드셔 불테리어",
    "standard_poodle": "스탠더드 푸들",
    "standard_schnauzer": "스탠더드 슈나우저",
    "sussex_spaniel": "서식스 스패니얼",
    "tibetan_mastiff": "티베탄 마스티프",
    "tibetan_terrier": "티베탄 테리어",
    "toy_poodle": "토이푸들",
    "toy_terrier": "토이 테리어",
    "vizsla": "비즐라",
    "walker_hound": "워커 하운드",
    "weimaraner": "와이마라너",
    "welsh_springer_spaniel": "웰시 스프링거 스패니얼",
    "west_highland_white_terrier": "웨스트 하이랜드 화이트 테리어",
    "whippet": "휘핏",
    "wire-haired_fox_terrier": "와이어 폭스 테리어",
    "yorkshire_terrier": "요크셔 테리어",
}


class PredictRequest(BaseModel):
    imageDataUrl: str | None = None
    image: str | None = None
    petName: str | None = None
    species: str = "dog"
    topK: int = 5


@asynccontextmanager
async def lifespan(app: FastAPI):
    start = time.perf_counter()
    learner = get_learner()
    app.state.model_ready = learner is not None
    app.state.model_loaded_at = time.time()
    app.state.model_load_ms = round((time.perf_counter() - start) * 1000)
    yield


app = FastAPI(title="Daengnyang Breed Guess JSON API", lifespan=lifespan)


@lru_cache(maxsize=1)
def get_learner() -> Any:
    model_path = hf_hub_download(
        repo_id=MODEL_REPO_ID,
        filename=MODEL_FILENAME,
        repo_type="space",
    )
    return load_learner(model_path)


@lru_cache(maxsize=1)
def get_cat_classifier() -> Any:
    # The cat model is intentionally lazy-loaded: existing dog requests keep
    # their startup time and memory behaviour unchanged.
    return pipeline("image-classification", model=CAT_MODEL_REPO_ID)


def label_to_ko(label: str) -> str:
    key = normalize_label_key(label)
    if key in BREED_KO:
        return BREED_KO[key]
    return key.replace("_", " ").replace("-", " ").title()


def normalize_label_key(label: str) -> str:
    key = label.strip().lower()
    key = re.sub(r"\s+", "_", key)
    aliases = {
        "japanese_spaniel": "japanese_spaniel",
        "shih_tzu": "shih-tzu",
    }
    return aliases.get(key, key)


def decode_image(data_url: str) -> PILImage:
    match = re.match(r"^data:image/[a-zA-Z0-9.+-]+;base64,(.+)$", data_url)
    if not match:
        raise HTTPException(status_code=400, detail="imageDataUrl 형식이 올바르지 않습니다.")

    try:
        image_bytes = base64.b64decode(match.group(1), validate=True)
        if len(image_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="사진 용량이 너무 큽니다. 6MB 이하 이미지를 사용해주세요.")
        return PILImage.create(io.BytesIO(image_bytes))
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(status_code=400, detail="이미지를 읽을 수 없습니다.") from exc


@app.get("/")
def health():
    return {
        "ok": True,
        "service": "daengnyang-breed-guess-json",
        "modelReady": getattr(app.state, "model_ready", False),
    }


@app.get("/ready")
def ready():
    if not getattr(app.state, "model_ready", False):
        raise HTTPException(status_code=503, detail="model is still loading")

    return {
        "ok": True,
        "service": "daengnyang-breed-guess-json",
        "modelReady": True,
        "modelLoadMs": getattr(app.state, "model_load_ms", None),
    }


@app.post("/predict")
def predict(request: PredictRequest):
    image_data_url = request.imageDataUrl or request.image
    if not image_data_url:
        raise HTTPException(status_code=400, detail="imageDataUrl이 필요합니다.")

    try:
        image = decode_image(image_data_url)
        species = "cat" if request.species == "cat" else "dog"
        if species == "cat":
            rows = get_cat_classifier()(image, top_k=3)
            predictions = [
                {
                    "breedKo": str(row["label"]),
                    "breedEn": str(row["label"]),
                    "confidence": float(row["score"]),
                    "note": "사진 기반 AI 추정 후보입니다.",
                }
                for row in rows[:3]
            ]
        else:
            learner = get_learner()
            _, _, probs = learner.predict(image)
            vocab = list(learner.dls.vocab)
            top_k = max(1, min(int(request.topK or 5), 10))
            top_indices = probs.argsort(descending=True)[:top_k]
            predictions = []
            for index in top_indices:
                breed_en = str(vocab[int(index)])
                confidence = float(probs[int(index)])
                predictions.append(
                    {
                        "breedKo": label_to_ko(breed_en),
                        "breedEn": breed_en,
                        "confidence": confidence,
                        "note": "사진 기반 AI 추정 후보입니다.",
                    }
                )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="모델 추론 중 오류가 발생했습니다.") from exc

    return {
        "success": True,
        "source": "dedicated-server",
        "predictions": predictions,
        "disclaimer": (
            "AI가 사진을 기반으로 예측한 결과입니다. 실제 혈통 및 유전자 검사 결과와는 차이가 있을 수 있습니다."
            if request.species == "cat"
            else "AI 견종 추정은 참고용이며 혈통, 품종 인증, 진단 결과로 사용할 수 없습니다."
        ),
    }
