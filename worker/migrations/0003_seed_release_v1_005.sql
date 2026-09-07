-- 自動生成ファイル。手編集禁止。
-- 再生成: npm run registry:generate-seed （data/*.seed.ts を編集してから実行すること）

INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES ('app_type:internal_ops', 1, 'app_type', '社内業務システム', '部門・全社の定常業務を電子化する汎用システム', 0);
INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES ('app_type:crm_deals', 1, 'app_type', '顧客・案件管理', '顧客・商談・案件の進捗を一元管理', 1);
INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES ('app_type:approval_workflow', 1, 'app_type', '申請・承認システム', '多段階承認・条件分岐のあるワークフロー', 2);
INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES ('app_type:reservation', 1, 'app_type', '予約・受付システム', '日時・リソースに紐づく予約と受付管理', 3);
INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES ('app_type:inventory', 1, 'app_type', '在庫・受発注・商品管理', '在庫数・入出庫・発注点管理', 4);
INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES ('app_type:knowledge_ai_search', 1, 'app_type', '情報管理・ナレッジ管理／AI検索', '社内文書・ノウハウの蓄積と検索（RAG含む）', 5);
INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES ('app_type:saas_integration', 1, 'app_type', 'SaaS間データ連携・業務自動化', '複数SaaS/基幹システム間のデータ同期・自動化', 6);
INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES ('app_type:dashboard_analytics', 1, 'app_type', 'ダッシュボード・分析', '複数データソースを集約した可視化', 7);
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'kintone', 'app_type:internal_ops');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'kintone', 'app_type:crm_deals');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'kintone', 'app_type:approval_workflow');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'kintone', 'app_type:inventory');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'm365_power_platform', 'app_type:internal_ops');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'm365_power_platform', 'app_type:approval_workflow');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'salesforce_sales_cloud', 'app_type:crm_deals');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'hubspot_crm', 'app_type:crm_deals');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'coubic_stores_reserve', 'app_type:reservation');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'logizard_zero', 'app_type:inventory');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'notion_qast', 'app_type:knowledge_ai_search');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'zendesk', 'app_type:saas_integration');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'power_automate_zapier', 'app_type:saas_integration');
INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (1, 'looker_studio', 'app_type:dashboard_analytics');
