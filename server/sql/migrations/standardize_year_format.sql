-- Migration: Standardize year of study format to E1, E2, E3, E4
-- Converts existing year values (I, II, III, IV or 1, 2, 3, 4) to E1, E2, E3, E4

UPDATE students
SET year = CASE
  WHEN LOWER(TRIM(year)) IN ('i', '1', 'first', 'e1') THEN 'E1'
  WHEN LOWER(TRIM(year)) IN ('ii', '2', 'second', 'e2') THEN 'E2'
  WHEN LOWER(TRIM(year)) IN ('iii', '3', 'third', 'e3') THEN 'E3'
  WHEN LOWER(TRIM(year)) IN ('iv', '4', 'fourth', 'e4') THEN 'E4'
  ELSE year
END
WHERE year IS NOT NULL;
