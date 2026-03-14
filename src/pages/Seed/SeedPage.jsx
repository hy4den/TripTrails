import { useState } from 'react';
import { doc, setDoc, writeBatch, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

// Picsum photos helper — deterministic URLs per seed
const p = (seed, w = 800, h = 520) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const SEED_ROUTES = [
  {
    title: '3 Günlük İstanbul Turu',
    description: 'Köprülerin şehri İstanbul\'da tarihe ve kültüre dolu 3 unutulmaz gün. Boğaz turu, tarihi yarımada ve lezzetli Türk mutfağı sizi bekliyor.',
    location: { city: 'Istanbul', country: 'Turkiye' },
    metadata: { currency: 'TRY', totalBudget: 3800 },
    engagement: { likes: 284, saves: 113, averageRating: 4.8, ratingCount: 52, comments: 27 },
    tags: ['tarih', 'kultur', 'yemek'],
    days: [
      { dayNumber: 1, title: 'Tarihi Yarımada' },
      { dayNumber: 2, title: 'Boğaziçi Turu' },
      { dayNumber: 3, title: 'Asya Yakası' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Ayasofya', lat: 41.0086, lng: 28.9802, category: 'turistik', notes: 'UNESCO World Heritage Site, sabah erken gidin.', budget: 200, photos: [p('ayasofya1'), p('ayasofya2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Topkapı Sarayı', lat: 41.0115, lng: 28.9833, category: 'turistik', notes: 'Osmanlı İmparatorluğu\'nun kalbi, müthiş manzaralar.', budget: 300, photos: [p('topkapi1')] },
      { dayNumber: 1, orderIndex: 2, placeName: 'Kapalı Çarşı', lat: 41.0105, lng: 28.9682, category: 'alisveris', notes: '4000\'den fazla dükkan, mutlaka pazarlık yapın.', budget: 500, photos: [p('kapalicarsi1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Galata Kulesi', lat: 41.0257, lng: 28.9742, category: 'turistik', notes: 'Şehrin en iyi panoramik manzarası buradan.', budget: 180, photos: [p('galata1'), p('galata2')] },
      { dayNumber: 2, orderIndex: 1, placeName: 'Ortaköy', lat: 41.0478, lng: 29.0276, category: 'restoran', notes: 'Kumpir ve deniz manzaralı kahve için ideal.', budget: 150, photos: [p('ortakoy1')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Kadıköy Çarşısı', lat: 40.9906, lng: 29.0232, category: 'alisveris', notes: 'En otantik İstanbul pazar deneyimi.', budget: 200, photos: [p('kadikoy1')] },
      { dayNumber: 3, orderIndex: 1, placeName: 'Moda', lat: 40.9842, lng: 29.0327, category: 'restoran', notes: 'Sahil kenarında kahve içmek için harika.', budget: 100, photos: [p('moda1')] },
    ],
  },
  {
    title: 'Kapadokya\'da Sihirli 2 Gün',
    description: 'Peri bacaları ve yeraltı şehirleriyle ünlü Kapadokya\'da balon turundan gün batımı manzarasına kadar efsane bir kaçamak.',
    location: { city: 'Göreme', country: 'Turkiye' },
    metadata: { currency: 'TRY', totalBudget: 5500 },
    engagement: { likes: 412, saves: 198, averageRating: 4.9, ratingCount: 87, comments: 43 },
    tags: ['doga', 'macera', 'romantik'],
    days: [
      { dayNumber: 1, title: 'Peri Bacaları ve Vadiler' },
      { dayNumber: 2, title: 'Balon Turu ve Yeraltı Şehri' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Göreme Açık Hava Müzesi', lat: 38.6436, lng: 34.8296, category: 'turistik', notes: 'Kaya kiliseleri ve freskler muhteşem.', budget: 220, photos: [p('goreme1'), p('goreme2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Peri Bacaları', lat: 38.6592, lng: 34.8328, category: 'turistik', notes: 'Gün batımında mutlaka ziyaret edin.', budget: 0, photos: [p('cappadocia1'), p('cappadocia2')] },
      { dayNumber: 1, orderIndex: 2, placeName: 'Kızılçukur Vadisi', lat: 38.6272, lng: 34.8442, category: 'diger', notes: 'Trekking için en güzel vadi.', budget: 0, photos: [p('redvalley1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Balon Turu Kalkış Noktası', lat: 38.6430, lng: 34.8272, category: 'diger', notes: 'Sabah 5\'te kalkış, rezervasyon şart.', budget: 3000, photos: [p('balloon1'), p('balloon2')] },
      { dayNumber: 2, orderIndex: 1, placeName: 'Derinkuyu Yeraltı Şehri', lat: 38.3760, lng: 34.7344, category: 'turistik', notes: 'Antik çağdan kalma yeraltı labirenti.', budget: 180, photos: [p('underground1')] },
    ],
  },
  {
    title: 'Antalya\'da 4 Gün Deniz ve Tarih',
    description: 'Türkiye\'nin incisi Antalya\'da turkuaz deniz, antik kalıntılar ve taze deniz ürünleriyle dolu mükemmel bir tatil.',
    location: { city: 'Antalya', country: 'Turkiye' },
    metadata: { currency: 'TRY', totalBudget: 4200 },
    engagement: { likes: 189, saves: 76, averageRating: 4.6, ratingCount: 34, comments: 18 },
    tags: ['deniz', 'tarih', 'yemek'],
    days: [
      { dayNumber: 1, title: 'Kaleiçi ve Tarihi Merkez' },
      { dayNumber: 2, title: 'Konyaaltı Sahili' },
      { dayNumber: 3, title: 'Aspendos ve Termessos' },
      { dayNumber: 4, title: 'Düden Şelalesi ve Alışveriş' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Kaleiçi', lat: 36.8874, lng: 30.7078, category: 'turistik', notes: 'Antik Roma limanı ve renkli tarihi evler.', budget: 0, photos: [p('kalcici1'), p('kalcici2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Hadrian Kapısı', lat: 36.8856, lng: 30.7094, category: 'turistik', notes: 'Roma İmparatoru Hadrian için inşa edilmiş.', budget: 0, photos: [p('hadrian1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Konyaaltı Plajı', lat: 36.8787, lng: 30.6532, category: 'diger', notes: 'Çakıl plaj, seyahat süresince muhteşem.', budget: 200, photos: [p('konyaalti1'), p('konyaalti2')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Aspendos Antik Tiyatrosu', lat: 36.9406, lng: 31.1716, category: 'turistik', notes: 'Dünyanın en iyi korunmuş antik tiyatrosu.', budget: 160, photos: [p('aspendos1')] },
      { dayNumber: 4, orderIndex: 0, placeName: 'Düden Şelalesi', lat: 36.9218, lng: 30.7473, category: 'turistik', notes: 'Denize dökülen şelale - eşsiz görüntü.', budget: 0, photos: [p('duden1')] },
    ],
  },
  {
    title: 'Paris\'te 5 Romantik Gün',
    description: 'Işık şehrinde Eiffel Kulesi, Louvre, Seine nehri kıyısında yürüyüş ve Fransız mutfağıyla dolu romantik Paris deneyimi.',
    location: { city: 'Paris', country: 'Fransa' },
    metadata: { currency: 'EUR', totalBudget: 1800 },
    engagement: { likes: 521, saves: 267, averageRating: 4.9, ratingCount: 104, comments: 62 },
    tags: ['romantik', 'tarih', 'sanat', 'yemek'],
    days: [
      { dayNumber: 1, title: 'Eiffel ve Champ de Mars' },
      { dayNumber: 2, title: 'Louvre ve Ile de la Cité' },
      { dayNumber: 3, title: 'Montmartre' },
      { dayNumber: 4, title: 'Marais ve Le Marais' },
      { dayNumber: 5, title: 'Versailles Günü' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Eiffel Kulesi', lat: 48.8584, lng: 2.2945, category: 'turistik', notes: 'Akşam ışık gösterisi muhteşem, erken rezervasyon şart.', budget: 26, photos: [p('eiffel1'), p('eiffel2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Champ de Mars', lat: 48.8556, lng: 2.2987, category: 'diger', notes: 'Piknik ve Eiffel fotoğrafı için mükemmel.', budget: 15, photos: [p('champdemars1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Louvre Müzesi', lat: 48.8606, lng: 2.3376, category: 'turistik', notes: 'Mona Lisa için sabah erken gidin, çok kalabalık olur.', budget: 17, photos: [p('louvre1'), p('louvre2')] },
      { dayNumber: 2, orderIndex: 1, placeName: 'Notre Dame Katedrali', lat: 48.8530, lng: 2.3499, category: 'turistik', notes: 'Gotik mimari harikası, onarım sürmekte.', budget: 0, photos: [p('notredame1')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Sacré-Cœur Bazilikası', lat: 48.8867, lng: 2.3431, category: 'turistik', notes: 'Montmartre\'dan şehrin en güzel manzarası.', budget: 0, photos: [p('sacrecoeur1'), p('sacrecoeur2')] },
      { dayNumber: 4, orderIndex: 0, placeName: 'Le Marais', lat: 48.8574, lng: 2.3570, category: 'alisveris', notes: 'Tarihi Yahudi mahallesi, butik dükkanlar.', budget: 80, photos: [p('marais1')] },
      { dayNumber: 5, orderIndex: 0, placeName: 'Versailles Sarayı', lat: 48.8049, lng: 2.1204, category: 'turistik', notes: 'Güneş Kral Louis XIV\'ün muhteşem sarayı.', budget: 20, photos: [p('versailles1'), p('versailles2')] },
    ],
  },
  {
    title: 'Roma\'nın İzlerinde 3 Gün',
    description: 'Ebedi şehir Roma\'da Kolezyum\'dan Vatikan\'a, Trevi Çeşmesi\'nden taze pizzaya kadarbir tarihi yolculuk.',
    location: { city: 'Roma', country: 'Italya' },
    metadata: { currency: 'EUR', totalBudget: 1200 },
    engagement: { likes: 347, saves: 142, averageRating: 4.7, ratingCount: 68, comments: 34 },
    tags: ['tarih', 'yemek', 'kultur'],
    days: [
      { dayNumber: 1, title: 'Antik Roma' },
      { dayNumber: 2, title: 'Vatikan' },
      { dayNumber: 3, title: 'Barok Roma' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Kolezyum', lat: 41.8902, lng: 12.4922, category: 'turistik', notes: 'Dünyanın en büyük antik amfitiyatrosu, mutlaka görün.', budget: 16, photos: [p('colosseum1'), p('colosseum2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Forum Romanum', lat: 41.8925, lng: 12.4853, category: 'turistik', notes: 'Roma\'nın kalbi, ücretsiz ziyaret.', budget: 0, photos: [p('forum1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Vatikan Müzeleri', lat: 41.9062, lng: 12.4534, category: 'turistik', notes: 'Sistine Şapeli için erken rezervasyon şart.', budget: 17, photos: [p('vatican1'), p('vatican2')] },
      { dayNumber: 2, orderIndex: 1, placeName: 'Aziz Petrus Meydanı', lat: 41.9022, lng: 12.4539, category: 'turistik', notes: 'Ücretsiz, muhteşem manzara.', budget: 0, photos: [p('saintpeter1')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Trevi Çeşmesi', lat: 41.9009, lng: 12.4833, category: 'turistik', notes: 'Sabah erken gidin kalabalıktan kaçmak için.', budget: 5, photos: [p('trevi1'), p('trevi2')] },
      { dayNumber: 3, orderIndex: 1, placeName: 'Piazza Navona', lat: 41.8992, lng: 12.4731, category: 'diger', notes: 'Gelato yiyerek Bernini\'nin eserlerini izleyin.', budget: 8, photos: [p('navona1')] },
    ],
  },
  {
    title: 'Barselona Kaçamağı',
    description: 'Gaudi\'nin şehri Barselona\'da Sagrada Familia, Park Güell ve plaj tatilini bir arada yaşa.',
    location: { city: 'Barselona', country: 'İspanya' },
    metadata: { currency: 'EUR', totalBudget: 1400 },
    engagement: { likes: 298, saves: 121, averageRating: 4.8, ratingCount: 59, comments: 28 },
    tags: ['mimari', 'deniz', 'sanat'],
    days: [
      { dayNumber: 1, title: 'Gaudi Şehri' },
      { dayNumber: 2, title: 'Gotik Mahalle ve La Barceloneta' },
      { dayNumber: 3, title: 'Montjuïc ve Alışveriş' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Sagrada Familia', lat: 41.4036, lng: 2.1744, category: 'turistik', notes: 'Gaudi\'nin başyapıtı, iç mekan mutlaka görülmeli.', budget: 26, photos: [p('sagrada1'), p('sagrada2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Park Güell', lat: 41.4145, lng: 2.1527, category: 'turistik', notes: 'Renkli mozaikler ve şehir manzarası.', budget: 10, photos: [p('parkguell1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Gotik Mahalle', lat: 41.3834, lng: 2.1762, category: 'turistik', notes: 'Dar sokaklar, antik Barselona ruhu.', budget: 0, photos: [p('gothic1')] },
      { dayNumber: 2, orderIndex: 1, placeName: 'Barceloneta Plajı', lat: 41.3780, lng: 2.1913, category: 'diger', notes: 'Şehir plajı, canlı atmosfer.', budget: 20, photos: [p('bcnbeach1'), p('bcnbeach2')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'La Boqueria Pazarı', lat: 41.3814, lng: 2.1722, category: 'restoran', notes: 'Taptaze ürünler ve lezzetli tapaslar.', budget: 25, photos: [p('boqueria1')] },
    ],
  },
  {
    title: 'Amsterdam Bisiklet Turu',
    description: 'Kanallar şehri Amsterdam\'da bisikletle keşif, Van Gogh Müzesi ve tulipanlar arasında 3 unutulmaz gün.',
    location: { city: 'Amsterdam', country: 'Hollanda' },
    metadata: { currency: 'EUR', totalBudget: 800 },
    engagement: { likes: 213, saves: 89, averageRating: 4.6, ratingCount: 41, comments: 19 },
    tags: ['bisiklet', 'kanal', 'sanat'],
    days: [
      { dayNumber: 1, title: 'Runelstraat ve Kanallar' },
      { dayNumber: 2, title: 'Müzeler' },
      { dayNumber: 3, title: 'Vondelpark ve Alışveriş' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Anne Frank Evi', lat: 52.3752, lng: 4.8840, category: 'turistik', notes: 'Çok dokunaklı, önceden bilet alın.', budget: 14, photos: [p('annefrank1')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Jordaan Mahallesi', lat: 52.3745, lng: 4.8823, category: 'diger', notes: 'Kanalların tadını en iyi buradan çıkarırsınız.', budget: 0, photos: [p('jordaan1'), p('jordaan2')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Van Gogh Müzesi', lat: 52.3584, lng: 4.8811, category: 'turistik', notes: 'Dünyada en fazla Van Gogh koleksiyonu.', budget: 19, photos: [p('vangogh1')] },
      { dayNumber: 2, orderIndex: 1, placeName: 'Rijksmuseum', lat: 52.3600, lng: 4.8852, category: 'turistik', notes: 'Rembrandt ve Vermeer eserleri müthiş.', budget: 22, photos: [p('rijks1'), p('rijks2')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Vondelpark', lat: 52.3579, lng: 4.8678, category: 'diger', notes: 'Piknik ve bisiklet için şehrin en güzel parkı.', budget: 0, photos: [p('vondelpark1')] },
    ],
  },
  {
    title: 'Prag Masalı',
    description: 'Çek başkenti Prag\'da ortaçağ dönemi mimarisi, Prag Kalesi ve meşhur Çek birası ile büyülü bir şehir turu.',
    location: { city: 'Prag', country: 'Çek Cumhuriyeti' },
    metadata: { currency: 'EUR', totalBudget: 700 },
    engagement: { likes: 167, saves: 72, averageRating: 4.7, ratingCount: 33, comments: 14 },
    tags: ['tarih', 'mimari', 'gece-hayati'],
    days: [
      { dayNumber: 1, title: 'Stare Mesto ve Eski Şehir' },
      { dayNumber: 2, title: 'Prag Kalesi' },
      { dayNumber: 3, title: 'Vinohrady ve Çıkış' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Eski Şehir Meydanı', lat: 50.0875, lng: 14.4213, category: 'turistik', notes: 'Astronomik saati başlangıç noktası yapın.', budget: 0, photos: [p('prague1'), p('prague2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Charles Köprüsü', lat: 50.0865, lng: 14.4114, category: 'turistik', notes: 'Gün batımında yürüyüş muhteşem.', budget: 0, photos: [p('charlesbridge1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Prag Kalesi', lat: 50.0900, lng: 14.4018, category: 'turistik', notes: 'Dünyanın en büyük kalelerinden, Aziz Vitus Katedrali dahil.', budget: 15, photos: [p('pragcastle1'), p('pragcastle2')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Kafka Müzesi', lat: 50.0887, lng: 14.4082, category: 'turistik', notes: 'Kafka\'nın Prag\'ını anlamak için.', budget: 10, photos: [p('kafka1')] },
    ],
  },
  {
    title: 'Tokyo\'yu Keşfet: 7 Gün',
    description: 'Modern ve geleneksel Tokyo\'da yedi gün boyunca tapınaklar, anime kültürü, sushi ve çılgın teknoloji coşkusu.',
    location: { city: 'Tokyo', country: 'Japonya' },
    metadata: { currency: 'JPY', totalBudget: 120000 },
    engagement: { likes: 634, saves: 312, averageRating: 5.0, ratingCount: 127, comments: 71 },
    tags: ['teknoloji', 'yemek', 'kultur', 'anime'],
    days: [
      { dayNumber: 1, title: 'Shinjuku' },
      { dayNumber: 2, title: 'Shibuya ve Harajuku' },
      { dayNumber: 3, title: 'Akihabara ve Asakusa' },
      { dayNumber: 4, title: 'Fuji Dağı Günübirlik' },
      { dayNumber: 5, title: 'Kyoto Günübirlik' },
      { dayNumber: 6, title: 'Tsukiji ve Odaiba' },
      { dayNumber: 7, title: 'Ginza ve Çıkış' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Shinjuku Gyoen', lat: 35.6852, lng: 139.7100, category: 'diger', notes: 'Kiraz çiçeği mevsiminde cennet gibi.', budget: 500, photos: [p('shinjuku1'), p('shinjuku2')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Shibuya Geçidi', lat: 35.6595, lng: 139.7004, category: 'turistik', notes: 'Dünyanın en yoğun yaya geçidi.', budget: 0, photos: [p('shibuya1')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Senso-ji Tapınağı', lat: 35.7148, lng: 139.7967, category: 'turistik', notes: 'Tokyo\'nun en eski ve en ünlü tapınağı.', budget: 0, photos: [p('sensoji1'), p('sensoji2')] },
      { dayNumber: 3, orderIndex: 1, placeName: 'Akihabara', lat: 35.6983, lng: 139.7714, category: 'alisveris', notes: 'Elektronik ve anime kültürünün merkezi.', budget: 8000, photos: [p('akihabara1')] },
      { dayNumber: 6, orderIndex: 0, placeName: 'Tsukiji Pazarı', lat: 35.6654, lng: 139.7707, category: 'restoran', notes: 'Dünyanın en taze sushisi burada.', budget: 2500, photos: [p('tsukiji1'), p('tsukiji2')] },
      { dayNumber: 7, orderIndex: 0, placeName: 'Ginza', lat: 35.6715, lng: 139.7671, category: 'alisveris', notes: 'Tokyo\'nun en lüks alışveriş caddesi.', budget: 10000, photos: [p('ginza1')] },
    ],
  },
  {
    title: 'Bali Adası\'nda 5 Gün',
    description: 'Tanrılar Adası Bali\'de tapınaklar, sonsuz pirinç tarlaları, sörf ve geleneksel Balili masajlar ile ruhunuzu dinlendirin.',
    location: { city: 'Ubud', country: 'Endonezya' },
    metadata: { currency: 'USD', totalBudget: 800 },
    engagement: { likes: 487, saves: 234, averageRating: 4.9, ratingCount: 93, comments: 51 },
    tags: ['doga', 'manevi', 'deniz', 'romantik'],
    days: [
      { dayNumber: 1, title: 'Ubud Ormanı ve Tapınaklar' },
      { dayNumber: 2, title: 'Tanah Lot ve Günbatımı' },
      { dayNumber: 3, title: 'Seminyak ve Sörf' },
      { dayNumber: 4, title: 'Tegallalang Pirinç Tarlaları' },
      { dayNumber: 5, title: 'Uluwatu' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Ubud Maymun Ormanı', lat: -8.5188, lng: 115.2594, category: 'diger', notes: 'Değerli eşyalarınızı saklayın!', budget: 10, photos: [p('ubud1'), p('ubud2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Saraswati Tapınağı', lat: -8.5069, lng: 115.2624, category: 'turistik', notes: 'Lotus gölü üzerinde geleneksel tapınak.', budget: 0, photos: [p('bali1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Tanah Lot Tapınağı', lat: -8.6211, lng: 115.0865, category: 'turistik', notes: 'Deniz üzerindeki tapınak, gün batımında harika.', budget: 5, photos: [p('tanahlot1'), p('tanahlot2')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Seminyak Plajı', lat: -8.6897, lng: 115.1604, category: 'diger', notes: 'Sörf için en iyi yer.', budget: 20, photos: [p('seminyak1')] },
      { dayNumber: 4, orderIndex: 0, placeName: 'Tegallalang Pirinç Tarlaları', lat: -8.4319, lng: 115.2775, category: 'turistik', notes: 'UNESCO miras alanı, sabah erken gidin.', budget: 0, photos: [p('rice1'), p('rice2')] },
      { dayNumber: 5, orderIndex: 0, placeName: 'Uluwatu Tapınağı', lat: -8.8292, lng: 115.0851, category: 'turistik', notes: 'Uçurum kenarı tapınak, Kecak dansı gün batımında.', budget: 5, photos: [p('uluwatu1')] },
    ],
  },
  {
    title: 'Dubai\'de 3 Gün Lüks',
    description: 'Dünyanın en yüksek binası Burj Khalifa\'dan çöl safarisine, alışveriş cennetinden su parkına kadar Dubai\'nin en iyisi.',
    location: { city: 'Dubai', country: 'BAE' },
    metadata: { currency: 'USD', totalBudget: 1500 },
    engagement: { likes: 378, saves: 156, averageRating: 4.7, ratingCount: 72, comments: 38 },
    tags: ['lüks', 'modern', 'alışveriş'],
    days: [
      { dayNumber: 1, title: 'Burj Khalifa ve Downtown' },
      { dayNumber: 2, title: 'Çöl Safarisi' },
      { dayNumber: 3, title: 'Dubai Marina' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Burj Khalifa', lat: 25.1972, lng: 55.2744, category: 'turistik', notes: 'Dünyanın en yüksek binası, gün batımında ziyaret edin.', budget: 35, photos: [p('burj1'), p('burj2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Dubai Alışveriş Merkezi', lat: 25.1980, lng: 55.2791, category: 'alisveris', notes: 'Dünyanın en büyük AVM\'si, içinde buz pateni pisti var.', budget: 200, photos: [p('dubaimall1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Çöl Safarisi Buluşma Noktası', lat: 24.9857, lng: 55.4272, category: 'diger', notes: 'Dune bashing ve kum üzerinde gün batımı.', budget: 80, photos: [p('desert1'), p('desert2')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Dubai Marina', lat: 25.0800, lng: 55.1404, category: 'diger', notes: 'Yat turu için ideal, restoranlar mükemmel.', budget: 100, photos: [p('marina1'), p('marina2')] },
    ],
  },
  {
    title: 'Londra\'da 4 Gün İngiliz Tarz',
    description: 'Big Ben\'den Stonehenge\'e, müzelerden Hyde Park\'a Londra\'nın en önemli noktalarını keşfeden kapsamlı bir tur.',
    location: { city: 'Londra', country: 'Birleşik Krallık' },
    metadata: { currency: 'GBP', totalBudget: 1200 },
    engagement: { likes: 244, saves: 98, averageRating: 4.5, ratingCount: 47, comments: 22 },
    tags: ['tarih', 'kultur', 'muzeler'],
    days: [
      { dayNumber: 1, title: 'Westminster' },
      { dayNumber: 2, title: 'Müzeler' },
      { dayNumber: 3, title: 'Notting Hill ve Hyde Park' },
      { dayNumber: 4, title: 'Tower of London ve Shoreditch' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Big Ben ve Westminster', lat: 51.5007, lng: -0.1246, category: 'turistik', notes: 'Gündüz ve gece ziyareti çok farklı.', budget: 0, photos: [p('london1'), p('london2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Buckingham Sarayı', lat: 51.5014, lng: -0.1419, category: 'turistik', notes: 'Nöbet değişimi sabah 11.00\'de.', budget: 0, photos: [p('buckingham1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'British Museum', lat: 51.5194, lng: -0.1269, category: 'turistik', notes: 'Ücretsiz, Rosetta Taşı mutlaka görülmeli.', budget: 0, photos: [p('britishmuseum1'), p('britishmuseum2')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Hyde Park', lat: 51.5073, lng: -0.1657, category: 'diger', notes: 'Speaker\'s Corner sabah sabah çok eğlenceli.', budget: 0, photos: [p('hydepark1')] },
      { dayNumber: 4, orderIndex: 0, placeName: 'Tower of London', lat: 51.5081, lng: -0.0759, category: 'turistik', notes: 'Kraliyet takı koleksiyonunu kaçırmayın.', budget: 30, photos: [p('tower1'), p('tower2')] },
    ],
  },
  {
    title: 'New York\'ta 5 Gün',
    description: 'Uykusuz şehir New York\'ta Central Park, Times Square, Özgürlük Heykeli ve Broadway müzikali ile dolu hızlı tempolu bir tur.',
    location: { city: 'New York', country: 'ABD' },
    metadata: { currency: 'USD', totalBudget: 2000 },
    engagement: { likes: 318, saves: 134, averageRating: 4.6, ratingCount: 61, comments: 29 },
    tags: ['sehir', 'kultur', 'yemek', 'sanat'],
    days: [
      { dayNumber: 1, title: 'Manhattan — Midtown' },
      { dayNumber: 2, title: 'Downtown ve Özgürlük Heykeli' },
      { dayNumber: 3, title: 'Central Park ve Upper West Side' },
      { dayNumber: 4, title: 'Brooklyn' },
      { dayNumber: 5, title: 'MOMA ve Alışveriş' },
    ],
    pins: [
      { dayNumber: 1, orderIndex: 0, placeName: 'Times Square', lat: 40.7580, lng: -73.9855, category: 'turistik', notes: 'Gece manzarası çok daha iyi.', budget: 0, photos: [p('timessquare1'), p('timessquare2')] },
      { dayNumber: 1, orderIndex: 1, placeName: 'Empire State Building', lat: 40.7484, lng: -73.9856, category: 'turistik', notes: 'NYC manzarası için en iyi noktalardan biri.', budget: 42, photos: [p('empire1')] },
      { dayNumber: 2, orderIndex: 0, placeName: 'Özgürlük Heykeli', lat: 40.6892, lng: -74.0445, category: 'turistik', notes: 'Feribot ile ulaşım, önceden bilet alın.', budget: 24, photos: [p('liberty1'), p('liberty2')] },
      { dayNumber: 3, orderIndex: 0, placeName: 'Central Park', lat: 40.7851, lng: -73.9683, category: 'diger', notes: 'Bisiklet ve yürüyüş için ideal.', budget: 20, photos: [p('centralpark1')] },
      { dayNumber: 4, orderIndex: 0, placeName: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969, category: 'turistik', notes: 'Köprü yürüyüşü ve Manhattan manzarası.', budget: 0, photos: [p('brooklyn1'), p('brooklyn2')] },
      { dayNumber: 5, orderIndex: 0, placeName: 'MoMA', lat: 40.7615, lng: -73.9777, category: 'turistik', notes: 'Modern sanat sevenler için vazgeçilmez.', budget: 25, photos: [p('moma1')] },
    ],
  },
];

export default function SeedPage() {
  const { currentUser, userProfile } = useAuth();
  const [progress, setProgress] = useState(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleSeed = async () => {
    if (!currentUser) return;
    setDone(false);
    setError(null);

    const authorName = userProfile?.displayName || currentUser.displayName || 'TripTrails';
    const authorPhotoURL = userProfile?.photoURL || null;

    for (let i = 0; i < SEED_ROUTES.length; i++) {
      const rd = SEED_ROUTES[i];
      setProgress({ current: i + 1, total: SEED_ROUTES.length, label: rd.title });

      try {
        const routeId = uuidv4();
        const batch = writeBatch(db);

        const totalBudget = rd.pins.reduce((sum, p) => sum + (p.budget || 0), 0);

        const routeRef = doc(db, 'routes', routeId);
        batch.set(routeRef, {
          title: rd.title,
          description: rd.description,
          authorId: currentUser.uid,
          authorName,
          authorPhotoURL,
          coverImageURL: rd.pins[0]?.photos?.[0] || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'published',
          isPublic: true,
          days: rd.days,
          location: rd.location,
          metadata: {
            totalDays: rd.days.length,
            totalPins: rd.pins.length,
            totalBudget: rd.metadata?.totalBudget || totalBudget,
            currency: rd.metadata?.currency || 'TRY',
          },
          engagement: rd.engagement,
          tags: rd.tags || [],
        });

        for (const pin of rd.pins) {
          const pinRef = doc(db, 'routes', routeId, 'pins', uuidv4());
          batch.set(pinRef, {
            dayNumber: pin.dayNumber,
            orderIndex: pin.orderIndex,
            placeName: pin.placeName,
            coordinates: { lat: pin.lat, lng: pin.lng },
            category: pin.category || '',
            notes: pin.notes || '',
            photos: pin.photos || [],
            budget: {
              amount: pin.budget || 0,
              currency: rd.metadata?.currency || 'TRY',
              category: pin.category || '',
            },
            rating: null,
            duration: null,
            createdAt: serverTimestamp(),
          });
        }

        await batch.commit();
      } catch (err) {
        console.error(`Failed for ${rd.title}:`, err);
        setError(`"${rd.title}" eklenirken hata: ${err.message}`);
        return;
      }
    }

    setProgress(null);
    setDone(true);
  };

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: 24, fontFamily: 'inherit' }}>
      <h2 style={{ marginBottom: 8 }}>🌱 Veritabanı Seed Aracı</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>
        Test için {SEED_ROUTES.length} hazır rota ekler. Bu sayfa sadece geliştirme amaçlıdır.
      </p>

      {!progress && !done && (
        <button
          onClick={handleSeed}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {SEED_ROUTES.length} Rotayı Ekle
        </button>
      )}

      {progress && (
        <div>
          <div style={{ marginBottom: 8, fontSize: 14, color: 'var(--color-text-secondary)' }}>
            {progress.current} / {progress.total} — {progress.label}
          </div>
          <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
                background: 'var(--color-primary)',
                height: '100%',
                borderRadius: 4,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}

      {done && (
        <div style={{ color: 'var(--color-secondary)', fontWeight: 600, fontSize: 15 }}>
          ✓ {SEED_ROUTES.length} rota başarıyla eklendi! Keşfet sayfasını ziyaret edin.
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 12 }}>
          Hata: {error}
        </div>
      )}

      <SeedUsersSection currentUser={currentUser} userProfile={userProfile} />
    </div>
  );
}

// ─── Seed Users Section ───────────────────────────────────────────────────────

const SEED_USERS = [
  { id: 'seed_user_ayse',   displayName: 'Ayşe Kaya',     bio: 'Dünya gezgini 🌍 50+ ülke',    photoURL: 'https://picsum.photos/seed/ayse/200/200'   },
  { id: 'seed_user_mehmet', displayName: 'Mehmet Demir',  bio: 'Fotoğrafçı & backpacker',      photoURL: 'https://picsum.photos/seed/mehmet/200/200' },
  { id: 'seed_user_zeynep', displayName: 'Zeynep Yildiz', bio: 'Yemek ve seyahati severim 🍜', photoURL: 'https://picsum.photos/seed/zeynep/200/200' },
  { id: 'seed_user_can',    displayName: 'Can Ozturk',    bio: 'Dağcı | Ankara',               photoURL: 'https://picsum.photos/seed/can/200/200'    },
  { id: 'seed_user_elif',   displayName: 'Elif Sahin',    bio: 'Dijital nomad ☕',              photoURL: 'https://picsum.photos/seed/elif/200/200'   },
];

const SEED_MESSAGES = [
  ['Merhaba! Rotalarını çok beğendim 🗺️', 'Teşekkürler! Sen de harika rotalar yapmışsın.'],
  ['İstanbul rotana baktım, muhteşem!', 'Orası gerçekten unutulmaz. Gittin mi?'],
  ['Selam! Birlikte bir rota planlayalım mı?', 'Harika fikir! Hangi şehri düşünüyorsun?'],
  ['Yeni rotan çok ilham verici 🙌', 'Çok teşekkürler, hazırlaması eğlenceliydi!'],
  ['O bölgeyi ben de çok seviyorum.', 'Katılıyorum, kesinlikle tavsiye edilir!'],
];

function SeedUsersSection({ currentUser, userProfile }) {
  const [status, setStatus] = useState('idle');
  const [msg, setMsg] = useState('');

  const handleSeedUsers = async () => {
    if (!currentUser) return;
    setStatus('loading');
    setMsg('');

    try {
      const myName  = userProfile?.displayName || currentUser.displayName || 'Sen';
      const myPhoto = userProfile?.photoURL || null;

      for (const u of SEED_USERS) {
        const idx = SEED_USERS.indexOf(u);

        // 1. Create fake user Firestore document
        await setDoc(doc(db, 'users', u.id), {
          displayName: u.displayName, bio: u.bio, photoURL: u.photoURL,
          stats: { countriesVisited: 3 + idx, citiesVisited: 7 + idx, routesCreated: idx + 1 },
          followers: 10 + idx * 3, following: 8 + idx,
          badges: ['first_route', 'explorer'],
          createdAt: serverTimestamp(),
        }, { merge: true });

        // 2. Bilateral friendship
        await setDoc(doc(db, 'friends', `${currentUser.uid}_${u.id}`), {
          userId: currentUser.uid, friendId: u.id,
          friendName: u.displayName, friendPhotoURL: u.photoURL,
          createdAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'friends', `${u.id}_${currentUser.uid}`), {
          userId: u.id, friendId: currentUser.uid,
          friendName: myName, friendPhotoURL: myPhoto,
          createdAt: serverTimestamp(),
        });

        // 3. Conversation
        const convId = [currentUser.uid, u.id].sort().join('_');
        const msgPair = SEED_MESSAGES[idx % SEED_MESSAGES.length];
        await setDoc(doc(db, 'conversations', convId), {
          participants: [currentUser.uid, u.id],
          participantNames:  { [currentUser.uid]: myName,  [u.id]: u.displayName },
          participantPhotos: { [currentUser.uid]: myPhoto, [u.id]: u.photoURL   },
          lastMessage: msgPair[1], lastMessageAt: serverTimestamp(),
          unread: { [currentUser.uid]: 1, [u.id]: 0 },
          createdAt: serverTimestamp(),
        }, { merge: true });

        // 4. Seed messages
        await addDoc(collection(db, 'conversations', convId, 'messages'), {
          senderId: u.id, text: msgPair[0], createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, 'conversations', convId, 'messages'), {
          senderId: currentUser.uid, text: msgPair[1], createdAt: serverTimestamp(),
        });
      }

      setStatus('done');
      setMsg(`${SEED_USERS.length} kullanıcı eklendi, arkadaşlık ve mesajlar oluşturuldu!`);
    } catch (err) {
      setStatus('error');
      setMsg('Hata: ' + err.message);
    }
  };

  return (
    <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--color-border)' }}>
      <h3 style={{ marginBottom: 8 }}>👥 Test Kullanıcıları Ekle</h3>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 16 }}>
        {SEED_USERS.length} test kullanıcısı ekler, hepsini sana otomatik arkadaş yapar ve konuşma başlatır.
      </p>
      {status !== 'done' && (
        <button
          onClick={handleSeedUsers}
          disabled={status === 'loading'}
          style={{
            backgroundColor: 'var(--color-secondary)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px 24px',
            fontSize: 14, cursor: 'pointer', fontWeight: 600,
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {status === 'loading' ? 'Ekleniyor...' : `${SEED_USERS.length} Kullanıcı Ekle & Arkadaş Yap`}
        </button>
      )}
      {msg && (
        <p style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: status === 'done' ? 'var(--color-secondary)' : 'var(--color-danger)' }}>
          {status === 'done' ? '✓ ' : '✗ '}{msg}
        </p>
      )}
    </div>
  );
}
