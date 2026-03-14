# TripTrails

> Konum tabanlı sosyal seyahat platformu — rotalarını oluştur, paylaş ve takip et.

Gazi Üniversitesi BM314 Yazılım Mühendisliği dersi kapsamında geliştirilmiştir.

---

## Özellikler

- **Rota Oluşturma** — Harita üzerinde tıklayarak veya Google Places ile arama yaparak pin ekle, günlere göre organize et, fotoğraf ve bütçe bilgisi ekle
- **Rota Takibi** — GPS ile gerçek zamanlı konum takibi; ziyaret edilen noktalar otomatik işaretlenir
- **Sosyal Etkileşim** — Beğeni, yorum, kaydetme ve takip sistemi
- **Dijital Pasaport** — Tamamlanan rotalara göre rozet ve başarım sistemi
- **Keşfet** — Ülke, şehir, gün sayısı ve bütçeye göre filtreleme; arama ve sıralama
- **Tripper Kartı** — Tamamlanan rota için fotoğraf arka planlı paylaşım kartı
- **Profil** — Kullanıcı istatistikleri, yayınlanan / taslak rotalar, takip listesi, aktif rotalar

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19 + Vite |
| Harita | Mapbox GL JS + react-map-gl v8 |
| Coğrafi Arama | Google Places API (New) |
| Auth & Veritabanı | Firebase Authentication + Firestore |
| Stil | CSS Modules |
| Routing | react-router-dom v7 |
| İkonlar | react-icons |

---

## Başlarken

### Gereksinimler

- Node.js 18+
- npm
- Firebase projesi (Firestore + Authentication aktif)
- Mapbox hesabı ve token
- Google Cloud projesi (Places API New aktif)

### Kurulum

```bash
# Repoyu klonla
git clone https://github.com/kullanici/triptrails.git
cd triptrails

# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını kendi bilgilerinle doldur

# Geliştirme sunucusunu başlat
npm run dev
```

### Ortam Değişkenleri

`.env.local` dosyasına aşağıdaki değişkenleri ekle:

```env
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_token
VITE_GOOGLE_MAPS_KEY=AIza_your_google_maps_api_key

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Firestore Kurulumu

Firebase Console → Firestore Database → **Test modunda** oluştur.

Gerekli koleksiyonlar uygulama tarafından otomatik oluşturulur: `users`, `routes`, `comments`, `likes`, `ratings`, `follows`, `activeRoutes`

---

## Proje Yapısı

```
src/
├── components/
│   ├── common/          # ProtectedRoute, StarRating, ErrorBoundary, Skeleton
│   ├── explore/         # SearchBar, FilterPanel, ExploreRouteCard
│   ├── layout/          # AppLayout, Navbar
│   ├── map/             # MapView, Pin, PinPopup, RouteLayer, PlaceSearch, TrackingPin
│   ├── profile/         # ProfileHeader, RouteCard, DigitalPassport, BadgeGrid
│   ├── route/           # DayTimeline, PinEditor, TripperCard
│   ├── social/          # LikeButton, SaveButton, CommentSection, TrackingButton
│   └── tracking/        # TrackingControls, BadgeNotification
├── config/              # firebase.js, mapbox.js, routes.js
├── contexts/            # AuthContext, ToastContext
├── hooks/               # useGeolocation, useRouteTracking
├── pages/               # Home, Auth, Explore, RouteCreate, RouteView, RouteTrack, Profile
├── services/            # authService, userService, routeService, socialService, trackingService, badgeService
├── styles/              # variables.css, global.css
└── utils/               # constants.js, mapHelpers.js
```

---

## Komutlar

```bash
npm run dev       # Geliştirme sunucusu (localhost:5173)
npm run build     # Üretim derlemesi
npm run preview   # Derleme önizleme
npm run lint      # ESLint kontrolü
```

---

## Geliştirme Ekibi

| İsim | Rol |
|------|-----|
| Çağhan Tutku Uzundurukan | Geliştirici |
| Sadık Emre Akşam | Geliştirici |
| Ali İsakova | Geliştirici |

**Ders:** Gazi Üniversitesi — BM314 Yazılım Mühendisliği

---

## Lisans

Bu proje akademik amaçlı geliştirilmiştir.
