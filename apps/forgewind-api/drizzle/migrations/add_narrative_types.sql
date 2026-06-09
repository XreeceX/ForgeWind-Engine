-- Add new narrative types for AI agent capabilities
-- Run once against the production database before deploying the new agent endpoints

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'profile_optimization'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'narrative_type')
  ) THEN
    ALTER TYPE narrative_type ADD VALUE 'profile_optimization';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'skill_analysis'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'narrative_type')
  ) THEN
    ALTER TYPE narrative_type ADD VALUE 'skill_analysis';
  END IF;
END $$;
