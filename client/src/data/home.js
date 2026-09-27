export const categories = [
  { id: "all", label: "전체", icon: "✦" },
  { id: "마법약물", label: "마법약물", icon: "❀" },
  { id: "지팡이", label: "지팡이", icon: "/" },
  { id: "마법동물", label: "마법동물", icon: "⌂" },
  { id: "마법아이템", label: "마법아이템", icon: "◇" },
];

export const pickupItems = [
  { id: 1, name: "호그와트 트렁크 캐리어", price: 37400, badge: "NEW", limited: true, tone: "trunk" },
  { id: 2, name: "기숙사 룸 1000피스 퍼즐", price: 4400, badge: "NEW", limited: false, tone: "puzzle" },
  { id: 3, name: "마법 카드 부스터 팩", price: 440, badge: "NEW", limited: false, tone: "card" },
  { id: 4, name: "트렁크 월렛", price: 7700, badge: "NEW", limited: true, tone: "wallet" },
  { id: 5, name: "특급열차 카라비너", price: 2800, badge: "NEW", limited: true, tone: "key" },
  { id: 6, name: "그리핀도르 숄더백", price: 7700, badge: "", limited: true, tone: "bag" },
  { id: 7, name: "슬리데린 체크 양말", price: 1780, badge: "", limited: true, tone: "sock" },
  { id: 8, name: "래번클로 라펠핀", price: 3300, badge: "", limited: true, tone: "pin" },
  { id: 9, name: "4기숙사 실링 스탬프", price: 8470, badge: "NEW", limited: false, tone: "stamp" },
  { id: 10, name: "지팡이 디스플레이 스탠드", price: 6200, badge: "", limited: false, tone: "wand" },
];

export const featureItems = [
  { id: "f1", title: "호그와트 특급 컬렉션", text: "열차와 트렁크에서 영감을 받은 여행 아이템", tone: "train" },
  { id: "f2", title: "기숙사 룸 스타일링", text: "네 기숙사의 색과 문장을 담은 룸 소품", tone: "room" },
  { id: "f3", title: "카드와 퍼즐", text: "책상 위에서 즐기는 마법 세계의 한 조각", tone: "desk" },
  { id: "f4", title: "데일리 매직", text: "양말, 핀, 가방처럼 매일 쓸 수 있는 소품", tone: "daily" },
];

export const heroSlides = [
  { id: 1, kicker: "New Season", title: "새로운 시즌의 마법", text: "기숙사 컬러와 트렁크 모티프를 담은 신상품", tone: "navy" },
  { id: 2, kicker: "House", title: "네 기숙사를 입다", text: "일상에서도 쓸 수 있는 기숙사 소품", tone: "house" },
  { id: 3, kicker: "Pickup", title: "오늘의 픽업", text: "가방, 핀, 퍼즐까지 천천히 둘러보세요", tone: "gold" },
];

export const houses = [
  { id: "gryffindor", name: "Gryffindor", ko: "그리핀도르", color: "#7f0909" },
  { id: "slytherin", name: "Slytherin", ko: "슬리데린", color: "#1a472a" },
  { id: "ravenclaw", name: "Ravenclaw", ko: "래번클로", color: "#0e1a40" },
  { id: "hufflepuff", name: "Hufflepuff", ko: "후플푸프", color: "#ecb939" },
];

export function formatPrice(value) {
  return `₩${value.toLocaleString("ko-KR")} (세금포함)`;
}

export function displayCategory(category) {
  return category === "마법약" ? "마법약물" : category;
}

export function matchesCategory(category, filterId) {
  if (filterId === "마법약물") return category === "마법약물" || category === "마법약";
  return category === filterId;
}
