-- FSRS Schema Migration
-- Adds missing FSRS state columns required by the ts-fsrs library.
-- Run this in the Supabase SQL editor.

ALTER TABLE fsrs_cards
  ADD COLUMN IF NOT EXISTS state INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lapses INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS elapsed_days INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scheduled_days INTEGER NOT NULL DEFAULT 0;

-- review_count is repurposed as the FSRS reps field.
-- Reset any rows where it was incorrectly set to a grade value (1-4)
-- instead of an actual repetition count.
UPDATE fsrs_cards SET review_count = 0 WHERE review_count BETWEEN 1 AND 4;
