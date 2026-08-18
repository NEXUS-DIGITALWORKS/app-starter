-- =========================================================
-- categories 初期データ投入（実Magentoカテゴリツリーからのインポート）
-- 依存: setup_categories.sql（先に実行しておくこと）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行してください。
--   ON CONFLICT (code) DO NOTHING により、再実行しても重複投入されません
--   （既存データの上書きはしません。名称等を修正したい場合はUPDATEを別途実行してください）。
--
-- データソースと制約:
--   Magentoのカテゴリ全量エクスポート（category_id, parent_id, level, position, path,
--   category_name の列を持つCSV/JSON）から、ja/en共通ツリーのルート category_id=355
--   （MIKJapanMain）配下を実データとしてインポートしたもの。code列は 'm'+Magentoの
--   category_id（例: m363）で、magento_category_id 列と1:1で対応する。
--   繁体字(zh_tw)側は category_id=356（関西美克薬粧Main、zh_tw専用ツリーのルート）配下
--   から、355側カテゴリとposition/名称の対応が確認できた210件中193件について
--   name_zh_tw / magento_category_id_zh_tw を実データで設定している。
--   対応が取れなかった17件（578 Agent for callus, 581 Crude drugs, 612 Deodorant,
--   454 Breastfeeding/weaning supplies重複分, 712 Sleep Symptoms重複分、および
--   111配下の季節催事の一部）はzh_tw側に相当するカテゴリが存在しないためNULLのまま
--   （表示は name_en へのフォールバックで解決する）。
--   356配下には355側に対応がない繁体字専用カテゴリ（人氣商品=296とその配下11件、
--   當天出貨=734）も存在するが、今回は355側を主構造とするインポート方針のため
--   未取込（別途取り込む場合は改めて相談）。
--   name_ja はいずれのソースにも存在しないため、全カテゴリでNULL。
--   なお、Magentoの「Default Category」（category_id=2）配下は355ツリーと重複する
--   レガシー/未使用ツリーとみなし、インポート対象から除外している。
-- =========================================================

-- ---------------------------------------------------------
-- カテゴリデータ本体
-- ---------------------------------------------------------

-- Level 1 (355直下のトップレベルカテゴリ)
INSERT INTO public.categories (code, parent_id, category_type, name_en, name_zh_tw, magento_category_id, magento_category_id_zh_tw, sort_order, is_active)
SELECT v.code, NULL, v.category_type, v.name_en, v.name_zh_tw, v.magento_category_id, v.magento_category_id_zh_tw, v.sort_order, v.is_active
FROM (VALUES
  ('m108', 'feature', 'New Arrivals', '活動快訊', '108', '617', 10, true),
  ('m363', 'standard', 'Pharmaceuticals', '藥品', '363', '466', 20, true),
  ('m362', 'standard', 'Medical supplies', '醫療用品', '362', '471', 30, true),
  ('m361', 'standard', 'Healthy food', '健康食品', '361', '470', 40, true),
  ('m360', 'standard', 'Daily miscellaneous goods', '日常雜貨', '360', '469', 50, true),
  ('m359', 'standard', 'Cosmetics', '化妝品', '359', '468', 60, true),
  ('m358', 'standard', 'Baby products', '嬰兒用品', '358', '467', 70, true),
  ('m357', 'standard', 'Food', '食品', '357', '472', 80, true),
  ('m589', 'theme', 'Japanese Culture Products', '日本文化產品', '589', '591', 90, true),
  ('m65', 'feature', 'Featured Products', NULL, '65', NULL, 100, true),
  ('m346', 'special', 'ORGANIC ALOEVERA', '有機產品', '346', '593', 110, true),
  ('m624', 'campaign', '2022-2023 New year special sale Japanese popular brands', '2022-2023 新年特別的折扣 流行品牌撿起', '624', '625', 120, true),
  ('m629', 'standard', 'Brands', '品牌', '629', '628', 130, true),
  ('m654', 'standard', 'pet products', '寵物用品', '654', '658', 140, true),
  ('m667', 'campaign', 'Manager''s choice', '店長推薦', '667', '669', 150, true),
  ('m672', 'campaign', 'Special Discount', '特別折扣', '672', '675', 160, true),
  ('m684', 'purpose', 'Symptom-specific page', '按症狀分類的產品', '684', '697', 170, true),
  ('m761', 'campaign', 'Outlet', 'Outlet特賣', '761', '762', 180, true)
) AS v(code, category_type, name_en, name_zh_tw, magento_category_id, magento_category_id_zh_tw, sort_order, is_active)
ON CONFLICT (code) DO NOTHING;

-- Level 2 (Level 1の子カテゴリ)
INSERT INTO public.categories (code, parent_id, category_type, name_en, name_zh_tw, magento_category_id, magento_category_id_zh_tw, sort_order, is_active)
SELECT v.code, p.id, v.category_type, v.name_en, v.name_zh_tw, v.magento_category_id, v.magento_category_id_zh_tw, v.sort_order, v.is_active
FROM (VALUES
  ('m745', 'm108', 'feature', 'New Products', '新到貨品', '745', '746', 10, true),
  ('m107', 'm108', 'feature', 'NEW ITEMS', '新物品', '107', '600', 20, true),
  ('m111', 'm108', 'campaign', 'Special feature', NULL, '111', NULL, 30, true),
  ('m621', 'm108', 'feature', 'New Arrivals _ slideshow', '新物品 _ slideshow', '621', '622', 40, true),
  ('m364', 'm363', 'standard', 'Vitamin nutrition', '維生素營養', '364', '473', 10, true),
  ('m365', 'm363', 'standard', 'Nourishing tonic health agent', '滋補保健劑', '365', '474', 20, true),
  ('m367', 'm363', 'standard', 'Drink ampoule', '喝安瓿', '367', '476', 30, true),
  ('m368', 'm363', 'standard', 'Anti-drowsiness agent', '抗嗜睡劑', '368', '477', 40, true),
  ('m369', 'm363', 'standard', 'Gastrointestinal drug', '腸胃藥', '369', '478', 50, true),
  ('m370', 'm363', 'standard', 'Intestinal medicine', '腸道醫學', '370', '479', 60, true),
  ('m371', 'm363', 'standard', 'Laxatives', '瀉藥', '371', '480', 70, true),
  ('m372', 'm363', 'standard', 'Cold medicine', '感冒藥', '372', '481', 80, true),
  ('m373', 'm363', 'standard', 'Rhinitis medicine', '鼻炎藥', '373', '482', 90, true),
  ('m374', 'm363', 'standard', 'Cough medicine', '止咳藥', '374', '483', 100, true),
  ('m375', 'm363', 'standard', 'Nasal spray', '噴鼻劑', '375', '484', 110, true),
  ('m376', 'm363', 'standard', 'Mouthwash', '漱口水', '376', '485', 120, true),
  ('m377', 'm363', 'standard', 'Lozenges and throat candies', '錠劑和潤喉糖', '377', '486', 130, true),
  ('m378', 'm363', 'standard', 'External analgesia and anti-inflammatory agent', '外用鎮痛消炎藥', '378', '487', 140, true),
  ('m379', 'm363', 'standard', 'Oral analgesia and anti-inflammatory agent', '口服鎮痛和抗炎藥', '379', '488', 150, true),
  ('m380', 'm363', 'standard', 'Sedative antihistamine', '鎮靜抗組胺藥', '380', '489', 160, true),
  ('m381', 'm363', 'standard', 'Skin disease medicine', '皮膚病藥', '381', '490', 170, true),
  ('m382', 'm363', 'standard', 'Anti-itch & insect repellent', '止癢、驅蟲', '382', '491', 180, true),
  ('m383', 'm363', 'standard', 'Water bug medicine', '水蟲藥', '383', '492', 190, true),
  ('m384', 'm363', 'standard', 'Agent for callus & octopus and warts', '癒傷組織、章魚和疣的代理', '384', '493', 200, true),
  ('m385', 'm363', 'standard', 'Hair restorer dandruff hair loss prevention', '生髮劑去屑預防脫髮', '385', '494', 210, true),
  ('m386', 'm363', 'standard', 'Hemorrhoid disease drug', '痔瘡藥', '386', '495', 230, true),
  ('m387', 'm363', 'standard', 'Eye drops', '眼藥水', '387', '496', 240, true),
  ('m388', 'm363', 'standard', 'Oral medicine', '口服藥', '388', '497', 250, true),
  ('m389', 'm363', 'standard', 'Smoking cessation aid', '戒菸輔助', '389', '498', 260, true),
  ('m390', 'm363', 'standard', 'Vehicle antidiarrheal', '車用止瀉藥', '390', '499', 270, true),
  ('m391', 'm363', 'standard', 'Obesity improving drug', '肥胖改善藥', '391', '500', 280, true),
  ('m392', 'm363', 'standard', 'Chinese herbal medicine', '中草藥', '392', '501', 290, true),
  ('m393', 'm363', 'standard', 'Crude drugs & healthy tea', '生藥、養生茶', '393', '502', 300, true),
  ('m394', 'm363', 'standard', 'Japanese Pharmacopoeia', '日本藥典', '394', '503', 310, true),
  ('m578', 'm363', 'standard', 'Agent for callus', NULL, '578', NULL, 330, true),
  ('m581', 'm363', 'standard', 'Crude drugs', NULL, '581', NULL, 340, true),
  ('m614', 'm363', 'standard', 'Industrial chemicals & Food additives', '工業化學品、食品添加劑、他', '614', '666', 350, true),
  ('m662', 'm363', 'standard', 'drug for testing', '測試藥物', '662', '664', 360, true),
  ('m663', 'm363', 'standard', 'specialty drugs', '特殊藥物', '663', '665', 370, true),
  ('m366', 'm362', 'standard', 'Light medical supplies', '輕型醫療用品', '366', '475', 10, true),
  ('m395', 'm362', 'standard', 'Nursing supplies', '護理用品', '395', '504', 20, true),
  ('m396', 'm362', 'standard', 'Supporters', '支持者', '396', '505', 30, true),
  ('m397', 'm362', 'standard', 'Health equipment', '保健設備', '397', '506', 40, true),
  ('m398', 'm362', 'standard', 'Contraceptives', '避孕藥', '398', '507', 50, true),
  ('m399', 'm362', 'standard', 'First aid van', '急救膠布', '399', '508', 60, true),
  ('m400', 'm362', 'standard', 'Clean cotton', '清潔棉', '400', '509', 70, true),
  ('m401', 'm362', 'standard', 'Cotton swab', '棉籤', '401', '510', 80, true),
  ('m402', 'm362', 'standard', 'Pregnant women''s products', '孕婦用品', '402', '511', 90, true),
  ('m583', 'm362', 'standard', 'Contact agents', '聯繫代理', '583', '512', 110, true),
  ('m404', 'm361', 'standard', 'Health food in general', '一般保健食品', '404', '513', 10, true),
  ('m405', 'm360', 'standard', 'Paper', '紙', '405', '514', 10, true),
  ('m406', 'm360', 'standard', 'Detergent for clothing', '衣物洗滌劑', '406', '515', 20, true),
  ('m407', 'm360', 'standard', 'Finishing agent', '整理劑', '407', '516', 30, true),
  ('m408', 'm360', 'standard', 'Kitchen detergent', '廚房清潔劑', '408', '517', 40, true),
  ('m409', 'm360', 'standard', 'Residential detergent', '家用洗滌劑', '409', '518', 50, true),
  ('m410', 'm360', 'standard', 'Toothpaste', '牙膏', '410', '519', 60, true),
  ('m411', 'm360', 'standard', 'Toothbrush', '牙刷', '411', '520', 70, true),
  ('m412', 'm360', 'standard', 'Oral related products', '口腔相關產品', '412', '521', 80, true),
  ('m413', 'm360', 'standard', 'Denture supplies', '義齒用品', '413', '522', 90, true),
  ('m584', 'm360', 'standard', 'shampoo rinse', '洗髮水', '584', '523', 110, true),
  ('m415', 'm360', 'standard', 'Hair care products', '護髮產品', '415', '524', 120, true),
  ('m416', 'm360', 'standard', 'Hair dye', '染髮劑', '416', '525', 130, true),
  ('m417', 'm360', 'standard', 'Soap', '肥皂', '417', '526', 140, true),
  ('m418', 'm360', 'standard', 'Bathing supplies', '沐浴用品', '418', '527', 150, true),
  ('m419', 'm360', 'standard', 'Deodorants', '除臭劑', '419', '528', 160, true),
  ('m420', 'm360', 'standard', 'Insect repellent', '驅蟲劑', '420', '529', 170, true),
  ('m421', 'm360', 'standard', 'Aromatic', '芳香', '421', '530', 180, true),
  ('m586', 'm360', 'standard', 'Deodorant / disinfectant', '除臭劑/消毒劑', '586', '531', 190, true),
  ('m423', 'm360', 'standard', 'Damp proofing supplies', '防潮用品', '423', '532', 220, true),
  ('m424', 'm360', 'standard', 'Cooking gloves', '烹飪手套', '424', '533', 230, true),
  ('m425', 'm360', 'standard', 'Cairo supplies', '開羅用品', '425', '534', 240, true),
  ('m426', 'm360', 'standard', 'Foot care products', '足部護理產品', '426', '535', 250, true),
  ('m427', 'm360', 'standard', 'Shoes care products', '鞋類護理產品', '427', '536', 260, true),
  ('m428', 'm360', 'standard', 'Shaving and face shaving supplies', '剃須和剃須用品', '428', '537', 270, true),
  ('m429', 'm360', 'standard', 'Summer skin care', '夏季護膚', '429', '538', 280, true),
  ('m430', 'm360', 'standard', 'Napkin', '餐巾', '430', '539', 290, true),
  ('m431', 'm360', 'standard', 'Tampon', '衛生棉條', '431', '540', 300, true),
  ('m432', 'm360', 'standard', 'Sanitary shorts', '衛生短褲', '432', '541', 310, true),
  ('m433', 'm360', 'standard', 'Insecticide', '殺蟲劑', '433', '542', 320, true),
  ('m434', 'm360', 'standard', 'Gardening medicine', '園藝藥', '434', '543', 330, true),
  ('m435', 'm360', 'standard', 'Laundry and clothes drying supplies', '洗衣和乾衣用品', '435', '544', 340, true),
  ('m436', 'm360', 'standard', 'Kitchen utensils', '廚房用具', '436', '545', 350, true),
  ('m437', 'm360', 'standard', 'Bathroom / toilet supplies', '浴室/廁所用品', '437', '546', 360, true),
  ('m438', 'm360', 'standard', 'Cleaning products', '清潔產品', '438', '547', 370, true),
  ('m439', 'm360', 'standard', 'Food packaging supplies', '食品包裝用品', '439', '548', 380, true),
  ('m440', 'm360', 'standard', 'Table supplies', '餐桌用品', '440', '549', 390, true),
  ('m441', 'm360', 'standard', 'Cooking utensils', '炊具', '441', '550', 400, true),
  ('m442', 'm360', 'standard', 'Living supplies', '生活用品', '442', '551', 410, true),
  ('m443', 'm360', 'standard', 'Daily accessories', '日常配飾', '443', '552', 420, true),
  ('m612', 'm360', 'standard', 'Deodorant', NULL, '612', NULL, 430, true),
  ('m444', 'm359', 'standard', 'Skin care products', '護膚品', '444', '553', 10, true),
  ('m445', 'm359', 'standard', 'Basic cosmetics', '基礎化妝品', '445', '554', 20, true),
  ('m446', 'm359', 'standard', 'Makeup cosmetics', '化妝化妝品', '446', '555', 30, true),
  ('m447', 'm359', 'standard', 'Fragrances and colons', '香水和冒號', '447', '556', 40, true),
  ('m448', 'm359', 'standard', 'Men''s cosmetics', '男士化妝品', '448', '557', 50, true),
  ('m449', 'm359', 'standard', 'Basic cosmetics for men', '男士基礎化妝品', '449', '558', 60, true),
  ('m450', 'm359', 'standard', 'Makeup cosmetics for men', '男士化妝品2', '450', '559', 70, true),
  ('m451', 'm359', 'standard', 'Makeup miscellaneous goods', '化妝雜貨', '451', '560', 80, true),
  ('m452', 'm359', 'standard', 'Other cosmetics', '其他化妝品', '452', '561', 90, true),
  ('m453', 'm358', 'standard', 'Baby diaper supplies', '嬰兒紙尿褲用品', '453', '562', 10, true),
  ('m588', 'm358', 'standard', 'Breastfeeding / weaning supplies', '母乳喂養/斷奶用品', '588', '563', 20, true),
  ('m454', 'm358', 'standard', 'Breastfeeding / weaning supplies', NULL, '454', NULL, 30, true),
  ('m455', 'm358', 'standard', 'Baby healthcare products', '嬰兒保健品', '455', '564', 40, true),
  ('m456', 'm358', 'standard', 'Baby skin care products', '嬰兒護膚品', '456', '565', 50, true),
  ('m457', 'm358', 'standard', 'Milks', '牛奶', '457', '566', 60, true),
  ('m458', 'm358', 'standard', 'Baby food', '嬰兒食品', '458', '567', 70, true),
  ('m459', 'm357', 'standard', 'Beverages', '飲料', '459', '568', 10, true),
  ('m460', 'm357', 'standard', 'Luxury items', '奢侈品', '460', '569', 20, true),
  ('m461', 'm357', 'standard', 'Confectionery', '糖菓', '461', '570', 30, true),
  ('m462', 'm357', 'standard', 'Processed foods', '加工食品', '462', '571', 40, true),
  ('m463', 'm357', 'standard', 'Seasoning', '調味料', '463', '572', 50, true),
  ('m464', 'm357', 'standard', 'Cereals', '穀物', '464', '573', 60, true),
  ('m465', 'm357', 'standard', 'Food gifts', '食品禮品', '465', '574', 70, true),
  ('m347', 'm346', 'special', 'Healthy Food', '有機保健食品', '347', '594', 10, true),
  ('m348', 'm346', 'special', 'Skincare Products', '有機美肌護膚產品', '348', '595', 20, true),
  ('m349', 'm346', 'special', 'Hair&Body Products', '有機保养头发&身體護理產品', '349', '596', 30, true),
  ('m350', 'm346', 'special', 'Household Goods', '有機日用品', '350', '597', 40, true),
  ('m642', 'm629', 'standard', 'ARINAMIN (takeda)', '【ARINAMIN製藥 (武田)】', '642', '630', 10, true),
  ('m643', 'm629', 'standard', 'KOWA', '【興和】', '643', '631', 20, true),
  ('m644', 'm629', 'standard', 'LION', '【LION 獅王】', '644', '632', 30, true),
  ('m645', 'm629', 'standard', 'Rohto', '【樂敦製藥】', '645', '633', 40, true),
  ('m646', 'm629', 'standard', 'DHC', '【DHC】', '646', '634', 50, true),
  ('m647', 'm629', 'standard', 'Ohta''s Isan', '【太田胃散】', '647', '635', 60, true),
  ('m648', 'm629', 'standard', 'Daiichi Sankyo', '【第一三共】', '648', '636', 70, true),
  ('m649', 'm629', 'standard', 'Taisho Pharmaceutical', '【大正製藥】', '649', '637', 80, true),
  ('m650', 'm629', 'standard', 'Hisamitsu', '【久光製藥】', '650', '638', 90, true),
  ('m651', 'm629', 'standard', 'finetoday / Shiseido', '【finetoday】【資生堂】', '651', '639', 100, true),
  ('m652', 'm629', 'standard', 'Kobayashi', '【小林製藥】', '652', '640', 110, true),
  ('m653', 'm629', 'standard', 'Ryukakusan', '【龍角散】', '653', '641', 120, true),
  ('m726', 'm629', 'standard', 'Otsuka Pharmaceutical', '【大塚製藥】', '726', '727', 130, true),
  ('m655', 'm654', 'standard', 'pet tools', '寵物食品', '655', '659', 10, true),
  ('m656', 'm654', 'standard', 'pet food', '寵物設備', '656', '660', 20, true),
  ('m657', 'm654', 'standard', 'animal products', '動物用品', '657', '661', 30, true),
  ('m739', 'm667', 'campaign', 'Set discount sale', '組合購買', '739', '740', 10, true),
  ('m668', 'm667', 'campaign', 'Recommended skin medicine', '推薦皮膚藥', '668', '670', 20, true),
  ('m678', 'm667', 'campaign', 'Vitamin C Cosmetics', '維生素C化妝品', '678', '679', 30, true),
  ('m680', 'm667', 'campaign', 'Hisamitsu Pharmaceutical Recommended Products', '久光製藥推薦產品', '680', '681', 40, true),
  ('m682', 'm667', 'campaign', 'Weight Loss Support Products', '減肥支持產品', '682', '683', 50, true),
  ('m710', 'm667', 'campaign', 'Good Sleep Products', '良好的睡眠產品', '710', '711', 60, true),
  ('m714', 'm667', 'campaign', 'Cold Prevention Products', '預防感冒產品', '714', '715', 70, true),
  ('m718', 'm667', 'campaign', 'Top 30 sales in 2023', '2023年銷售前30名', '718', '719', 80, true),
  ('m720', 'm667', 'campaign', 'Popular beauty care products', '流行的美容護理產品', '720', '721', 90, true),
  ('m722', 'm667', 'campaign', 'Eye care products', '眼部護理產品', '722', '723', 100, true),
  ('m724', 'm667', 'campaign', 'DHC various supplements', 'DHC各種補充劑', '724', '725', 110, true),
  ('m728', 'm667', 'campaign', 'Happy Mothers Day', '母親節快樂', '728', '729', 120, true),
  ('m730', 'm667', 'campaign', 'Mosquito and fly prevention products', '防蚊、防蠅產品', '730', '731', 130, true),
  ('m732', 'm667', 'campaign', 'Sunscreen Feature', '防曬乳液', '732', '733', 140, true),
  ('m735', 'm667', 'campaign', 'Souvenirs from Japan', '日本特產特輯', '735', '736', 150, true),
  ('m737', 'm667', 'campaign', 'Matcha Green Tea Fair', '抹茶博覽會', '737', '738', 160, true),
  ('m741', 'm667', 'campaign', 'DHC supplement set', 'DHC 補充套裝', '741', '743', 170, true),
  ('m742', 'm667', 'campaign', 'Character Merchandise', '日本動漫人物產品', '742', '744', 180, true),
  ('m673', 'm672', 'campaign', 'Pharmaceutical special discount', '藥品特別折扣', '673', '676', 10, true),
  ('m674', 'm672', 'campaign', 'Healthcare products special discount', '保健品特別折扣', '674', '677', 20, true),
  ('m747', 'm672', 'campaign', 'Sunscreen Special Feature', '防曬產品推薦', '747', '748', 30, true),
  ('m750', 'm672', 'campaign', 'acne and rough skin special feature', '痘痘・肌膚問題特輯', '750', '749', 40, true),
  ('m753', 'm672', 'campaign', 'Customer Appreciation Sale', '享受光棍節吧', '753', '754', 50, true),
  ('m756', 'm672', 'campaign', 'Big Winter Thanks Sale', '新春特賣2026', '756', '755', 60, true),
  ('m757', 'm672', 'campaign', 'Mother''s day', '母親節', '757', '758', 70, true),
  ('m759', 'm672', 'campaign', 'Share the Love with Japan Direct', '520我愛你', '759', '760', 80, true),
  ('m763', 'm672', 'campaign', 'hit in Japan', '日本超熱銷', '763', '764', 90, true),
  ('m765', 'm672', 'campaign', 'Beat the heat rated UV & sweat-care2026', '盛夏來臨！防曬與抗汗專區2026', '765', '766', 100, true),
  ('m685', 'm684', 'purpose', 'Cold Medicine', '感冒藥', '685', '698', 10, true),
  ('m686', 'm684', 'purpose', 'Eye Fatigue', '眼睛疲勞', '686', '699', 20, true),
  ('m687', 'm684', 'purpose', 'Vitamin Supplements', '維生素補充劑', '687', '700', 30, true),
  ('m688', 'm684', 'purpose', 'Skin Medecation', '皮膚藥、止癢藥', '688', '701', 40, true),
  ('m689', 'm684', 'purpose', 'Antipyretic Analgesic', '解熱鎮痛藥', '689', '702', 50, true),
  ('m690', 'm684', 'purpose', 'External Analgesic', '外用鎮痛劑', '690', '703', 60, true),
  ('m691', 'm684', 'purpose', 'Stomach Medicine', '胃藥', '691', '704', 70, true),
  ('m692', 'm684', 'purpose', 'Intestinal Medicine', '腸道醫學', '692', '705', 80, true),
  ('m693', 'm684', 'purpose', 'Sleep Symptoms Motion Sickness', '睡眠症狀、暈動病', '693', '706', 90, true),
  ('m694', 'm684', 'purpose', 'Herbal Medicine', '草藥', '694', '707', 100, true),
  ('m695', 'm684', 'purpose', 'Beauty and Whitening', '美容美白', '695', '708', 110, true),
  ('m696', 'm684', 'purpose', 'Obesity Measures', '肥胖措施', '696', '709', 120, true),
  ('m712', 'm684', 'purpose', 'Sleep Symptoms', NULL, '712', NULL, 130, true)
) AS v(code, parent_code, category_type, name_en, name_zh_tw, magento_category_id, magento_category_id_zh_tw, sort_order, is_active)
JOIN public.categories p ON p.code = v.parent_code
ON CONFLICT (code) DO NOTHING;

-- Level 3 (Level 2の子カテゴリ)
INSERT INTO public.categories (code, parent_id, category_type, name_en, name_zh_tw, magento_category_id, magento_category_id_zh_tw, sort_order, is_active)
SELECT v.code, p.id, v.category_type, v.name_en, v.name_zh_tw, v.magento_category_id, v.magento_category_id_zh_tw, v.sort_order, v.is_active
FROM (VALUES
  ('m603', 'm107', 'feature', 'Pharmaceuticals', '藥品', '603', '601', 10, true),
  ('m599', 'm107', 'feature', 'Food', '食品', '599', '602', 30, true),
  ('m605', 'm107', 'feature', 'Healthy food', '健康食品', '605', '604', 40, true),
  ('m607', 'm107', 'feature', 'Summer skin care', '夏季護膚', '607', '606', 50, true),
  ('m610', 'm107', 'feature', 'Skin care products', '基礎化妝品', '610', '611', 60, true),
  ('m618', 'm107', 'feature', 'Cold protection measures', '防寒措施', '618', '619', 70, true),
  ('m110', 'm111', 'campaign', 'Halloween 2020', NULL, '110', NULL, 10, true),
  ('m104', 'm111', 'campaign', 'Stay Home', NULL, '104', NULL, 20, true),
  ('m112', 'm111', 'campaign', 'Merry Christmas 2020', NULL, '112', NULL, 30, true),
  ('m113', 'm111', 'campaign', 'Top 10 Best Selling Products', NULL, '113', NULL, 40, true),
  ('m114', 'm111', 'campaign', 'Japanese pharmaceutical', NULL, '114', NULL, 50, true),
  ('m343', 'm111', 'campaign', 'Autumn Special Sale', NULL, '343', NULL, 60, true),
  ('m344', 'm111', 'campaign', 'TOCHIGI Fair', '栃木博覽會', '344', '345', 70, true),
  ('m592', 'm111', 'campaign', 'DHC 15% OFF Sale', NULL, '592', NULL, 80, true),
  ('m609', 'm111', 'campaign', 'Izumo Fair', NULL, '609', NULL, 90, true),
  ('m626', 'm111', 'campaign', 'KAI JIRUSHI', '貝印', '626', '627', 100, true),
  ('m623', 'm621', 'feature', 'Best sellers _ slideshow', NULL, '623', NULL, 10, true),
  ('m613', 'm612', 'standard', 'disinfectant', NULL, '613', NULL, 10, true)
) AS v(code, parent_code, category_type, name_en, name_zh_tw, magento_category_id, magento_category_id_zh_tw, sort_order, is_active)
JOIN public.categories p ON p.code = v.parent_code
ON CONFLICT (code) DO NOTHING;
