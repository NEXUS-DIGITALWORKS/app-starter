-- registry_technologies に評価値・ステータス・メモ列を追加する。
-- 既存113件は未評価のまま（NULL）とし、管理画面から後で埋める運用とする。
ALTER TABLE registry_technologies ADD COLUMN security_score INTEGER;
ALTER TABLE registry_technologies ADD COLUMN cost_score INTEGER;
ALTER TABLE registry_technologies ADD COLUMN development_speed_score INTEGER;
ALTER TABLE registry_technologies ADD COLUMN ai_coding_score INTEGER;
ALTER TABLE registry_technologies ADD COLUMN scalability_score INTEGER;
ALTER TABLE registry_technologies ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated'));
ALTER TABLE registry_technologies ADD COLUMN notes TEXT;
