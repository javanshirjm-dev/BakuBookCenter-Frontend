"use client";

import { useState, useEffect, useRef } from "react";

/* ─────────────── TYPES ─────────────── */
type Lang = "en" | "ru" | "az";
interface Message { id: number; role: "bot" | "user"; text: string; time: string; }

/* ─────────────── UTILS ─────────────── */
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ─────────────── LANGUAGE DETECTION ─────────────── */
const AZ_WORDS = ["salam", "necəsən", "kitab", "kitablar", "qiymət", "çatdırılma", "sifariş", "harada", "nə", "var", "yox", "bəli", "xeyr", "kömək", "axtarış", "janr", "ödəniş", "mağaza", "müəllif", "tövsiyə", "neçə", "saat", "açıq", "bağlı", "əlaqə", "hansı", "ən", "yaxşı", "oxu", "roman", "fantastika", "tarix", "elm", "uşaq", "iş", "ünvan", "etmək", "istəyirəm", "gətir", "göndər", "almaq", "verdilər", "edirəm", "lazım", "deyil", "olur", "olsun"];
const RU_WORDS = ["привет", "здравствуйте", "книга", "книги", "цена", "стоимость", "доставка", "заказ", "где", "что", "есть", "нет", "да", "нет", "помощь", "поиск", "жанр", "оплата", "магазин", "автор", "рекомендация", "сколько", "часы", "открыт", "закрыт", "контакт", "какой", "лучший", "читать", "роман", "фантастика", "история", "наука", "детский", "бизнес", "адрес", "хочу", "принести", "отправить", "купить", "привезли", "делаю", "нужно", "нельзя", "можно", "пожалуйста", "спасибо", "хорошо", "как", "когда", "есть ли", "у вас", "мне нужна", "есть ли у", "дайте", "покажите", "расскажите", "могу", "буду"];

function detectLang(text: string): Lang {
    const t = text.toLowerCase();
    const azScore = AZ_WORDS.filter(w => t.includes(w)).length;
    const ruScore = RU_WORDS.filter(w => t.includes(w)).length;
    // Cyrillic check
    const cyrillic = (t.match(/[\u0400-\u04FF]/g) || []).length;
    // AZ-specific chars
    const azChars = (t.match(/[əöüğışçɛ]/g) || []).length;
    if (azChars > 0 || azScore >= 1) return "az";
    if (cyrillic > 2 || ruScore >= 1) return "ru";
    return "en";
}

/* ─────────────── RESPONSE ENGINE ─────────────── */
type Category = "greeting" | "hours" | "delivery" | "price" | "payment" | "genres" | "recommend" | "search" | "order" | "contact" | "return" | "membership" | "children" | "gift" | "new" | "bestseller" | "ebook" | "language" | "author" | "thanks" | "bye" | "unknown";

function classify(t: string): Category {
    const s = t.toLowerCase();
    const has = (words: string[]) => words.some(w => s.includes(w));
    if (has(["hello", "hi", "hey", "salam", "привет", "здравствуй", "hər", "necə", "xoş gəldiniz"])) return "greeting";
    if (has(["hour", "open", "close", "saat", "açıq", "bağlı", "часы", "открыт", "закрыт", "working", "schedule", "iş vaxt", "iş günü", "ish"])) return "hours";
    if (has(["deliver", "delivery", "ship", "çatdır", "доставк", "gönder", "göndər", "bring", "привоз", "transfer", "aparmaq"])) return "delivery";
    if (has(["price", "cost", "qiymət", "цена", "стоим", "how much", "neçə", "nə qədər", "sколько", "pul", "manat", "₼"])) return "price";
    if (has(["pay", "payment", "ödəniş", "оплат", "cash", "card", "visa", "kart", "nağd", "kredit", "bank"])) return "payment";
    if (has(["genre", "janr", "жанр", "fiction", "novel", "roman", "history", "sci", "biography", "children", "uşaq", "детск", "fantasy", "thriller", "mystery", "poetry", "şeir", "poezi"])) return "genres";
    if (has(["recommend", "tövsiyə", "рекоменд", "suggest", "best", "ən yaxşı", "что почитать", "what to read", "advised", "advise"])) return "recommend";
    if (has(["search", "find", "axtarış", "поиск", "find book", "kitab axtar", "где найти", "how to find", "look for"])) return "search";
    if (has(["order", "sifariş", "заказ", "buy", "satın", "купить", "purchase", "how to order", "necə sifariş"])) return "order";
    if (has(["contact", "əlaqə", "контакт", "phone", "telefon", "телефон", "email", "address", "ünvan", "адрес", "instagram", "social"])) return "contact";
    if (has(["return", "geri", "возврат", "refund", "exchange", "dəyiş", "обмен", "change"])) return "return";
    if (has(["member", "membership", "club", "loyal", "card", "nuqtə", "балл", "discount", "endirim", "скидк"])) return "membership";
    if (has(["child", "kid", "uşaq", "детск", "baby", "young", "school", "məktəb", "school"])) return "children";
    if (has(["gift", "hədiyyə", "подарок", "wrap", "present", "birthday", "ad günü", "день рожден"])) return "gift";
    if (has(["new", "yeni", "новинк", "latest", "arrived", "gəldi", "поступил", "fresh", "2024", "2025"])) return "new";
    if (has(["bestsell", "popular", "top", "most", "populyar", "populjar", "хит", "лучш", "ən çox", "satılan"])) return "bestseller";
    if (has(["ebook", "digital", "elektron", "электрон", "pdf", "online book", "virtual", "audio"])) return "ebook";
    if (has(["language", "dil", "язык", "english", "azerbaijani", "russian", "azərbaycan", "rus dili", "ingilis"])) return "language";
    if (has(["author", "müəllif", "автор", "writer", "yazıçı", "писател", "who wrote", "kim yazdı"])) return "author";
    if (has(["thank", "sağ ol", "spasibo", "спасибо", "teşekkür", "rəhm", "merci"])) return "thanks";
    if (has(["bye", "görüş", "пока", "до свидания", "çao", "goodbye", "sağlıqla", "xudahafiz", "xüdahafiz"])) return "bye";
    return "unknown";
}

const R: Record<Category, Record<Lang, string[]>> = {
    greeting: {
        en: ["Hey! Welcome to Baku Book Center 📚 I'm here to help you find the perfect book, check delivery info, prices, or anything else. What can I do for you?", "Hello! Great to see you at Baku Book Center. Ask me about our books, genres, delivery, prices — I'm all yours!"],
        ru: ["Привет! Добро пожаловать в Baku Book Center 📚 Я помогу вам найти книгу, уточнить доставку, цены и многое другое. Чем могу помочь?", "Здравствуйте! Рады видеть вас в Baku Book Center. Спросите меня о книгах, жанрах, доставке — я к вашим услугам!"],
        az: ["Salam! Baku Book Center-ə xoş gəldiniz 📚 Kitab tapmaqda, çatdırılma, qiymətlər haqqında kömək edə bilərəm. Nə istəyirsiniz?", "Salam! Baku Book Center-ə xoş gəldiniz. Kitablar, janrlar, çatdırılma haqqında sual verin — sizə kömək etməyə hazıram!"],
    },
    hours: {
        en: ["We're open every day from 9:00 AM to 9:00 PM — including weekends and holidays. Come visit us anytime!", "Our store hours are 09:00–21:00 daily. We never close on weekends. Perfect for a relaxed Sunday browse 📖"],
        ru: ["Мы работаем ежедневно с 9:00 до 21:00, включая выходные и праздники. Приходите в любое время!", "Наши часы работы: 09:00–21:00 каждый день. Мы работаем и в выходные — идеально для неспешного воскресного шопинга 📖"],
        az: ["Hər gün saat 09:00-dan 21:00-dək açıqıq — həftəsonu və bayram günlərini də daxil edərək. İstənilən vaxt gəlin!", "İş saatlarımız: 09:00–21:00, hər gün. Həftəsonları da çalışırıq — rahat bir bazar günü gəzintisi üçün əla 📖"],
    },
    delivery: {
        en: ["We offer FREE delivery anywhere in Azerbaijan! Orders are typically delivered within 1–3 business days. You'll receive a tracking link via SMS or email once it's shipped.", "Delivery is completely free across Azerbaijan 🚚 Standard delivery takes 1–3 days. We also offer same-day delivery in Baku for orders placed before 2 PM — just mention it at checkout!"],
        ru: ["Мы предлагаем БЕСПЛАТНУЮ доставку по всему Азербайджану! Обычно заказы доставляются за 1–3 рабочих дня. Вы получите ссылку для отслеживания по SMS или email после отправки.", "Доставка абсолютно бесплатна по всему Азербайджану 🚚 Стандартная доставка — 1–3 дня. Для заказов по Баку, оформлённых до 14:00, доступна доставка в тот же день!"],
        az: ["Azərbaycanın hər yerinə PULSUZ çatdırılma həyata keçiririk! Sifarişlər adətən 1–3 iş günü ərzində çatdırılır. Göndərildikdən sonra SMS və ya e-poçt vasitəsilə izləmə linki alacaqsınız.", "Azərbaycan daxilindəki bütün çatdırılmalar tamamilə pulsuzdur 🚚 Standart çatdırılma 1–3 gün çəkir. Bakıda saat 14:00-dan əvvəl verilən sifarişlər üçün eyni gün çatdırılma mümkündür!"],
    },
    price: {
        en: ["Our books are priced from 5 AZN to 60 AZN depending on the title and format. Imported and specialty books may be slightly higher. We also run weekly promotions — check our website for current deals!", "Prices range from 5₼ to 60₼. Azerbaijani and Russian titles tend to be more affordable, while imported English books are a bit higher. We regularly offer 10–30% discounts on selected titles."],
        ru: ["Цены на книги варьируются от 5 до 60 AZN в зависимости от названия и формата. Импортные и специализированные книги могут стоить немного дороже. Мы также проводим еженедельные акции!", "Цены: от 5₼ до 60₼. Азербайджанские и русские книги, как правило, доступнее, тогда как импортные англоязычные книги немного дороже. Мы регулярно предлагаем скидки 10–30% на отдельные книги."],
        az: ["Kitablarımızın qiyməti başlığa və formatdan asılı olaraq 5 AZN-dən 60 AZN-ə qədər dəyişir. İdxal kitablar bir qədər baha ola bilər. Həftəlik promosyonlarımıza saytda baxın!", "Qiymətlər 5₼-dən 60₼-ə qədərdir. Azərbaycan və rus dilindəki kitablar daha əlçatandır, ingilis dilindəki idxal kitablar isə bir qədər baha. Seçilmiş kitablarda 10–30% endirim tez-tez tətbiq edirik."],
    },
    payment: {
        en: ["We accept cash, all major credit/debit cards (Visa, Mastercard), and bank transfers. Online orders can be paid via card or cash on delivery — your choice!", "Payment options: cash, Visa, Mastercard, and bank transfer. For online orders we also accept cash on delivery. No hidden fees, ever."],
        ru: ["Мы принимаем наличные, все основные кредитные/дебетовые карты (Visa, Mastercard) и банковские переводы. Онлайн-заказы можно оплатить картой или наличными при доставке!", "Способы оплаты: наличные, Visa, Mastercard, банковский перевод. Для онлайн-заказов также доступна оплата наличными при доставке. Никаких скрытых платежей!"],
        az: ["Nağd pul, bütün əsas kredit/debet kartlarını (Visa, Mastercard) və bank köçürmələrini qəbul edirik. Onlayn sifarişlər kart ilə və ya çatdırılma zamanı nağd ödənilə bilər!", "Ödəniş üsulları: nağd pul, Visa, Mastercard, bank köçürməsi. Onlayn sifarişlər üçün çatdırılmada nağd pul ödənişi də mövcuddur. Heç bir gizli ödəniş yoxdur!"],
    },
    genres: {
        en: ["We carry books in all major genres: Fiction, Non-Fiction, Science, History, Philosophy, Business, Biography, Children's books, Self-help, Psychology, Fantasy, Thriller, and many more. Any specific genre you're looking for?", "Our collection spans Fiction, Non-Fiction, Science, History, Philosophy, Poetry, Thriller, Fantasy, Children's, Self-help, Psychology, Business, Art, and Biography. We have 12,000+ titles in stock — what genre interests you?"],
        ru: ["Мы предлагаем книги всех основных жанров: художественная литература, нон-фикшн, наука, история, философия, бизнес, биография, детские книги, саморазвитие, психология, фэнтези, триллер и многое другое. Какой жанр вас интересует?", "Наша коллекция охватывает художественную литературу, нон-фикшн, науку, историю, философию, поэзию, триллеры, фэнтези, детские книги, саморазвитие, психологию, бизнес, искусство и биографию. Более 12 000 книг в наличии!"],
        az: ["Biz bütün əsas janrlarda kitablar daşıyırıq: Bədii ədəbiyyat, Qeyri-bədii, Elm, Tarix, Fəlsəfə, Biznes, Bioqrafiya, Uşaq kitabları, Özünüinkişaf, Psixologiya, Fantastika, Triller və daha çox. Hansı janr sizi maraqlandırır?", "Kolleksiyamız bədii ədəbiyyat, qeyri-bədii, elm, tarix, fəlsəfə, şeir, triller, fantastika, uşaq, özünüinkişaf, psixologiya, biznes, incəsənət və bioqrafiyanı əhatə edir. Stokda 12,000+ başlıq var!"],
    },
    recommend: {
        en: ["Great question! Here are some of our top picks right now:\n\n📘 *The Alchemist* – Paulo Coelho\n📗 *Atomic Habits* – James Clear\n📕 *Dune* – Frank Herbert\n📙 *Sapiens* – Yuval Noah Harari\n📒 *The Great Gatsby* – F. Scott Fitzgerald\n\nWant recommendations for a specific genre?", "Sure! Some all-time favourites our customers love:\n\n📘 *1984* – George Orwell\n📗 *Thinking, Fast and Slow* – Daniel Kahneman\n📕 *Crime and Punishment* – Fyodor Dostoevsky\n📙 *A Brief History of Time* – Stephen Hawking\n\nAny particular mood or topic in mind?"],
        ru: ["Отличный вопрос! Вот наши топовые книги прямо сейчас:\n\n📘 *Алхимик* – Пауло Коэльо\n📗 *Атомные привычки* – Джеймс Клир\n📕 *Дюна* – Фрэнк Герберт\n📙 *Сапиенс* – Юваль Ной Харари\n📒 *Великий Гэтсби* – Ф. Скотт Фицджеральд\n\nХотите рекомендации по конкретному жанру?", "Конечно! Любимые книги наших покупателей:\n\n📘 *1984* – Джордж Оруэлл\n📗 *Думай медленно... решай быстро* – Даниэль Канеман\n📕 *Преступление и наказание* – Фёдор Достоевский\n📙 *Краткая история времени* – Стивен Хокинг\n\nКакое настроение или тема?"],
        az: ["Əla sual! İndi ən yaxşı seçimlərimiz:\n\n📘 *Alximik* – Paulo Coelho\n📗 *Atom Vərdişlər* – James Clear\n📕 *Dune* – Frank Herbert\n📙 *Sapiens* – Yuval Noah Harari\n📒 *Böyük Getsbi* – F. Scott Fitzgerald\n\nXüsusi bir janr üçün tövsiyə istəyirsiniz?", "Əlbəttə! Müştərilərimizin sevdiyi kitablar:\n\n📘 *1984* – Corc Oruell\n📗 *Sürətli və Yavaş Düşüncə* – Daniel Kahneman\n📕 *Cinayət və Cəza* – Fyodor Dostoyevski\n📙 *Zamanın Qısa Tarixi* – Stiven Hokinq\n\nHansı əhval-ruhiyyə və ya mövzuya marağınız var?"],
    },
    search: {
        en: ["You can search for any book on our website using the search bar at the top — just type the title, author name, or genre and it'll show you everything we have. You can also ask me directly and I'll do my best to help!", "The easiest way is to use the search bar on our site. But you can also describe the book to me — plot, author, or even a vague memory — and I'll try to identify it for you!"],
        ru: ["Вы можете найти любую книгу на нашем сайте с помощью строки поиска вверху — просто введите название, имя автора или жанр. Вы также можете спросить меня напрямую!", "Самый простой способ — строка поиска на сайте. Но вы также можете описать книгу мне — сюжет, автора или даже смутное воспоминание — и я постараюсь помочь!"],
        az: ["İstənilən kitabı saytımızdakı axtarış çubuğundan tapa bilərsiniz — başlıq, müəllif adı və ya janrı yazın. Mənə də birbaşa sual verə bilərsiniz!", "Ən asan yol saytdakı axtarış çubuğundan istifadə etməkdir. Amma kitabı mənə də təsvir edə bilərsiniz — süjet, müəllif və ya qeyri-müəyyən xatirə — kömək etməyə çalışaram!"],
    },
    order: {
        en: ["Ordering is easy! Just browse our website, add books to your cart, and checkout. You can choose delivery or in-store pickup. We'll confirm your order by SMS and email.", "To place an order: visit our website → add to cart → enter your address → choose payment method → done! You'll get an SMS confirmation with your order number. Need help with anything specific?"],
        ru: ["Сделать заказ просто! Просто просмотрите наш сайт, добавьте книги в корзину и оформите заказ. Вы можете выбрать доставку или самовывоз. Мы подтвердим заказ по SMS и email.", "Чтобы сделать заказ: зайдите на сайт → добавьте в корзину → введите адрес → выберите способ оплаты → готово! Вы получите SMS-подтверждение с номером заказа."],
        az: ["Sifariş vermək asandır! Saytımızda gəzin, kitabları səbətə əlavə edin və sifarişi tamamlayın. Çatdırılma və ya mağazadan götürməni seçə bilərsiniz. SMS və e-poçtla sifarişinizi təsdiqləyəcəyik.", "Sifariş vermək üçün: sayta daxil olun → səbətə əlavə edin → ünvanı daxil edin → ödəniş üsulunu seçin → hazır! Sifariş nömrənizlə SMS təsdiqi alacaqsınız."],
    },
    contact: {
        en: ["You can reach us at:\n📞 +994 12 404 04 04\n📧 info@bakubookcenter.az\n📍 Baku, Azerbaijan\n📸 @bakubookcenter on Instagram\n\nWe respond to emails within 24 hours and are available by phone daily 9 AM–9 PM.", "Here's our contact info:\n📞 Phone: +994 12 404 04 04\n📧 Email: info@bakubookcenter.az\n📍 Address: Baku, Azerbaijan\n\nYou can also DM us on Instagram @bakubookcenter — we're pretty active there!"],
        ru: ["Вы можете связаться с нами:\n📞 +994 12 404 04 04\n📧 info@bakubookcenter.az\n📍 Баку, Азербайджан\n📸 @bakubookcenter в Instagram\n\nОтвечаем на email в течение 24 часов, по телефону доступны ежедневно с 9 до 21.", "Наши контакты:\n📞 Телефон: +994 12 404 04 04\n📧 Email: info@bakubookcenter.az\n📍 Адрес: Баку, Азербайджан\n\nМожно написать нам в Instagram @bakubookcenter — мы там довольно активны!"],
        az: ["Bizimlə əlaqə saxlaya bilərsiniz:\n📞 +994 12 404 04 04\n📧 info@bakubookcenter.az\n📍 Bakı, Azərbaycan\n📸 Instagram: @bakubookcenter\n\nE-poçtlara 24 saat ərzində cavab veririk, telefon ilə hər gün saat 9–21 arasında əlçatanıq.", "Əlaqə məlumatlarımız:\n📞 Telefon: +994 12 404 04 04\n📧 E-poçt: info@bakubookcenter.az\n📍 Ünvan: Bakı, Azərbaycan\n\nInstagram-da @bakubookcenter hesabımıza da DM göndərə bilərsiniz!"],
    },
    return: {
        en: ["We accept returns within 14 days of purchase, as long as the book is in its original condition (unread, no damage). Just bring your receipt to the store or contact us online. Exchanges are also welcome!", "Our return policy: 14 days from purchase, book must be in original condition. You can return in-store or arrange a pickup for online orders. If there's any defect in the book, we'll exchange it immediately — no questions asked."],
        ru: ["Мы принимаем возврат в течение 14 дней с момента покупки, при условии, что книга в оригинальном состоянии (непрочитанная, без повреждений). Просто принесите чек в магазин или свяжитесь с нами онлайн.", "Наша политика возврата: 14 дней с момента покупки, книга должна быть в оригинальном состоянии. Вернуть можно в магазине или организовать забор для онлайн-заказов. При дефекте — сразу обменяем!"],
        az: ["Satın alındıqdan 14 gün ərzində kitab orijinal vəziyyətdə olduqda (oxunmamış, zədəsiz) geri qaytarmağı qəbul edirik. Kvitansiyanızı mağazaya gətirin və ya onlayn bizimlə əlaqə saxlayın. Dəyişdirmə də mümkündür!", "Geri qaytarma siyasətimiz: alındıqdan 14 gün, kitab orijinal vəziyyətdə olmalıdır. Mağazada geri qaytarıla bilər və ya onlayn sifarişlər üçün geri götürmə təşkil edilə bilər. Qüsurlu kitablar dərhal dəyişdirilir!"],
    },
    membership: {
        en: ["We have a Loyalty Card program! Every purchase earns you points. Collect enough and get discounts, free books, or special access to new arrivals. Ask at the store desk to sign up — it's free!", "Our loyalty program lets you earn 1 point per 1 AZN spent. At 100 points you get 10% off your next order. At 500 points — a free book of your choice. Sign up in-store or online!"],
        ru: ["У нас есть программа лояльности! Каждая покупка приносит вам баллы. Накопите достаточно — и получите скидки, бесплатные книги или специальный доступ к новинкам. Оформите карту на кассе бесплатно!", "Наша программа лояльности: 1 балл за каждый потраченный 1 AZN. При 100 баллах — скидка 10% на следующий заказ. При 500 баллах — бесплатная книга на выбор. Оформление в магазине или онлайн!"],
        az: ["Sadiqlik Kartı proqramımız var! Hər alış-veriş sizə bal qazandırır. Kifayət qədər toplayın — endirimler, pulsuz kitablar və ya yeni məhsullara xüsusi giriş əldə edin. Qeydiyyat kassa masasında pulsuzdur!", "Sadiqlik proqramımız: xərclənən hər 1 AZN üçün 1 bal. 100 balda növbəti sifarişdə 10% endirim. 500 balda — seçdiyiniz pulsuz bir kitab. Mağazada və ya onlayn qeydiyyat!"],
    },
    children: {
        en: ["We have a wonderful children's section! Books for ages 0–16, including picture books, fairy tales, educational books, activity books, and young adult novels. Many titles are available in Azerbaijani, Russian, and English.", "Our children's collection is one of our favourites! We carry classics like *Winnie the Pooh*, *Harry Potter*, *The Little Prince*, plus a huge selection of Azerbaijani children's literature and educational sets."],
        ru: ["У нас есть замечательный детский раздел! Книги для возраста 0–16 лет: картинки, сказки, учебные книги, раскраски и романы для молодёжи. Многие издания доступны на азербайджанском, русском и английском языках.", "Наша детская коллекция — одна из любимых! Классика: *Винни Пух*, *Гарри Поттер*, *Маленький принц*, плюс огромный выбор азербайджанской детской литературы и образовательных наборов."],
        az: ["Möhtəşəm bir uşaq bölməmiz var! 0–16 yaş arası kitablar: şəkilli kitablar, nağıllar, tədris kitabları, fəaliyyət kitabları və gənclər üçün romanlar. Çox sayda başlıq Azərbaycan, rus və ingilis dillərindədir.", "Uşaq kolleksiyamız ən sevdiklərimizdən biridir! Klassiklər: *Vini Pu*, *Harri Potter*, *Kiçik Şahzadə*, üstəlik geniş Azərbaycan uşaq ədəbiyyatı və tədris dəstləri."],
    },
    gift: {
        en: ["We offer beautiful gift wrapping for any book — free of charge! We can also create custom gift sets. Gift cards are available in any denomination from 10₼ to 200₼. Perfect for birthdays, graduations, or any occasion!", "Looking for a gift? Great choice! We do free gift wrapping, sell gift cards (10₼–200₼), and can help you pick the perfect book based on the recipient's interests. Just tell us a bit about them!"],
        ru: ["Мы предлагаем красивую подарочную упаковку для любой книги — бесплатно! Также доступны подарочные наборы на заказ. Подарочные карты доступны на любую сумму от 10₼ до 200₼.", "Ищете подарок? Отличный выбор! Мы делаем бесплатную подарочную упаковку, продаём подарочные карты (10₼–200₼) и поможем выбрать идеальную книгу по интересам получателя."],
        az: ["İstənilən kitab üçün gözəl hədiyyə qablaşdırması təklif edirik — pulsuz! Xüsusi hədiyyə dəstləri də hazırlana bilər. Hədiyyə kartları 10₼-dən 200₼-ə qədər istənilən məbləğdə mövcuddur.", "Hədiyyə axtarırsınız? Əla seçim! Pulsuz hədiyyə qablaşdırması edirik, hədiyyə kartları (10₼–200₼) satırıq və alıcının maraqlarına əsasən ideal kitabı seçməyə kömək edə bilərik."],
    },
    new: {
        en: ["We receive new arrivals every week! This month we've added 340+ new titles across all genres. The best way to see them is the 'New Arrivals' section on our website — updated weekly.", "Fresh titles arrive every Monday and Thursday. This week's highlights include new fiction from local Azerbaijani authors, international bestsellers, and a fresh batch of science and philosophy titles. Check the website!"],
        ru: ["Новинки поступают каждую неделю! В этом месяце мы добавили 340+ новых названий по всем жанрам. Лучший способ их увидеть — раздел «Новинки» на нашем сайте — обновляется еженedельно.", "Свежие книги поступают каждый понедельник и четверг. Этой недели: новая художественная литература от местных азербайджанских авторов, международные бестселлеры и новые книги по науке и философии."],
        az: ["Hər həftə yeni kitablar alırıq! Bu ay bütün janrlarda 340+ yeni başlıq əlavə etdik. Onları görmək üçün saytımızdakı 'Yeni Gələnlər' bölməsinə baxın — həftəlik yenilənir.", "Yeni başlıqlar hər bazar ertəsi və cümə axşamı gəlir. Bu həftənin öne çıxanları: yerli Azərbaycan müəlliflərindən yeni bədii ədəbiyyat, beynəlxalq bestsellerlər və yeni elm kitabları."],
    },
    bestseller: {
        en: ["Our current bestsellers are:\n\n1. *Atomic Habits* – James Clear\n2. *The Alchemist* – Paulo Coelho\n3. *Sapiens* – Yuval Noah Harari\n4. *It Ends With Us* – Colleen Hoover\n5. *Fourth Wing* – Rebecca Yarros\n\nWant more details on any of these?", "Top sellers this month:\n\n1. *Ikigai* – Héctor García\n2. *The 48 Laws of Power* – Robert Greene\n3. *Harry Potter* series – J.K. Rowling\n4. *1984* – George Orwell\n5. *The Psychology of Money* – Morgan Housel"],
        ru: ["Наши текущие бестселлеры:\n\n1. *Атомные привычки* – Джеймс Клир\n2. *Алхимик* – Пауло Коэльо\n3. *Сапиенс* – Юваль Ной Харари\n4. *Конец и снова начало* – Коллин Хувер\n5. *Четвёртое крыло* – Ребекка Ярроc\n\nХотите подробнее о какой-либо из них?", "Топ продаж этого месяца:\n\n1. *Икигай* – Хектор Гарсиа\n2. *48 законов власти* – Роберт Грин\n3. Серия *Гарри Поттер* – Дж.К. Роулинг\n4. *1984* – Джордж Оруэлл\n5. *Психология денег* – Морган Хаузел"],
        az: ["Cari bestsellerlərimiz:\n\n1. *Atom Vərdişlər* – James Clear\n2. *Alximik* – Paulo Coelho\n3. *Sapiens* – Yuval Noah Harari\n4. *Onunla Bitir* – Colleen Hoover\n5. *Dördüncü Qanad* – Rebecca Yarros\n\nBunlardan hər hansı biri haqqında ətraflı məlumat istəyirsiniz?", "Bu ayın ən çox satılanları:\n\n1. *İkigai* – Héctor García\n2. *Hakimiyyətin 48 Qanunu* – Robert Greene\n3. *Harri Potter* seriyası – J.K. Rowling\n4. *1984* – Corc Oruell\n5. *Pul Psixologiyası* – Morgan Housel"],
    },
    ebook: {
        en: ["Currently we specialise in physical books — we love the feel of a real book! However, we do have a small selection of digital titles available on our website. We're also working on expanding our e-book catalogue soon.", "We're primarily a physical bookstore. For e-books, we recommend platforms like Storytel or Google Play Books. That said, we do sell a growing number of digital titles on our website — worth checking out!"],
        ru: ["В настоящее время мы специализируемся на физических книгах — мы любим настоящие книги! Тем не менее, на нашем сайте есть небольшой выбор цифровых изданий. Мы также работаем над расширением каталога электронных книг.", "Мы в первую очередь физический книжный магазин. Для электронных книг рекомендуем платформы Storytel или Google Play Books. Тем не менее, на нашем сайте есть растущее число цифровых изданий!"],
        az: ["Hazırda fiziki kitablara ixtisaslaşmışıq — həqiqi kitabın hissini sevirik! Bununla belə, saytımızda kiçik bir rəqəmsal başlıq seçimi mövcuddur. E-kitab kataloqumuzu genişlətmək üzərində də işləyirik.", "Biz əsasən fiziki kitab mağazasıyıq. E-kitablar üçün Storytel və ya Google Play Books platformalarını tövsiyə edirik. Bununla belə, saytımızda artan sayda rəqəmsal başlıq da var!"],
    },
    language: {
        en: ["We stock books in Azerbaijani, Russian, and English — and some titles in Turkish, French, German, and Arabic. Our Azerbaijani and Russian sections are the largest, with English titles growing rapidly.", "Our collection is trilingual! Azerbaijani, Russian, and English are our main languages. We also have some books in Turkish and other languages. Looking for something in a specific language?"],
        ru: ["У нас есть книги на азербайджанском, русском и английском языках, а также некоторые названия на турецком, французском, немецком и арабском. Наши азербайджанские и русские разделы самые большие.", "Наша коллекция трёхъязычная! Азербайджанский, русский и английский — наши основные языки. Также есть книги на турецком и других языках. Ищете что-то на определённом языке?"],
        az: ["Azərbaycan, rus və ingilis dillərində kitablarımız var — bəzi başlıqlar türk, fransız, alman və ərəb dillərindədir. Azərbaycan və rus bölmələrimiz ən böyüklərdir, ingilis bölməsi sürətlə böyüyür.", "Kolleksiyamız üçdillidir! Azərbaycan, rus və ingilis dilləri əsas dillərimizdir. Türk və digər dillərdə də kitablar var. Müəyyən bir dildə bir şey axtarırsınız?"],
    },
    author: {
        en: ["We carry books from thousands of authors — Azerbaijani, Russian, and international. If you're looking for a specific author, use the search on our website or ask me their name and I'll check for you!", "Looking for a specific author? Tell me their name and I'll let you know if we have their books in stock. We carry everyone from Tolkien and Dostoyevsky to Chingiz Abdullayev and Elchin Safarli."],
        ru: ["У нас есть книги тысяч авторов — азербайджанских, российских и международных. Если вы ищете конкретного автора, воспользуйтесь поиском на нашем сайте или скажите мне имя — я проверю!", "Ищете конкретного автора? Назовите имя, и я скажу, есть ли его книги у нас. У нас есть все — от Толкина и Достоевского до Чингиза Абдуллаева и Эльчина Сафарли."],
        az: ["Minlərlə müəllifin kitabları var — Azərbaycan, rus və beynəlxalq. Müəyyən bir müəllif axtarırsınızsa, saytdakı axtarışdan istifadə edin və ya adı mənə deyin — yoxlayacağam!", "Müəyyən bir müəllif axtarırsınız? Adını mənə deyin, bizdə kitablarının olub-olmadığını bildirəcəyəm. Tolkindən Dostoyevskiyə, Çingiz Abdullayevdən Elçin Safarlidək hər kəs var bizdə."],
    },
    thanks: {
        en: ["You're very welcome! Is there anything else I can help you with? 😊", "Happy to help! Don't hesitate to ask if you need anything else. Enjoy your next great read! 📚"],
        ru: ["Пожалуйста! Могу ли я ещё чем-нибудь помочь? 😊", "Рад помочь! Не стесняйтесь спрашивать, если что-то ещё нужно. Приятного чтения! 📚"],
        az: ["Zəhmət olmasa! Başqa bir şeydə kömək edə bilərəmmi? 😊", "Kömək etmək xoşuma gəldi! Başqa bir şeyə ehtiyacınız olsa, soruşun. Xoş oxumalar! 📚"],
    },
    bye: {
        en: ["Goodbye! Hope to see you again soon. Happy reading! 📚", "Take care! Visit us in-store or online anytime. Enjoy your books! 👋"],
        ru: ["До свидания! Надеемся скоро снова вас увидеть. Приятного чтения! 📚", "Берегите себя! Заходите к нам в магазин или онлайн в любое время. Наслаждайтесь книгами! 👋"],
        az: ["Görüşənədək! Tezliklə yenidən görüşməyə ümid edirəm. Xoş oxumalar! 📚", "Sağ olun! İstənilən vaxt mağazamıza və ya onlayn ziyarət edin. Kitablarınızın dadını çıxarın! 👋"],
    },
    unknown: {
        en: ["Hmm, I'm not quite sure about that one. You can ask me about our books, delivery, prices, opening hours, genres, recommendations, or how to place an order. What would you like to know?", "I didn't quite get that — sorry! I can help with books, prices, delivery, hours, recommendations, and more. Try rephrasing or pick a topic?"],
        ru: ["Хм, я не совсем уверен в этом. Вы можете спросить меня о наших книгах, доставке, ценах, часах работы, жанрах, рекомендациях или о том, как сделать заказ.", "Я не совсем понял — извините! Я могу помочь с книгами, ценами, доставкой, часами работы, рекомендациями и многим другим. Попробуйте переформулировать?"],
        az: ["Hmm, bu mövzuda tam əmin deyiləm. Kitablarımız, çatdırılma, qiymətlər, iş saatları, janrlar, tövsiyələr haqqında soruşa bilərsiniz.", "Tam başa düşmədim — üzr istəyirəm! Kitablar, qiymətlər, çatdırılma, saatlar, tövsiyələr haqqında kömək edə bilərəm. Başqa cür ifadə etməyə çalışın?"],
    },
};

function getReply(input: string, lang: Lang): string {
    const cat = classify(input);
    const bucket = R[cat][lang];
    return bucket[Math.floor(Math.random() * bucket.length)];
}

/* ─────────────── GREETING ─────────────── */
const GREETING = `Salam! Xoş gəldiniz 👋
Привет! Добро пожаловать
Hello! Welcome to Baku Book Center 📚

I speak English, Русский and Azərbaycan. Just type in any language and I'll reply the same way!`;

/* ─────────────── QUICK CHIPS ─────────────── */
const CHIPS: Record<Lang, { label: string; query: string }[]> = {
    en: [
        { label: "📦 Delivery", query: "How does delivery work?" },
        { label: "⏰ Hours", query: "What are your opening hours?" },
        { label: "📚 Recommend", query: "Recommend me a good book" },
        { label: "💳 Payment", query: "How can I pay?" },
        { label: "🔖 Genres", query: "What genres do you have?" },
    ],
    ru: [
        { label: "📦 Доставка", query: "Как работает доставка?" },
        { label: "⏰ Часы", query: "Какие часы работы?" },
        { label: "📚 Советую", query: "Порекомендуй хорошую книгу" },
        { label: "💳 Оплата", query: "Как оплатить?" },
        { label: "🔖 Жанры", query: "Какие жанры есть?" },
    ],
    az: [
        { label: "📦 Çatdırılma", query: "Çatdırılma necə işləyir?" },
        { label: "⏰ Saatlar", query: "İş saatlarınız nədir?" },
        { label: "📚 Tövsiyə", query: "Yaxşı kitab tövsiyə et" },
        { label: "💳 Ödəniş", query: "Necə ödə bilərəm?" },
        { label: "🔖 Janrlar", query: "Hansı janrlar var?" },
    ],
};

/* ─────────────── COMPONENT ─────────────── */
export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 0, role: "bot", text: GREETING, time: now() },
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [detectedLang, setDetectedLang] = useState<Lang>("en");
    const [unread, setUnread] = useState(1);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setUnread(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const send = (text: string) => {
        const t = text.trim();
        if (!t) return;
        const lang = detectLang(t);
        setDetectedLang(lang);
        const userMsg: Message = { id: Date.now(), role: "user", text: t, time: now() };
        setMessages(m => [...m, userMsg]);
        setInput("");
        setTyping(true);
        const delay = 700 + Math.random() * 900;
        setTimeout(() => {
            const reply = getReply(t, lang);
            setMessages(m => [...m, { id: Date.now() + 1, role: "bot", text: reply, time: now() }]);
            setTyping(false);
            if (!open) setUnread(u => u + 1);
        }, delay);
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
    };

    const chips = CHIPS[detectedLang];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        #bbc-wrap * { box-sizing:border-box; margin:0; padding:0; font-family:'DM Sans',sans-serif; }
        #bbc-wrap ::-webkit-scrollbar { width:4px; }
        #bbc-wrap ::-webkit-scrollbar-track { background:transparent; }
        #bbc-wrap ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.15); border-radius:2px; }
        @keyframes bbc-pop  { from{opacity:0;transform:scale(.85) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes bbc-msgin{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bbc-dot  { 0%,80%,100%{transform:scale(0.6);opacity:.3} 40%{transform:scale(1);opacity:1} }
        .bbc-chip:hover { background:rgba(196,26,26,.22)!important; border-color:rgba(196,26,26,.5)!important; }
        .bbc-send:hover { opacity:.8; }
        .bbc-togbtn:hover { transform:scale(1.05); }
      `}</style>

            <div id="bbc-wrap" style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, fontFamily: "'DM Sans',sans-serif" }}>

                {/* ── CHAT WINDOW ── */}
                {open && (
                    <div style={{
                        position: "absolute", bottom: "66px", right: 0,
                        width: "360px", height: "560px",
                        background: "#0E0202", border: "1px solid rgba(196,26,26,.3)",
                        display: "flex", flexDirection: "column",
                        animation: "bbc-pop .28s cubic-bezier(.16,1,.3,1) both",
                        overflow: "hidden",
                    }}>

                        {/* Header */}
                        <div style={{ background: "#1A0404", borderBottom: "1px solid rgba(196,26,26,.25)", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{ width: "36px", height: "36px", background: "#C41A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    </svg>
                                </div>
                                <span style={{ position: "absolute", bottom: 0, right: 0, width: "9px", height: "9px", background: "#22C55E", border: "2px solid #1A0404", borderRadius: "50%" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#FDF6F0", lineHeight: 1.2 }}>Baku Book Center</p>
                                <p style={{ fontSize: "11px", color: "rgba(253,246,240,.4)", lineHeight: 1.3 }}>AI Assistant · Online</p>
                            </div>
                            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(253,246,240,.4)", padding: "4px", lineHeight: 1, fontSize: "18px" }}>×</button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {messages.map(m => (
                                <div key={m.id} style={{
                                    display: "flex", flexDirection: "column",
                                    alignItems: m.role === "user" ? "flex-end" : "flex-start",
                                    animation: "bbc-msgin .25s ease both",
                                }}>
                                    <div style={{
                                        maxWidth: "82%", padding: "10px 13px",
                                        background: m.role === "user" ? "#C41A1A" : "#1E0404",
                                        border: m.role === "bot" ? "1px solid rgba(196,26,26,.18)" : "none",
                                        fontSize: "13px", fontWeight: 400, color: "#FDF6F0",
                                        lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word",
                                    }}>
                                        {m.text}
                                    </div>
                                    <span style={{ fontSize: "10px", color: "rgba(253,246,240,.22)", marginTop: "4px", paddingLeft: "2px", paddingRight: "2px" }}>{m.time}</span>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {typing && (
                                <div style={{ display: "flex", alignItems: "flex-start" }}>
                                    <div style={{ padding: "10px 14px", background: "#1E0404", border: "1px solid rgba(196,26,26,.18)", display: "flex", gap: "4px", alignItems: "center" }}>
                                        {[0, 1, 2].map(i => (
                                            <span key={i} style={{ width: "5px", height: "5px", background: "rgba(253,246,240,.5)", borderRadius: "50%", display: "inline-block", animation: `bbc-dot 1.2s ${i * 0.2}s infinite` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick chips */}
                        <div style={{ padding: "8px 12px 0", display: "flex", gap: "6px", flexWrap: "wrap", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,.04)" }}>
                            {chips.map(c => (
                                <button key={c.label} className="bbc-chip"
                                    onClick={() => send(c.query)}
                                    style={{
                                        fontSize: "11px", fontWeight: 500, color: "rgba(253,246,240,.6)",
                                        background: "rgba(196,26,26,.1)", border: "1px solid rgba(196,26,26,.25)",
                                        padding: "5px 10px", cursor: "pointer", transition: "all .18s", whiteSpace: "nowrap",
                                    }}>
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{ padding: "10px 12px 14px", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Type a message…"
                                style={{
                                    flex: 1, background: "#1A0404", border: "1px solid rgba(196,26,26,.25)",
                                    outline: "none", padding: "10px 13px", fontSize: "13px",
                                    color: "#FDF6F0", fontFamily: "'DM Sans',sans-serif",
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = "rgba(196,26,26,.6)")}
                                onBlur={e => (e.currentTarget.style.borderColor = "rgba(196,26,26,.25)")}
                            />
                            <button className="bbc-send"
                                onClick={() => send(input)}
                                style={{
                                    width: "38px", height: "38px", background: "#C41A1A",
                                    border: "none", cursor: "pointer", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, transition: "opacity .2s",
                                }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── TOGGLE BUTTON ── */}
                <button
                    className="bbc-togbtn"
                    onClick={() => setOpen(v => !v)}
                    style={{
                        width: "54px", height: "54px", background: "#C41A1A",
                        border: "none", cursor: "pointer", position: "relative",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "transform .2s", boxShadow: "0 4px 20px rgba(196,26,26,.5)",
                    }}>
                    {open ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    )}
                    {!open && unread > 0 && (
                        <span style={{
                            position: "absolute", top: "-4px", right: "-4px",
                            width: "18px", height: "18px", background: "#FDF6F0",
                            borderRadius: "50%", fontSize: "10px", fontWeight: 700,
                            color: "#C41A1A", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>{unread}</span>
                    )}
                </button>
            </div>
        </>
    );
}