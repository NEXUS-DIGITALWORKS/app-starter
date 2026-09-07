-- 自動生成ファイル。手編集禁止。
-- 再生成: npm run registry:generate-seed （data/*.seed.ts を編集してから実行すること）

INSERT INTO registry_releases (id, version_label, status, notes, created_at, published_at) VALUES (1, '2026.09.1', 'published', '初期データ移行（Supabase未接続のためP4スコープ内で新規作成）', '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z');
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('frontend', 1, 'フロントエンド・Web画面', 1);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('ui-design', 1, 'UI・デザイン基盤', 2);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('mobile-desktop', 1, 'モバイル・デスクトップアプリ', 3);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('backend', 1, 'バックエンド・API・リアルタイム', 4);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('database', 1, 'データベース・キャッシュ・データ基盤', 5);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('orm', 1, 'ORM・データ操作', 6);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('auth', 1, '認証・認可・ユーザー管理', 7);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('storage', 1, 'ファイル・画像・文書管理', 8);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('ai', 1, 'AI・検索・自動化', 9);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('hosting', 1, '公開・実行基盤・インフラ', 10);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('dev-approach', 1, '開発方式・品質・監視', 11);
INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES ('saas-product', 1, 'SaaS製品', 12);
