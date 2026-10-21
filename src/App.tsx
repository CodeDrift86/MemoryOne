import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ArrowRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Eye,
  PartyPopper,
  Pencil,
  Shuffle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Kbd } from "@/components/ui/kbd"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { SAMPLE, STEPS, hiddenAt, loadText, prepare, saveText, type Glyph } from "@/lib/memorize"

type Session = { glyphs: Glyph[]; hideable: number }

export default function App() {
  const [text, setText] = useState(() => loadText() || SAMPLE)
  const [session, setSession] = useState<Session | null>(null)
  const [step, setStep] = useState(0)

  const start = () => {
    const clean = text.replace(/\r\n/g, "\n")
    if (!clean.trim()) return
    saveText(clean)
    setSession(prepare(clean))
    setStep(0)
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div className="min-h-svh bg-background pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pt-10 pb-16">
          <header className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpenText className="size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-2xl font-semibold tracking-tight">MemoryOne</h1>
              <p className="text-sm text-muted-foreground">
                Learn a passage by heart, one in twenty letters at a time.
              </p>
            </div>
          </header>

          {session ? (
            <Practice
              session={session}
              step={step}
              setStep={setStep}
              onShuffle={start}
              onEdit={() => setSession(null)}
            />
          ) : (
            <Editor text={text} setText={setText} onStart={start} />
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

function Editor({
  text,
  setText,
  onStart,
}: {
  text: string
  setText: (t: string) => void
  onStart: () => void
}) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const letters = text.replace(/\s/g, "").length
  const isSample = text === SAMPLE

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your passage</CardTitle>
        <CardDescription>
          Paste a speech, poem, verse or script. Paragraph breaks are kept.
          {isSample && " The Gettysburg Address is loaded as an example."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          id="passage-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to memorize…"
          className="min-h-72 font-serif text-base leading-7 md:text-base"
        />
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground tabular-nums">
          {words} words · {letters} characters to hide
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {!isSample && (
            <Button variant="ghost" onClick={() => setText(SAMPLE)}>
              Load example
            </Button>
          )}
          <Button onClick={onStart} disabled={!text.trim()}>
            Start memorizing
            <ArrowRight />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function Practice({
  session,
  step,
  setStep,
  onShuffle,
  onEdit,
}: {
  session: Session
  step: number
  setStep: (s: number) => void
  onShuffle: () => void
  onEdit: () => void
}) {
  const [peek, setPeek] = useState(false)
  const hidden = hiddenAt(session.hideable, step)
  const pct = Math.round((100 * hidden) / Math.max(session.hideable, 1))
  const done = step === STEPS

  const forward = useCallback(() => setStep(Math.min(STEPS, step + 1)), [step, setStep])
  const back = useCallback(() => setStep(Math.max(0, step - 1)), [step, setStep])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("[role=slider]")) return
      if (e.key === "ArrowRight") forward()
      else if (e.key === "ArrowLeft") back()
      else if (e.key === " ") setPeek(true)
      else return
      e.preventDefault()
    }
    const up = (e: KeyboardEvent) => e.key === " " && setPeek(false)
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [forward, back])

  const passage = useMemo(
    () =>
      session.glyphs.map(({ ch, rank }, i) =>
        rank < 0 ? (
          ch
        ) : (
          <span key={i} className={rank < hidden ? "glyph-hidden" : undefined}>
            {ch}
          </span>
        )
      ),
    [session, hidden]
  )

  return (
    <div className="flex flex-col gap-4">
      <Card className="sticky top-[env(safe-area-inset-top)] z-10 gap-4 py-4 shadow-md">
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="flex flex-wrap items-center gap-2">
            <ShortcutTip label="Bring back the last letters" keys="←">
              <Button variant="outline" onClick={back} disabled={step === 0}>
                <ChevronLeft />
                Back
              </Button>
            </ShortcutTip>
            <ShortcutTip label="Hide the next 1 in 20 letters" keys="→">
              <Button onClick={forward} disabled={done}>
                Forward
                <ChevronRight />
              </Button>
            </ShortcutTip>
            <ShortcutTip label="Show hidden letters while held" keys="Space">
              <Button
                variant="secondary"
                aria-pressed={peek}
                onPointerDown={() => setPeek(true)}
                onPointerUp={() => setPeek(false)}
                onPointerLeave={() => setPeek(false)}
                onPointerCancel={() => setPeek(false)}
              >
                <Eye />
                Hold to peek
              </Button>
            </ShortcutTip>
            <div className="ml-auto flex items-center gap-2 text-sm tabular-nums">
              <Badge variant="secondary">
                Step {step} of {STEPS}
              </Badge>
              <span className="text-muted-foreground">{pct}% hidden</span>
            </div>
          </div>
          <Slider
            aria-label="Jump to step"
            min={0}
            max={STEPS}
            step={1}
            value={[step]}
            onValueChange={([v]) => setStep(v)}
          />
        </CardContent>
      </Card>

      {done && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-accent px-4 py-3 text-sm text-accent-foreground">
          <PartyPopper className="mt-0.5 size-4 shrink-0" />
          <p>
            Every letter is hidden. Recite the passage from the gaps alone, or step back if you get
            stuck.
          </p>
        </div>
      )}

      <Card>
        <CardContent>
          <div
            className={cn(
              "font-serif text-lg leading-[2.1] break-words whitespace-pre-wrap sm:text-xl",
              peek && "peeking"
            )}
          >
            {passage}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onShuffle}>
          <Shuffle />
          Start over in a new order
        </Button>
        <Button variant="ghost" onClick={onEdit}>
          <Pencil />
          Edit text
        </Button>
        <p className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd> step <Kbd>Space</Kbd> peek
        </p>
      </div>

    </div>
  )
}

function ShortcutTip({
  label,
  keys,
  children,
}: {
  label: string
  keys: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        {label}
        <Kbd>{keys}</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
