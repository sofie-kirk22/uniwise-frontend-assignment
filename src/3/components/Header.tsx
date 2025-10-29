import { Volume2, VolumeX } from "lucide-react";

export function Header({
  theme, secondRoll, onRollTheme, onRollTarget, soundOn, onToggleSound,
}: {
  theme: number;
  secondRoll: number | null;
  onRollTheme: () => void;
  onRollTarget: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}) {
  return (
    <header className="header">
      <div className="brand">
        <h1>Dice Todo</h1>
        <p className="tag">Gamified goals with a roll of the dice</p>
      </div>
      <div className="controls">
        <button className="btn" onClick={onRollTheme}>🎲 Roll Aesthetic</button>
        <button className="btn primary" onClick={onRollTarget}>🎯 Roll Target</button>
        <div className="status">
          <span className="chip">Theme: {theme}</span>
          <span className="chip">Target: {secondRoll == null ? "—" : secondRoll}</span>
        </div>
        <button className={`sound-toggle ${soundOn ? "on" : "off"}`} onClick={onToggleSound} aria-label={soundOn ? "Sound On" : "Sound Off"}>
          {soundOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </div>
    </header>
  );
}
export default Header;
