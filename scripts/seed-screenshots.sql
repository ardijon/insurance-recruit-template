PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Reset
DELETE FROM fit_assessment_results;
DELETE FROM applicants;
DELETE FROM referral_links;
DELETE FROM success_wall_entries;
DELETE FROM growth_path_stages;
DELETE FROM faq_items;
DELETE FROM settings;
DELETE FROM success_visual_story;
DELETE FROM manager_profile;

-- 1. Manager Profile
INSERT INTO manager_profile (id, name, title, position_code, position_start_date, bio, achievements, current_agent_count, growth_agents_6m, growth_agents_1y, growth_agents_2y, growth_policies_6m, growth_policies_1y, growth_policies_2y, site_theme)
VALUES (1, 'دکتر امیر حسینی', 'مدیر فروش ارشد منطقه مرکز', 'MGR-107', '1400/06/01',
'بیش از ۱۲ سال تجربه مدیریت تیم‌های فروش بیمه عمر و سرمایه‌گذاری. فارغ‌التحصیل MBA از دانشگاه شریف. تخصص اصلی: استراتژی‌های جذب نمایندگان حرفه‌ای و طراحی سیستم‌های انگیزشی. موفق به تشکیل قوی‌ترین تیم فروش منطقه مرکز با بیش از ۶۰ نماینده فعال.',
'["کسب عنوان مدیر فروش برتر کشوری سه سال متوالی (۱۴۰۱-۱۴۰۳)","رشد ۳۲۰ درصدی تیم فروش طی ۳ سال","بیش از ۱۲۰۰ بیمه‌نامه صادر شده در سال گذشته","دریافت تندیس الماسی نمایندگی برتر از شرکت بیمه","توسعه شبکه نمایندگی در ۸ استان کشور"]',
63, 32, 75, 180, 45, 110, 250, 'warm');

-- 2. Success Wall Entries
INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES ('علی محمدی', 'وقتی وارد تیم دکتر حسینی شدم، فقط یک فروشنده بودم. الان بعد از ۱۸ ماه، مدیر تیم ۱۲ نفره‌ام و ماهیانه بیش از ۸۰ میلیون درآمد دارم. آموزش‌های حرفه‌ای و پشتیبانی مداوم، رمز موفقیته.', 1, 1);
INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES ('سارا احمدی', 'بهترین تصمیم زندگی‌ام بود که به این تیم پیوستم. از یک معلم مدرسه به مدیر فروشی رسیدم که الان ۳۵ نماینده زیرمجموعه دارم. محیط کاری صمیمی و پر از انرژی مثبت واقعاً متفاوت است.', 1, 2);
INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES ('رضا کریمی', 'با صفر سابقه و فقط یک تلفن همراه شروع کردم. امروز بعد از ۲ سال، خانه و ماشین خریدم و پس‌انداز قابل توجهی دارم. مدیرم باور داشت که من می‌تونم، حتی وقتی خودم شک داشتم.', 1, 3);
INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES ('نیلوفر حسینی', 'مادر بودن و کار کردن همزمان سخت به نظر می‌رسید، ولی این تیم انعطاف‌پذیری لازم رو فراهم کرده. الان از خونه کار می‌کنم و ماهیانه ۴۵ میلیون درآمد دارم. آزادی مالی واقعی رو تجربه می‌کنم.', 1, 4);
INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES ('محمد رستمی', '۱۰ سال در شرکت خصوصی کار کردم ولی هیچ‌وقت به درآمد و آزادی فعلی‌ام نرسیده بودم. اینجا هر روز یاد می‌گیرم و هر ماه درآمدم بیشتر می‌شه. تیم دکتر حسینی واقعاً خانواده‌ام شده.', 1, 5);
INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES ('زهرا عباسی', 'من یک مهندس عمران بودم که هیچ تصوری از بیمه نداشتم. ولی با آموزش‌های سیستماتیک این تیم، در عرض ۳ ماه به فروشنده برتر تبدیل شدم. الان درآمدم از زمان مهندسی‌ام ۳ برابر شده.', 1, 6);
INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES ('امیر جعفری', 'همیشه از فروش می‌ترسیدم تا اینکه دکتر حسینی بهم نشون داد فروش یعنی کمک کردن به مردم. وقتی دیدم چطور بیمه نامه‌ها زندگی خانواده‌ها رو تضمین می‌کنه، عاشق کارم شدم. الان سالانه بیش از ۳۰۰ بیمه‌نامه صادر می‌کنم.', 1, 7);
INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES ('مریم نوری', 'از وقتی وارد این تیم شدم، نه تنها درآمدم بالا رفته، بلکه اعتماد به نفس و مهارت‌های ارتباطی‌ام رو تقویت کردم. اینجا فقط یاد نمی‌گیری پول دربیاری، یاد می‌گیری آدم بهتری بشی.', 1, 8);

-- 3. Growth Path Stages
INSERT INTO growth_path_stages (title, description, sort_order) VALUES ('بازاریاب بیمه', 'آشنایی کامل با محصولات بیمه عمر، پس‌انداز و سرمایه‌گذاری. شرکت در دوره آموزشی ۱۰ روزه و امتحان پایان دوره. کسب مجوز رسمی نمایندگی.', 1);
INSERT INTO growth_path_stages (title, description, sort_order) VALUES ('نماینده فروش', 'شروع فروش مستقل و ایجاد شبکه ارتباطی قوی. صدور اولین بیمه‌نامه‌ها و کسب تجربه عملی. دریافت پورسانت فروش و پاداش‌های تشویقی.', 2);
INSERT INTO growth_path_stages (title, description, sort_order) VALUES ('نماینده برتر', 'رسیدن به سطح فروش بالا و کسب عنوان نماینده برتر ماه. آموزش و mentorship نمایندگان تازه‌وارد. دریافت پاداش‌های ویژه و سفرهای انگیزشی.', 3);
INSERT INTO growth_path_stages (title, description, sort_order) VALUES ('سرپرست فروش', 'جذب و مدیریت تیم ۵ تا ۱۵ نفره. آموزش تیم و نظارت بر عملکرد فروش. درآمد پایدار از فروش شخصی و زیرمجموعه.', 4);
INSERT INTO growth_path_stages (title, description, sort_order) VALUES ('مدیر فروش', 'هدایت تیم بزرگ ۲۰ تا ۵۰ نفره. طراحی استراتژی فروش و برنامه‌ریزی توسعه بازار. دریافت درآمد بالا از سطوح مختلف سازمانی.', 5);
INSERT INTO growth_path_stages (title, description, sort_order) VALUES ('مدیر فروش ارشد', 'رهبری چند تیم فروش در سراسر کشور. دریافت سهام شرکت و مشارکت در تصمیم‌گیری‌های استراتژیک. سفرهای خارجی انگیزشی و درآمد نامحدود.', 6);

-- 4. FAQ Items
INSERT INTO faq_items (question, answer, sort_order) VALUES ('آیا برای شروع کار نیاز به سابقه فروش دارم؟', 'خیر، اصلاً نیازی به سابقه فروش نیست. ما از صفر شروع می‌کنیم. دوره‌های آموزشی جامع و رایگان برای همه نمایندگان جدید برگزار می‌شود و تا زمانی که به درآمد پایدار برسید، کنارتان هستیم. بسیاری از نمایندگان موفق ما از رشته‌های کاملاً متفاوت وارد شده‌اند.', 1);
INSERT INTO faq_items (question, answer, sort_order) VALUES ('چه مدت طول می‌کشد تا نماینده رسمی شوم؟', 'پس از ثبت درخواست و مصاحبه حضوری، فرآیند آموزشی حدود ۱۰ روز کاری طول می‌کشد. در این مدت با تمام محصولات بیمه‌ای، تکنیک‌های فروش و مهارت‌های ارتباطی آشنا می‌شوید. پس از امتحان پایان دوره، مجوز رسمی نمایندگی دریافت می‌کنید و بلافاصله می‌توانید شروع به فروش کنید.', 2);
INSERT INTO faq_items (question, answer, sort_order) VALUES ('آیا امکان همکاری پاره‌وقت وجود دارد؟', 'بله، همکاری به صورت تمام‌وقت و پاره‌وقت امکان‌پذیر است. بسیاری از نمایندگان ما در کنار شغل اصلی‌شان فعالیت می‌کنند. انعطاف‌پذیری زمانی یکی از مزایای بزرگ این حرفه است. شما خودتان تصمیم می‌گیرید چند ساعت در روز وقت بگذارید.', 3);
INSERT INTO faq_items (question, answer, sort_order) VALUES ('درآمد ماهیانه یک نماینده چقدر است؟', 'درآمد کاملاً متغیر و بدون سقف است. نمایندگان تازه‌کار ماه اول بین ۱۵ تا ۲۵ میلیون درآمد دارند. با افزایش تجربه و شبکه ارتباطی، این رقم به ۵۰ تا ۱۰۰ میلیون می‌رسد. مدیران فروش موفق ما ماهیانه بالای ۲۰۰ میلیون درآمد دارند. پورسانت فروش از ۳۰٪ شروع می‌شود و با ارتقا سطح افزایش می‌یابد.', 4);
INSERT INTO faq_items (question, answer, sort_order) VALUES ('آیا نیاز به سرمایه اولیه دارم؟', 'خیر، هیچ سرمایه اولیه‌ای نیاز نیست. برخلاف بسیاری از کسب‌وکارها، اینجا فقط کافی‌ست وقت و انرژی بگذارید و آموزش‌ها را جدی بگیرید. تمام ابزارها، آموزش‌ها و حمایت‌های لازم به صورت رایگان در اختیارتان قرار می‌گیرد.', 5);
INSERT INTO faq_items (question, answer, sort_order) VALUES ('شرایط بیمه تکمیلی و مزایای جانبی چیست؟', 'نمایندگان فعال از بیمه تکمیلی درمانی، بیمه عمر گروهی و تسهیلات وام بدون بهره بهره‌مند می‌شوند. همچنین سالانه دو سفر انگیزشی داخلی و یک سفر خارجی برای نمایندگان برتر برگزار می‌شود. پاداش‌های فصلی و جوایز نقدی هم بخشی از مزایای ماست.', 6);
INSERT INTO faq_items (question, answer, sort_order) VALUES ('آیا امکان ارتقا شغلی وجود دارد؟', 'قطعاً! سیستم ارتقای شفاف و شفافی داریم. از بازاریاب شروع می‌کنید و با کسب تجربه و عملکرد مناسب، می‌توانید تا مدیر فروش ارشد پیشرفت کنید. هر مرحله مزایا و درآمد بیشتری دارد. بسیاری از مدیران فعلی ما خودشان از همین مسیر شروع کرده‌اند.', 7);
INSERT INTO faq_items (question, answer, sort_order) VALUES ('چطور می‌تونم از طریق دوستانم وارد کار بشم؟', 'اگر یکی از دوستان یا آشنایان شما نماینده ماست، می‌توانید از طریق لینک معرفی اختصاصی او ثبت‌نام کنید. اینطوری هم شما زیر نظر کسی وارد می‌شوید که می‌شناسیدش، و هم دوستتان پاداش معرفی دریافت می‌کند. برای دریافت لینک معرفی با دوستتان تماس بگیرید.', 8);

-- 5. Referral Links
INSERT INTO referral_links (agent_name, code) VALUES ('علی محمدی', 'ALI2024');
INSERT INTO referral_links (agent_name, code) VALUES ('سارا احمدی', 'SARA99');
INSERT INTO referral_links (agent_name, code) VALUES ('رضا کریمی', 'REZA_AMD');
INSERT INTO referral_links (agent_name, code) VALUES ('نیلوفر حسینی', 'NILOOFAR');

-- 6. Applicants
INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('حسین رجبی', '09121234567', 'تهران', '۵ سال سابقه فروش در شرکت لوازم خانگی، مدیر فروش منطقه شمال تهران', 'حدود ۵۰۰ نفر در شبکه ارتباطی شامل همکاران سابق و مشتریان', 'تمام وقت، آماده ترک شغل فعلی', 'می‌خوام در حوزه‌ای فعالیت کنم که هم درآمد بالاتری داشته باشم و هم به مردم کمک کنم آینده مالی‌شون رو تضمین کنن. تجربه فروش من می‌تونه کمک کنه سریعتر پیشرفت کنم.', 85, 'ALI2024', '2025-07-28', '10:00', 'interviewed', datetime('now', '-24 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('فاطمه زارعی', '09351112233', 'اصفهان', 'بدون سابقه فروش ولی ۳ سال تجربه بازاریابی دیجیتال', 'شبکه وسیع آنلاین با بیش از ۲۰۰۰ فالوور در اینستاگرام', 'پاره وقت، ۲۰ ساعت در هفته', 'علاقه‌مند به فروش و کمک به خانواده‌ها برای برنامه‌ریزی مالی هستم. تجربه بازاریابی دیجیتال می‌تونه کمک کنه مشتریان آنلاین جذب کنم.', 62, 'SARA99', NULL, NULL, 'new', datetime('now', '-48 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('امیر سلطانی', '09198765432', 'شیراز', '۸ سال سابقه فروش بیمه در شرکت بیمه ایران، مدیر تیم فروش', 'بیش از ۱۰۰۰ مخاطب حرفه‌ای شامل شرکت‌ها و افراد حقیقی', 'تمام وقت', 'با توجه به سابقه طولانی در بیمه، می‌خوام در محیطی پویاتر و با درآمد بیشتر فعالیت کنم. سیستم آموزشی و انگیزشی شما خیلی جذاب به نظر می‌رسه.', 92, NULL, '2025-07-25', '14:00', 'hired', datetime('now', '-72 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('مریم اکبری', '09011223344', 'تبریز', '۲ سال سابقه فروش پوشاک در فروشگاه آنلاین', 'حدود ۳۰۰ نفر شامل دوستان و خانواده', 'پاره وقت، ۱۵ ساعت در هفته', 'می‌خوام در کنار فروشگاه آنلاینم، درآمد دیگه‌ای هم داشته باشم. بیمه عمر حوزه‌ای هست که بهش علاقه‌مندم.', 45, 'REZA_AMD', '2025-07-30', '11:00', 'contacted', datetime('now', '-96 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('رضا حیدری', '09223344556', 'تهران', 'بدون سابقه فروش، مهندس کامپیوتر', 'حدود ۲۰۰ نفر در شبکه فنی و حرفه‌ای', 'پاره وقت، ۱۰ ساعت در هفته', 'می‌خوام درآمد غیرفعال داشته باشم و بازاریابی شبکه‌ای رو تجربه کنم.', 28, NULL, NULL, NULL, 'new', datetime('now', '-120 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('زهرا کاظمی', '09367788990', 'مشهد', '۴ سال سابقه فروش لوازم آرایشی، مدیر فروش شعبه', 'بیش از ۸۰۰ مشتری ثابت و همکار در شبکه آرایشی', 'تمام وقت', 'با تجربه فروشم می‌تونم سریع نتیجه بگیرم. محیط حرفه‌ای و درآمد بالاتر انگیزه اصلی‌امه.', 78, 'NILOOFAR', '2025-07-29', '09:30', 'interviewed', datetime('now', '-144 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('مهدی شریفی', '09134455667', 'اهواز', '۱ سال سابقه فروش خودرو', 'حدود ۱۵۰ نفر', 'تمام وقت', 'از کار فعلی‌ام راضی نیستم و دنبال فرصت بهتری هستم. بیمه عمر به نظر حوزه پرسودی می‌آد.', 55, 'ALI2024', NULL, NULL, 'new', datetime('now', '-168 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('سارا بهرامی', '09189900112', 'کرمان', 'بدون سابقه فروش، معلم دبستان', 'حدود ۴۰۰ نفر شامل والدین دانش‌آموزان و همکاران', 'پاره وقت، ۱۲ ساعت در هفته', 'می‌خوام درآمدم رو افزایش بدم و مهارت‌های جدید یاد بگیرم. تجربه ارتباط با افراد مختلف از مزایای من هست.', 35, NULL, NULL, NULL, 'rejected', datetime('now', '-192 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('امیررضا نوری', '09012233445', 'تهران', '۶ سال سابقه فروش بیمه آتش‌سوزی و بدنه خودرو', 'بیش از ۱۵۰۰ مخاطب شامل نمایندگی‌های خودرو و شرکت‌ها', 'تمام وقت', 'می‌خوام از بیمه آتش‌سوزی به بیمه عمر مهاجرت کنم چون بازار بزرگتری داره. تجربه فروش من کمک می‌کنه سریع شروع کنم.', 88, NULL, '2025-07-22', '15:30', 'hired', datetime('now', '-216 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('نیلوفر رستمی', '09391122334', 'یزد', '۳ سال سابقه مشاوره مالی در بانک', 'حدود ۶۰۰ مشتری بانکی و آشنایان', 'پاره وقت، ۲۵ ساعت در هفته', 'با تجربه مشاوره مالی، بیمه عمر حوزه طبیعی برای ادامه کارمه. می‌خوام استقلال شغلی داشته باشم.', 72, 'SARA99', '2025-08-01', '10:30', 'contacted', datetime('now', '-240 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('عباس مهدوی', '09125566778', 'قم', '۷ سال سابقه فروش مواد غذایی عمده', 'بیش از ۳۰۰ فروشگاه و عمده فروش در سراسر استان', 'تمام وقت', 'می‌خوام از بازار سنتی به بازار حرفه‌ای‌تر بیمه منتقل بشم. شبکه ارتباطی وسیعم می‌تونه کمک کنه.', 80, 'REZA_AMD', NULL, NULL, 'new', datetime('now', '-264 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('الهام قاسمی', '09368899001', 'تهران', '۲ سال سابقه فروش لوازم التحریر اداری', 'حدود ۲۵۰ نفر شامل مدیران اداری', 'پاره وقت، ۱۸ ساعت در هفته', 'می‌خوام درآمدم رو افزایش بدم. بیمه عمر به نظر بازار پایدار و پرسودی می‌آد.', 42, NULL, '2025-08-02', '13:00', 'interviewed', datetime('now', '-288 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('فرزاد احمدی‌نژاد', '09190011223', 'اراک', '۴ سال سابقه فروش لوازم یدکی خودرو', 'حدود ۵۰۰ نفر شامل تعمیرگاه‌ها و نمایندگی‌ها', 'تمام وقت', 'از درآمد فعلی‌ام راضی نیستم. می‌خوام در حوزه‌ای با درآمد نامحدود فعالیت کنم.', 60, 'NILOOFAR', NULL, NULL, 'new', datetime('now', '-312 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('نسرین علیزاده', '09013344556', 'ساری', '۱ سال سابقه فروش آنلاین لوازم خانگی', 'حدود ۱۸۰ نفر', 'پاره وقت، ۱۰ ساعت در هفته', 'می‌خوام تجربه فروش آنلاینم رو در حوزه بیمه به کار بگیرم.', 32, NULL, '2025-08-03', '11:30', 'contacted', datetime('now', '-336 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('وحید کرمی', '09126677889', 'همدان', '۵ سال سابقه فروش تجهیزات پزشکی، مدیر فروش منطقه', 'بیش از ۷۰۰ پزشک و بیمارستان در شبکه', 'تمام وقت', 'با تجربه فروش در سطح بالا، می‌خوام در حوزه‌ای فعالیت کنم که درآمد نامحدود داشته باشم. بیمه عمر بازار بکری هست.', 82, 'ALI2024', '2025-07-20', '09:00', 'hired', datetime('now', '-360 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('ریتا موسوی', '09371122334', 'بندرعباس', 'بدون سابقه فروش، لیسانس مدیریت بازرگانی', 'حدود ۳۵۰ نفر', 'تمام وقت', 'تازه فارغ‌التحصیل شدم و دنبال فرصت شغلی مناسب هستم. بیمه عمر حوزه جذابی به نظر می‌رسه.', 38, 'SARA99', NULL, NULL, 'new', datetime('now', '-384 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('کامران فتحی', '09182233445', 'کاشان', '۳ سال سابقه فروش فرش دستباف', 'حدود ۴۰۰ نفر شامل بافندگان و فروشندگان', 'پاره وقت، ۲۰ ساعت در هفته', 'می‌خوام درآمدم رو diversify کنم. تجربه فروش حضوری من در بیمه هم مفید خواهد بود.', 50, 'REZA_AMD', '2025-08-05', '14:30', 'interviewed', datetime('now', '-408 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('مهسا جمالی', '09354455667', 'تهران', '۲ سال سابقه فروش مبلمان اداری', 'حدود ۳۰۰ نفر شامل مدیران شرکت‌ها', 'پاره وقت، ۱۵ ساعت در هفته', 'می‌خوام از شبکه ارتباطی حرفه‌ایم برای فروش بیمه استفاده کنم. درآمد پورسانتی خیلی جذابه.', 58, NULL, NULL, NULL, 'new', datetime('now', '-432 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('پیمان سوری', '09127788990', 'قم', '۱۰ سال سابقه فروش و مدیریت فروش در شرکت بیمه پاسارگاد', 'بیش از ۲۰۰۰ مخاطب حرفه‌ای در صنعت بیمه', 'تمام وقت', 'با بیش از ۱۰ سال تجربه در بیمه، می‌خوام تیم خودم رو تشکیل بدم و درآمد بالاتری کسب کنم. سیستم شما بسیار حرفه‌ای و جذابه.', 95, NULL, '2025-07-31', '16:00', 'interviewed', datetime('now', '-456 hours'));

INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, score, referral_code, appointment_date, appointment_time, status, created_at)
VALUES ('سودابه رنجبر', '09365566778', 'کرمانشاه', '۲ سال سابقه فروش لوازم آشپزخانه', 'حدود ۲۰۰ نفر', 'پاره وقت، ۱۲ ساعت در هفته', 'می‌خوام درآمدم رو افزایش بدم و مهارت‌های جدید یاد بگیرم. بیمه عمر حوزه‌ای هست که بهش علاقه‌مندم.', 40, 'NILOOFAR', NULL, NULL, 'new', datetime('now', '-480 hours'));

-- 7. Fit Assessment Results
INSERT INTO fit_assessment_results (applicant_id, answers_json, summary) VALUES (1, '{"persuasion":5,"persistence":4,"planning":4,"learning":5}', 'تناسب شغلی بالا');
INSERT INTO fit_assessment_results (applicant_id, answers_json, summary) VALUES (3, '{"persuasion":5,"persistence":5,"planning":5,"learning":4}', 'تناسب شغلی بالا');
INSERT INTO fit_assessment_results (applicant_id, answers_json, summary) VALUES (6, '{"persuasion":4,"persistence":4,"planning":3,"learning":5}', 'تناسب شغلی بالا');
INSERT INTO fit_assessment_results (applicant_id, answers_json, summary) VALUES (9, '{"persuasion":5,"persistence":5,"planning":4,"learning":4}', 'تناسب شغلی بالا');
INSERT INTO fit_assessment_results (applicant_id, answers_json, summary) VALUES (15, '{"persuasion":4,"persistence":5,"planning":4,"learning":4}', 'تناسب شغلی بالا');
INSERT INTO fit_assessment_results (applicant_id, answers_json, summary) VALUES (18, '{"persuasion":5,"persistence":5,"planning":5,"learning":5}', 'تناسب شغلی بالا');

-- 8. Settings
INSERT INTO settings (key, value) VALUES ('TELEGRAM_BOT_TOKEN', '');
INSERT INTO settings (key, value) VALUES ('TELEGRAM_CHAT_ID', '');
INSERT INTO settings (key, value) VALUES ('SOCIAL_TELEGRAM', 'https://t.me/amir_hosseini_insurance');
INSERT INTO settings (key, value) VALUES ('SOCIAL_WHATSAPP', 'https://wa.me/989121234567');
INSERT INTO settings (key, value) VALUES ('SOCIAL_INSTAGRAM', 'https://instagram.com/amir_hosseini_insurance');

-- 9. Visual Story
INSERT INTO success_visual_story (id, images_json) VALUES (1, '[]');
