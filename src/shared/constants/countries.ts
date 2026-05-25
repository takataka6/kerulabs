/**
 * @module countries
 * @description 国・地域の定数データ。国コード・国名（日英）・国旗絵文字のマスタリストと、国名から国情報を取得するヘルパー関数を提供する。
 */
export const COUNTRIES = [
  { code: "JP", nameJa: "日本", nameEn: "Japan", flag: "🇯🇵" },
  { code: "US", nameJa: "アメリカ", nameEn: "USA", flag: "🇺🇸" },
  { code: "GB", nameJa: "イギリス", nameEn: "England", flag: "🇬🇧" },
  { code: "DE", nameJa: "ドイツ", nameEn: "Germany", flag: "🇩🇪" },
  { code: "FR", nameJa: "フランス", nameEn: "France", flag: "🇫🇷" },
  { code: "ES", nameJa: "スペイン", nameEn: "Spain", flag: "🇪🇸" },
  { code: "IT", nameJa: "イタリア", nameEn: "Italy", flag: "🇮🇹" },
  { code: "BR", nameJa: "ブラジル", nameEn: "Brazil", flag: "🇧🇷" },
  { code: "AR", nameJa: "アルゼンチン", nameEn: "Argentina", flag: "🇦🇷" },
  { code: "PT", nameJa: "ポルトガル", nameEn: "Portugal", flag: "🇵🇹" },
  { code: "NL", nameJa: "オランダ", nameEn: "Netherlands", flag: "🇳🇱" },
  { code: "BE", nameJa: "ベルギー", nameEn: "Belgium", flag: "🇧🇪" },
  { code: "KR", nameJa: "韓国", nameEn: "South Korea", flag: "🇰🇷" },
  { code: "MX", nameJa: "メキシコ", nameEn: "Mexico", flag: "🇲🇽" },
  { code: "UY", nameJa: "ウルグアイ", nameEn: "Uruguay", flag: "🇺🇾" },
  { code: "HR", nameJa: "クロアチア", nameEn: "Croatia", flag: "🇭🇷" },
  { code: "DK", nameJa: "デンマーク", nameEn: "Denmark", flag: "🇩🇰" },
  { code: "SE", nameJa: "スウェーデン", nameEn: "Sweden", flag: "🇸🇪" },
  { code: "NO", nameJa: "ノルウェー", nameEn: "Norway", flag: "🇳🇴" },
  { code: "PL", nameJa: "ポーランド", nameEn: "Poland", flag: "🇵🇱" },
  { code: "CH", nameJa: "スイス", nameEn: "Switzerland", flag: "🇨🇭" },
  { code: "AT", nameJa: "オーストリア", nameEn: "Austria", flag: "🇦🇹" },
  { code: "CZ", nameJa: "チェコ", nameEn: "Czech Republic", flag: "🇨🇿" },
  { code: "TR", nameJa: "トルコ", nameEn: "Turkey", flag: "🇹🇷" },
  { code: "GR", nameJa: "ギリシャ", nameEn: "Greece", flag: "🇬🇷" },
  { code: "RU", nameJa: "ロシア", nameEn: "Russia", flag: "🇷🇺" },
  { code: "UA", nameJa: "ウクライナ", nameEn: "Ukraine", flag: "🇺🇦" },
  { code: "NG", nameJa: "ナイジェリア", nameEn: "Nigeria", flag: "🇳🇬" },
  { code: "SN", nameJa: "セネガル", nameEn: "Senegal", flag: "🇸🇳" },
  { code: "CI", nameJa: "コートジボワール", nameEn: "Ivory Coast", flag: "🇨🇮" },
  { code: "GH", nameJa: "ガーナ", nameEn: "Ghana", flag: "🇬🇭" },
  { code: "CM", nameJa: "カメルーン", nameEn: "Cameroon", flag: "🇨🇲" },
  { code: "MA", nameJa: "モロッコ", nameEn: "Morocco", flag: "🇲🇦" },
  { code: "EG", nameJa: "エジプト", nameEn: "Egypt", flag: "🇪🇬" },
  { code: "AU", nameJa: "オーストラリア", nameEn: "Australia", flag: "🇦🇺" },
  { code: "NZ", nameJa: "ニュージーランド", nameEn: "New Zealand", flag: "🇳🇿" },
  { code: "CA", nameJa: "カナダ", nameEn: "Canada", flag: "🇨🇦" },
  { code: "CL", nameJa: "チリ", nameEn: "Chile", flag: "🇨🇱" },
  { code: "CO", nameJa: "コロンビア", nameEn: "Colombia", flag: "🇨🇴" },
  { code: "PE", nameJa: "ペルー", nameEn: "Peru", flag: "🇵🇪" },
  { code: "EC", nameJa: "エクアドル", nameEn: "Ecuador", flag: "🇪🇨" },
  { code: "CR", nameJa: "コスタリカ", nameEn: "Costa Rica", flag: "🇨🇷" },
  { code: "IE", nameJa: "アイルランド", nameEn: "Ireland", flag: "🇮🇪" },
  { code: "IS", nameJa: "アイスランド", nameEn: "Iceland", flag: "🇮🇸" },
  { code: "RS", nameJa: "セルビア", nameEn: "Serbia", flag: "🇷🇸" },
  { code: "SI", nameJa: "スロベニア", nameEn: "Slovenia", flag: "🇸🇮" },
  { code: "SK", nameJa: "スロバキア", nameEn: "Slovakia", flag: "🇸🇰" },
];

/**
 * チーム作成・試合プレビューで使う国旗絵文字マップ。
 * キーは Team.flag に保存される小文字英語名。
 */
export const FLAG_EMOJI: Record<string, string> = {
  japan: "🇯🇵",
  germany: "🇩🇪",
  spain: "🇪🇸",
  france: "🇫🇷",
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  italy: "🇮🇹",
  brazil: "🇧🇷",
  argentina: "🇦🇷",
  portugal: "🇵🇹",
  netherlands: "🇳🇱",
} as const;

// 国名から国情報を取得するヘルパー関数
export const getCountryInfo = (
  countryName: string,
  language: "ja" | "en",
): { flag: string; name: string } => {
  const country = COUNTRIES.find(
    (c) => c.nameJa === countryName || c.nameEn === countryName,
  );
  if (!country) return { flag: "🌍", name: countryName };
  return {
    flag: country.flag,
    name: language === "ja" ? country.nameJa : country.nameEn,
  };
};
