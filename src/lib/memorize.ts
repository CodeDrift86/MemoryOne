export const STEPS = 20 // each step hides 1/20 of the characters

export const SAMPLE =
  "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.\n\n" +
  "Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war."

export type Glyph = { ch: string; rank: number } // rank -1 = whitespace, never hidden

// Split text into characters and give each visible one a random hiding rank.
export function prepare(text: string): { glyphs: Glyph[]; hideable: number } {
  const glyphs: Glyph[] = []
  const visible: number[] = []
  for (const ch of text) {
    if (!/\s/.test(ch)) visible.push(glyphs.length)
    glyphs.push({ ch, rank: -1 })
  }
  for (let i = visible.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[visible[i], visible[j]] = [visible[j], visible[i]]
  }
  visible.forEach((g, rank) => (glyphs[g].rank = rank))
  return { glyphs, hideable: visible.length }
}

// Number of characters hidden after `step` steps; the final step hides everything.
export const hiddenAt = (hideable: number, step: number) => Math.round((hideable * step) / STEPS)

export function loadText(): string {
  try {
    return localStorage.getItem("memoryOne.text") || ""
  } catch {
    return ""
  }
}

export function saveText(text: string) {
  try {
    localStorage.setItem("memoryOne.text", text)
  } catch {
    // Storage can be unavailable (private windows, blocked site data); the app works without it.
  }
}
