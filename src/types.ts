export type Status = 'not-started' | 'in-progress' | 'completed'
export type Slot = { id: string; label: string; value: string }
export type Sentence = { id: string; keywords: string[]; slots: Slot[]; completed: boolean }
export type Topic = { id: string; title: string; createdAt: number; updatedAt: number; status: Status; keywords: string[]; sentences: Sentence[]; finalText: string }
export type Backup = { version: 1; exportedAt: string; topics: Topic[] }
