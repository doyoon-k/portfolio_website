# Vercel 배포 가이드

이 가이드는 포트폴리오 웹사이트를 Vercel에 배포하는 방법을 설명합니다.

## 사전 준비

1.  **GitHub 계정**: 코드를 저장할 GitHub 계정이 필요합니다.
2.  **Vercel 계정**: [Vercel](https://vercel.com)에 가입하고 GitHub 계정과 연동하세요.
3.  **Git 설치**: 컴퓨터에 Git이 설치되어 있어야 합니다.

## 배포 단계

### 1. GitHub에 코드 업로드

아직 코드를 GitHub에 올리지 않았다면, 다음 단계를 따르세요.

1.  GitHub에서 'New Repository'를 클릭하여 새 저장소를 만듭니다 (예: `portfolio-website`).
2.  VS Code 터미널에서 다음 명령어를 실행하여 코드를 업로드합니다:

```bash
# Git 초기화 (이미 되어있다면 생략 가능)
git init

# 모든 파일 스테이징
git add .

# 커밋
git commit -m "Initial commit"

# 원격 저장소 연결 (URL을 본인의 저장소 주소로 변경하세요)
git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git

# 푸시
git push -u origin main
```

### 2. Vercel 프로젝트 생성

1.  [Vercel 대시보드](https://vercel.com/dashboard)로 이동합니다.
2.  **"Add New..."** 버튼을 클릭하고 **"Project"**를 선택합니다.
3.  **"Import Git Repository"** 목록에서 방금 만든 `portfolio-website` 저장소를 찾아 **"Import"**를 클릭합니다.

### 3. 배포 설정 (Configure Project)

*   **Project Name**: 원하는 이름으로 설정합니다.
*   **Framework Preset**: `Other` (또는 자동으로 감지됨)로 둡니다. 이 프로젝트는 정적 HTML/CSS/JS 사이트이므로 특별한 빌드 설정이 필요 없습니다.
*   **Root Directory**: `./` (기본값)
*   **Build Command**: 비워둡니다.
*   **Output Directory**: 비워둡니다.
*   **Environment Variables**:
    *   `supabase-config.js`에 있는 키는 **`anon` (public) 키**입니다. 이 키는 클라이언트(브라우저)에서 사용하도록 설계되었으며, 공개되어도 안전합니다.
    *   **중요**: 보안은 API 키를 숨기는 것이 아니라, Supabase 대시보드의 **Row Level Security (RLS)** 정책을 통해 관리됩니다.
    *   절대 **`service_role`** 키(비밀 키)를 클라이언트 코드에 넣지 마세요.

### 4. Deploy 클릭

**"Deploy"** 버튼을 클릭합니다. Vercel이 자동으로 코드를 가져와 배포를 시작합니다.
잠시 후 배포가 완료되면 축하 메시지와 함께 웹사이트 URL이 생성됩니다.

## 추가 설정 (선택 사항)

### Clean URLs
프로젝트 루트에 `vercel.json` 파일을 추가하여 `.html` 확장자 없이 URL을 깔끔하게 만들 수 있습니다. (이미 파일이 생성되어 있습니다.)

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

이제 `example.com/admin.html` 대신 `example.com/admin`으로 접속할 수 있습니다.

## 업데이트 방법

코드를 수정하고 GitHub에 `push`하면 Vercel이 변경 사항을 감지하고 자동으로 재배포합니다.

```bash
git add .
git commit -m "Update content"
git push
```
