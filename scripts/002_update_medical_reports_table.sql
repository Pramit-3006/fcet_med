-- Update medical reports table structure for new system
ALTER TABLE medical_reports 
ADD COLUMN IF NOT EXISTS enhanced_image_url TEXT,
ADD COLUMN IF NOT EXISTS analysis_results JSONB,
ADD COLUMN IF NOT EXISTS confidence_score INTEGER,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'uploaded';

-- Update existing records
UPDATE medical_reports SET status = 'uploaded' WHERE status IS NULL;
