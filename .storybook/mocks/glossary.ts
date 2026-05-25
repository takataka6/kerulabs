import { Glossary } from "@domain/entities/Glossary";

export function createMockGlossary(): Glossary {
  const glossary = Glossary.create(
    "サッカー用語集",
    "基本的なサッカー用語をまとめた用語集",
  );
  glossary.addTerm({
    term: "ポゼッション",
    reading: "ぽぜっしょん",
    description:
      "ボールを保持する戦術。ショートパスを多用してボールを支配する。",
    keywords: ["攻撃", "戦術"],
  });
  glossary.addTerm({
    term: "プレッシング",
    reading: "ぷれっしんぐ",
    description:
      "相手チームのボール保持者に積極的に圧力をかけてボールを奪う守備戦術。",
    keywords: ["守備", "戦術"],
  });
  glossary.addTerm({
    term: "ゲーゲンプレス",
    reading: "げーげんぷれす",
    description:
      "ボールを失った直後に即座にプレスをかけて奪い返す戦術。カウンタープレスとも呼ばれる。",
    keywords: ["守備", "トランジション"],
  });
  glossary.addTerm({
    term: "ビルドアップ",
    reading: "びるどあっぷ",
    description:
      "ゴールキーパーやディフェンスラインからパスを繋いで攻撃を組み立てること。",
    keywords: ["攻撃", "戦術"],
  });
  glossary.addTerm({
    term: "トランジション",
    reading: "とらんじしょん",
    description:
      "攻守の切り替え局面。ポジティブ（攻→守）とネガティブ（守→攻）がある。",
    keywords: ["トランジション"],
  });
  return glossary;
}
