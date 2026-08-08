---
title: Daengnyang Breed Guess JSON
emoji: 🐶
colorFrom: yellow
colorTo: pink
sdk: docker
pinned: false
license: mit
---

# Daengnyang Breed Guess JSON API

댕냥DNA 앱에서 사용할 강아지·고양이 품종 추정용 전용 추론 서버입니다.

- FastAPI + fastai(강아지) + Transformers ViT(고양이) 기반
- 서버 시작 시 모델 선로딩
- `/ready` 헬스체크 제공
- Render / Railway / Hugging Face Space 같은 Docker 환경에 그대로 배포 가능

## API

`POST /predict`

```json
{
  "imageDataUrl": "data:image/jpeg;base64,...",
  "petName": "초코",
  "species": "cat"
}
```

`species`를 생략하면 기존과 동일하게 `dog`로 분석합니다. `cat`은
`dima806/cat_breed_image_detection` 모델을 사용하며 항상 Top 3을 반환합니다.

응답:

```json
{
  "success": true,
  "predictions": [
    {
      "breedKo": "시츄",
      "breedEn": "Shih Tzu",
      "confidence": 0.75,
      "note": "사진 기반 AI 추정 후보입니다."
    }
  ]
}
```

## Health Check

- `GET /` : 프로세스 살아 있음
- `GET /ready` : 모델까지 로드 완료

## Supabase 연결

Space 배포 후 Supabase secret에 아래 값을 넣습니다.

```bash
supabase secrets set HF_BREED_GUESS_ENDPOINT=https://YOUR_SPACE.hf.space/predict
```
