// 사이트 전역 설정. 배포 전 반드시 확인할 항목은 TODO 로 표시.
export const config = {
  siteName: 'CalcMate',
  tagline: '연봉·대출·적금·퇴직금 계산기',
  // 실제 도메인 (끝에 슬래시 없이)
  siteUrl: process.env.SITE_URL || 'https://calcmate.co.kr',
  // GitHub Pages 프로젝트 저장소로 배포하면 '/calcmate', 커스텀 도메인이면 ''.
  basePath: process.env.BASE_PATH ?? '',
  lang: 'ko',
  author: 'CalcMate',
  contactEmail: 'aitkd2020@gmail.com',

  // TODO: 애드센스 승인 후 게시자 ID 입력 (예: 'ca-pub-1234567890123456'). 비어 있으면 광고 코드가 삽입되지 않음.
  adsenseClient: process.env.ADSENSE_CLIENT || '',
  // 광고 슬롯 ID (애드센스 > 광고 > 광고 단위에서 생성). 비어 있으면 자동광고만 사용.
  adsenseSlots: { top: '', inArticle: '', bottom: '' },

  // TODO: 쿠팡파트너스 승인 후 파트너 ID/링크 입력. 비어 있으면 제휴 박스 미노출.
  coupangPartnerId: process.env.COUPANG_PARTNER_ID || '',

  // TODO: 검색엔진 소유 확인용 메타 태그 값
  googleSiteVerification: '',
  naverSiteVerification: '',

  // 자동 콘텐츠 생성 (scripts/generate-article.mjs)
  articleModel: process.env.ARTICLE_MODEL || 'claude-sonnet-5',
};
