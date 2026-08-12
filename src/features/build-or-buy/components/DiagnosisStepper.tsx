import { CircleCheck } from 'lucide-react'
import { diagnosisSteps } from '../data/steps'
import { ProgressBar } from './ProgressBar'

type Props = {
  currentStep: number
  completedSteps: Set<number>
  onSelectStep: (step: number) => void
}

const PRIMARY = '#3157E5'
const PRIMARY_LIGHT = '#EEF1FE'
const BORDER = '#E5E7EB'
const TEXT = '#111827'
const SUB_TEXT = '#667085'

export function DiagnosisStepper({ currentStep, completedSteps, onSelectStep }: Props) {
  const currentTitle = diagnosisSteps.find((step) => step.id === currentStep)?.title ?? ''

  const stepStates = diagnosisSteps.map((step) => {
    const isCurrent = step.id === currentStep
    const isDone = completedSteps.has(step.id)
    // 質問を持たない最終確認ステップは、前段が完了するまで「未開始」として扱う
    const isLocked = !isDone && !isCurrent && step.questionIds.length === 0
    return { step, isCurrent, isDone, isLocked }
  })

  return (
    <>
      <nav className="hidden lg:block" aria-label="診断ステップ">
        <h2 className="mb-4 text-base font-bold text-[#111827]">診断ステップ</h2>
        <ol className="m-0 list-none p-0">
          {stepStates.map(({ step, isCurrent, isDone, isLocked }, index) => {
            const isClickable = isDone || isCurrent
            const isLast = index === stepStates.length - 1
            const nextLocked = !isLast && stepStates[index + 1].isLocked
            // 質問を持たない最終確認ステップは、到達した時点で他の全入力が完了しているため現在地でもチェック表示にする
            const isReviewStep = step.questionIds.length === 0
            const showCheck = isReviewStep ? isDone || isCurrent : isDone && !isCurrent

            return (
              <li key={step.id} className="list-none">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onSelectStep(step.id)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className="flex w-full appearance-none gap-3 rounded-xl border-0 bg-transparent px-2 py-2 text-left shadow-none outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#3157E5] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                  style={{ backgroundColor: isCurrent ? PRIMARY_LIGHT : 'transparent' }}
                >
                  <span className="flex flex-col items-center">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300"
                      style={
                        isCurrent || isDone
                          ? { backgroundColor: PRIMARY, color: '#fff' }
                          : isLocked
                            ? { border: `1px dashed ${BORDER}`, color: SUB_TEXT }
                            : { border: `1px solid ${PRIMARY}`, color: PRIMARY }
                      }
                    >
                      {showCheck ? <CircleCheck size={18} className="step-check-in" /> : step.id}
                    </span>
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={nextLocked ? 'mt-1 flex-1 border-l-2 border-dashed' : 'mt-1 w-0.5 flex-1'}
                        style={nextLocked ? { borderColor: BORDER } : { backgroundColor: PRIMARY }}
                      />
                    )}
                  </span>
                  <span className="pb-4 pt-1">
                    <span
                      className="block text-sm font-medium"
                      style={{ color: isCurrent ? PRIMARY : isLocked ? SUB_TEXT : TEXT }}
                    >
                      {step.title}
                    </span>
                    <span className="mt-1 block text-xs" style={{ color: SUB_TEXT }}>
                      {step.description}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="lg:hidden">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-semibold text-[#3157E5]">
            STEP {currentStep} / {diagnosisSteps.length}
          </span>
          <span className="text-[#667085]">{currentTitle}</span>
        </div>
        <ProgressBar current={currentStep - 1} total={diagnosisSteps.length - 1} />
      </div>
    </>
  )
}
