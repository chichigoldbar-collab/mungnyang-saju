# Android GitHub Actions Setup

Set these GitHub repository secrets before running the workflow:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID`
- `EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID`

To create `ANDROID_KEYSTORE_BASE64` on macOS:

```bash
base64 -i android/app/release.keystore | pbcopy
```

The workflow uploads the generated `.aab` as a GitHub Actions artifact.
