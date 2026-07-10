import "./SafetyCard.css";

const ALCOHOL_CHECK_URL = "https://alcohol-check.vercel.app";

export function SafetyCard() {
  return (
    <aside className="safety-card" aria-label="安全に関するご案内">
      <p className="safety-card__text">
        翌日乗務予定の方へ。
        <br />
        飲酒後の0.00到達予測は
        <br />
        <a href={ALCOHOL_CHECK_URL} target="_blank" rel="noopener noreferrer">
          「アルコール残ってる？」
        </a>
        で確認できます。
      </p>
    </aside>
  );
}
