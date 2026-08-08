# 강아지·고양이 품종 분석 서버 배포 순서

이 폴더는 Hugging Face Space뿐 아니라 Render, Railway 같은 Docker 웹서비스에도 그대로 배포할 수 있습니다.

추천 운영 방식:

- `항상 켜져 있는 Docker 웹서비스`로 배포
- 서버 기동 시 기존 강아지 모델을 미리 로드하고, 고양이 모델은 첫 고양이 분석 때 한 번만 로드
- `/ready` 헬스체크가 통과된 뒤에만 트래픽 받기

## Render로 바로 올릴 때

루트의 [render.yaml](/Users/son/mungnyang-saju/render.yaml)이 이미 연결돼 있습니다.

1. Render에서 이 GitHub 저장소를 연결합니다.
2. `daengnyang-breed-guess` 웹서비스를 생성합니다.
3. 헬스체크 경로는 `/ready`를 사용합니다.
4. 배포가 끝나면 아래 주소가 열려야 합니다.

```text
https://{서비스주소}/ready
```

정상 응답:

```json
{
  "ok": true,
  "service": "daengnyang-breed-guess-json",
  "modelReady": true
}
```

## 1. Space 만들기

Hugging Face에서 새 Space를 만듭니다.

- Space name: `daengnyang-breed-guess-json`
- SDK: `Docker`
- Visibility: 운영 전에는 `Private`, 운영 시 `Public` 또는 `Private + Token`

## 2. 파일 업로드

이 폴더의 파일을 그대로 Space에 업로드합니다. 고양이 기능을 사용하려면
`app.py`와 `requirements.txt`를 함께 새 버전으로 반영해야 합니다.

- `README.md`
- `Dockerfile`
- `requirements.txt`
- `app.py`

## 3. Space 실행 확인

빌드가 끝나면 아래 주소가 열려야 합니다.

```text
https://{계정명}-daengnyang-breed-guess-json.hf.space/
```

정상 응답:

```json
{"ok": true, "service": "daengnyang-breed-guess-json"}
```

## 4. Supabase Secret 연결

서버 주소가 확인되면 Supabase에 endpoint를 등록합니다.

```bash
supabase secrets set HF_BREED_GUESS_ENDPOINT=https://{서비스주소}/predict
supabase functions deploy breed-guess
```

Hugging Face Private Space로 운영한다면 Hugging Face token도 같이 등록합니다.

```bash
supabase secrets set HF_BREED_GUESS_TOKEN=hf_xxxxxxxxx
supabase functions deploy breed-guess
```

직접 운영하는 Docker 서버라면 `HF_BREED_GUESS_TOKEN`은 없어도 됩니다.

## 5. 고양이 모델

`species: "cat"` 요청은 Hugging Face의
`dima806/cat_breed_image_detection` 모델을 사용하고 Top 3만 반환합니다.
Supabase Edge Function은 이미 같은 `HF_BREED_GUESS_ENDPOINT`에
`species` 값을 전달하므로, 기존 엔드포인트를 바꾸지 않아도 됩니다.

## 6. 앱 응답 형태

앱은 아래 형태를 받으면 한국어 Top5 퍼센트로 표시합니다.

```json
{
  "success": true,
  "source": "huggingface",
  "predictions": [
    {
      "breedKo": "시츄",
      "breedEn": "shih-tzu",
      "confidence": 0.75,
      "note": "사진 기반 AI 추정 후보입니다."
    }
  ]
}
```
