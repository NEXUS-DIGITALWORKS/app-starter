import type { FitScoreAxis } from '../types'

type Props = {
  overall: number
  axes: FitScoreAxis[]
}

const SIZE = 152
const CENTER = SIZE / 2
const STROKE = 9
const GAP = 3

export function EvaluationChart({ overall, axes }: Props) {
  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`総合適合度 ${overall}点`}>
        {axes.map((axis, index) => {
          const radius = CENTER - STROKE / 2 - index * (STROKE + GAP)
          const circumference = 2 * Math.PI * radius
          const filled = Math.max(0, Math.min(100, axis.value)) / 100 * circumference
          return (
            <g key={axis.label} transform={`rotate(-90 ${CENTER} ${CENTER})`}>
              <circle cx={CENTER} cy={CENTER} r={radius} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={STROKE} />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={radius}
                fill="none"
                stroke={axis.color}
                strokeWidth={STROKE}
                strokeDasharray={`${filled} ${circumference - filled}`}
                strokeLinecap="round"
              />
            </g>
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{overall}</span>
        <span className="text-[10px] font-semibold text-white/60">/ 100</span>
      </div>
    </div>
  )
}
