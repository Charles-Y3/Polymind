import {GAMES} from './games';
import type {GameId} from './games';
import type {PolymindProfile} from '../profile/profileStore';
import type {SharedLanguage} from './language';
import {getGameText} from './i18n';

const SIZE = 200;
const CENTER = SIZE / 2;
const MAX_R = 76;

// Matches each game's Tailwind accent (see games.ts) as a raw hex for SVG use
const ACCENT_HEX: Record<GameId, string> = {
  reflexes: '#22d3ee',
  recall: '#f59e0b',
  logic: '#a78bfa',
  awareness: '#e879f9',
};

function axisPoint(index: number, total: number, value: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (value / 100) * MAX_R;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function labelPoint(index: number, total: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = MAX_R + 22;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

export default function RadarChart({profile}: {profile: PolymindProfile}) {
  const lang = profile.language as SharedLanguage;
  const total = GAMES.length;
  const values = GAMES.map((g) => profile.perGame[g.id]?.norm ?? 0);
  const dataPoints = values.map((v, i) => axisPoint(i, total, v));
  const dataPath = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="60%">
          {GAMES.map((game, i) => (
            <stop key={game.id} offset={`${(i / GAMES.length) * 100}%`} stopColor={ACCENT_HEX[game.id]} stopOpacity={0.35} />
          ))}
          <stop offset="100%" stopColor={ACCENT_HEX[GAMES[0].id]} stopOpacity={0.35} />
        </radialGradient>
      </defs>

      {rings.map((ring) => (
        <polygon
          key={ring}
          points={GAMES.map((_, i) => axisPoint(i, total, ring * 100).join(',')).join(' ')}
          fill="none"
          stroke="rgb(51 65 85)"
          strokeWidth={1}
        />
      ))}
      {GAMES.map((game, i) => {
        const [x, y] = axisPoint(i, total, 100);
        return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke={ACCENT_HEX[game.id]} strokeOpacity={0.25} strokeWidth={1} />;
      })}

      <polygon points={dataPath} fill="url(#radarFill)" stroke="rgb(217 70 239)" strokeWidth={2} />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={ACCENT_HEX[GAMES[i].id]} stroke="rgb(15 23 42)" strokeWidth={1} />
      ))}

      {GAMES.map((game, i) => {
        const [x, y] = labelPoint(i, total);
        return (
          <text
            key={game.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-400 text-[10px] font-semibold uppercase tracking-wide"
          >
            {getGameText(lang, game.id, 'faculty')}
          </text>
        );
      })}
    </svg>
  );
}
