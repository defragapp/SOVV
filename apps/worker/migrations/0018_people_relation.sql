-- Migration: 0018_people_relation
-- Add relation column to people table for Compare With Someone feature.
-- Stores the relationship type (e.g. "partner", "parent", "sibling", "friend")
ALTER TABLE people ADD COLUMN relation TEXT;
