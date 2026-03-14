// Curated list of iconic attractions by country and city.
// Used for the World Progress (Dünya İlerlemem) feature.

export const WORLD_DATA = [
  {
    code: 'TR',
    name: 'Türkiye',
    flag: '🇹🇷',
    cities: [
      {
        id: 'tr-istanbul',
        name: 'İstanbul',
        attractions: [
          { id: 'tr-ist-1', name: 'Ayasofya', icon: '🕌' },
          { id: 'tr-ist-2', name: 'Topkapı Sarayı', icon: '🏰' },
          { id: 'tr-ist-3', name: 'Kapalıçarşı', icon: '🛍️' },
          { id: 'tr-ist-4', name: 'Galata Kulesi', icon: '🗼' },
          { id: 'tr-ist-5', name: 'Sultanahmet Camii (Mavi Cami)', icon: '🕌' },
          { id: 'tr-ist-6', name: 'Dolmabahçe Sarayı', icon: '🏛️' },
          { id: 'tr-ist-7', name: 'İstiklal Caddesi', icon: '🚶' },
          { id: 'tr-ist-8', name: 'Boğaz Turu', icon: '⛵' },
          { id: 'tr-ist-9', name: 'Yerebatan Sarnıcı', icon: '🏛️' },
          { id: 'tr-ist-10', name: 'Prens Adaları', icon: '🏝️' },
        ],
      },
      {
        id: 'tr-kapadokya',
        name: 'Kapadokya',
        attractions: [
          { id: 'tr-kap-1', name: 'Balon Turu', icon: '🎈' },
          { id: 'tr-kap-2', name: 'Göreme Açık Hava Müzesi', icon: '⛪' },
          { id: 'tr-kap-3', name: 'Peri Bacaları', icon: '🗿' },
          { id: 'tr-kap-4', name: 'Derinkuyu Yeraltı Şehri', icon: '🕳️' },
          { id: 'tr-kap-5', name: 'Uçhisar Kalesi', icon: '🏰' },
          { id: 'tr-kap-6', name: 'Ihlara Vadisi', icon: '🏞️' },
          { id: 'tr-kap-7', name: 'Avanos', icon: '🏺' },
          { id: 'tr-kap-8', name: 'Paşabağ Vadisi', icon: '🗿' },
        ],
      },
      {
        id: 'tr-antalya',
        name: 'Antalya',
        attractions: [
          { id: 'tr-ant-1', name: 'Kaleiçi (Eski Şehir)', icon: '🏛️' },
          { id: 'tr-ant-2', name: 'Düden Şelalesi', icon: '💧' },
          { id: 'tr-ant-3', name: 'Aspendos Tiyatrosu', icon: '🏟️' },
          { id: 'tr-ant-4', name: 'Perge Antik Kenti', icon: '🏛️' },
          { id: 'tr-ant-5', name: 'Konyaaltı Plajı', icon: '🏖️' },
          { id: 'tr-ant-6', name: 'Antalya Müzesi', icon: '🏛️' },
          { id: 'tr-ant-7', name: 'Alanya Kalesi', icon: '🏰' },
          { id: 'tr-ant-8', name: 'Pamukkale', icon: '🌊' },
        ],
      },
      {
        id: 'tr-izmir',
        name: 'İzmir',
        attractions: [
          { id: 'tr-izm-1', name: 'Efes Antik Kenti', icon: '🏛️' },
          { id: 'tr-izm-2', name: 'Kordon', icon: '🌊' },
          { id: 'tr-izm-3', name: 'Kemeraltı Çarşısı', icon: '🛍️' },
          { id: 'tr-izm-4', name: 'Kadifekale', icon: '🏰' },
          { id: 'tr-izm-5', name: 'Saat Kulesi', icon: '⏰' },
          { id: 'tr-izm-6', name: 'Meryem Ana Evi (Selçuk)', icon: '⛪' },
          { id: 'tr-izm-7', name: 'Çeşme', icon: '🏖️' },
          { id: 'tr-izm-8', name: 'Alaçatı', icon: '🌬️' },
        ],
      },
      {
        id: 'tr-ankara',
        name: 'Ankara',
        attractions: [
          { id: 'tr-ank-1', name: 'Anıtkabir', icon: '🏛️' },
          { id: 'tr-ank-2', name: 'Ankara Kalesi', icon: '🏰' },
          { id: 'tr-ank-3', name: 'Anadolu Medeniyetleri Müzesi', icon: '🏛️' },
          { id: 'tr-ank-4', name: 'Kızılay Meydanı', icon: '🌆' },
          { id: 'tr-ank-5', name: 'Hamamönü', icon: '🏘️' },
        ],
      },
    ],
  },
  {
    code: 'FR',
    name: 'Fransa',
    flag: '🇫🇷',
    cities: [
      {
        id: 'fr-paris',
        name: 'Paris',
        attractions: [
          { id: 'fr-par-1', name: 'Eyfel Kulesi', icon: '🗼' },
          { id: 'fr-par-2', name: 'Louvre Müzesi', icon: '🏛️' },
          { id: 'fr-par-3', name: 'Notre-Dame Katedrali', icon: '⛪' },
          { id: 'fr-par-4', name: 'Champs-Élysées', icon: '🛍️' },
          { id: 'fr-par-5', name: 'Montmartre & Sacré-Cœur', icon: '⛪' },
          { id: 'fr-par-6', name: "Musée d'Orsay", icon: '🎨' },
          { id: 'fr-par-7', name: 'Versailles Sarayı', icon: '🏰' },
          { id: 'fr-par-8', name: 'Seine Nehri Turu', icon: '⛵' },
          { id: 'fr-par-9', name: 'Arc de Triomphe', icon: '🏛️' },
          { id: 'fr-par-10', name: 'Pompidou Merkezi', icon: '🎨' },
        ],
      },
      {
        id: 'fr-nice',
        name: 'Nice',
        attractions: [
          { id: 'fr-nic-1', name: 'Promenade des Anglais', icon: '🌊' },
          { id: 'fr-nic-2', name: 'Vieux-Nice (Eski Şehir)', icon: '🏘️' },
          { id: 'fr-nic-3', name: 'Matisse Müzesi', icon: '🎨' },
          { id: 'fr-nic-4', name: 'Castle Hill', icon: '⛰️' },
          { id: 'fr-nic-5', name: 'Cours Saleya Pazarı', icon: '🛒' },
          { id: 'fr-nic-6', name: 'Monaco Turu', icon: '🎰' },
        ],
      },
      {
        id: 'fr-lyon',
        name: 'Lyon',
        attractions: [
          { id: 'fr-lyo-1', name: 'Vieux Lyon (Eski Şehir)', icon: '🏘️' },
          { id: 'fr-lyo-2', name: 'Fourvière Bazilikası', icon: '⛪' },
          { id: 'fr-lyo-3', name: 'Traboules', icon: '🚪' },
          { id: 'fr-lyo-4', name: 'Beaux-Arts Müzesi', icon: '🎨' },
          { id: 'fr-lyo-5', name: 'Croix-Rousse Semti', icon: '🌄' },
        ],
      },
    ],
  },
  {
    code: 'IT',
    name: 'İtalya',
    flag: '🇮🇹',
    cities: [
      {
        id: 'it-rome',
        name: 'Roma',
        attractions: [
          { id: 'it-rom-1', name: 'Kolezyum', icon: '🏟️' },
          { id: 'it-rom-2', name: 'Vatikan Müzesi & Sistine Şapeli', icon: '🎨' },
          { id: 'it-rom-3', name: 'Trevi Çeşmesi', icon: '⛲' },
          { id: 'it-rom-4', name: 'Pantheon', icon: '🏛️' },
          { id: 'it-rom-5', name: 'Forum Romanum', icon: '🏛️' },
          { id: 'it-rom-6', name: 'Piazza Navona', icon: '🏙️' },
          { id: 'it-rom-7', name: 'Borghese Galerisi', icon: '🎨' },
          { id: 'it-rom-8', name: 'Trastevere Semti', icon: '🌆' },
          { id: 'it-rom-9', name: "Sant'Angelo Kalesi", icon: '🏰' },
        ],
      },
      {
        id: 'it-venice',
        name: 'Venedik',
        attractions: [
          { id: 'it-ven-1', name: 'Gondola Turu', icon: '🚣' },
          { id: 'it-ven-2', name: 'San Marco Meydanı', icon: '🏛️' },
          { id: 'it-ven-3', name: "Doge'nin Sarayı", icon: '🏰' },
          { id: 'it-ven-4', name: 'Rialto Köprüsü', icon: '🌉' },
          { id: 'it-ven-5', name: 'Murano Adası', icon: '🏝️' },
          { id: 'it-ven-6', name: 'Burano Adası', icon: '🌈' },
          { id: 'it-ven-7', name: 'Peggy Guggenheim Koleksiyonu', icon: '🎨' },
        ],
      },
      {
        id: 'it-florence',
        name: 'Floransa',
        attractions: [
          { id: 'it-flo-1', name: 'Uffizi Galerisi', icon: '🎨' },
          { id: 'it-flo-2', name: 'Duomo (Santa Maria del Fiore)', icon: '⛪' },
          { id: 'it-flo-3', name: "Michelangelo'nun David Heykeli", icon: '🗿' },
          { id: 'it-flo-4', name: 'Ponte Vecchio', icon: '🌉' },
          { id: 'it-flo-5', name: 'Pitti Sarayı', icon: '🏰' },
          { id: 'it-flo-6', name: 'Piazzale Michelangelo', icon: '🌄' },
          { id: 'it-flo-7', name: 'Boboli Bahçeleri', icon: '🌳' },
        ],
      },
      {
        id: 'it-milan',
        name: 'Milano',
        attractions: [
          { id: 'it-mil-1', name: 'Duomo di Milano', icon: '⛪' },
          { id: 'it-mil-2', name: "Son Akşam Yemeği (Santa Maria delle Grazie)", icon: '🎨' },
          { id: 'it-mil-3', name: 'Galleria Vittorio Emanuele II', icon: '🛍️' },
          { id: 'it-mil-4', name: 'Sforzesco Kalesi', icon: '🏰' },
          { id: 'it-mil-5', name: 'Brera Sanat Galerisi', icon: '🎨' },
          { id: 'it-mil-6', name: 'Navigli Kanalları', icon: '🌊' },
        ],
      },
    ],
  },
  {
    code: 'ES',
    name: 'İspanya',
    flag: '🇪🇸',
    cities: [
      {
        id: 'es-barcelona',
        name: 'Barselona',
        attractions: [
          { id: 'es-bar-1', name: 'Sagrada Família', icon: '⛪' },
          { id: 'es-bar-2', name: 'Park Güell', icon: '🌳' },
          { id: 'es-bar-3', name: 'La Rambla', icon: '🚶' },
          { id: 'es-bar-4', name: 'Casa Batlló', icon: '🏛️' },
          { id: 'es-bar-5', name: 'Barselona Katedrali', icon: '⛪' },
          { id: 'es-bar-6', name: 'Camp Nou', icon: '⚽' },
          { id: 'es-bar-7', name: 'El Born Semti', icon: '🌆' },
          { id: 'es-bar-8', name: 'Barceloneta Plajı', icon: '🏖️' },
        ],
      },
      {
        id: 'es-madrid',
        name: 'Madrid',
        attractions: [
          { id: 'es-mad-1', name: 'Prado Müzesi', icon: '🎨' },
          { id: 'es-mad-2', name: 'Santiago Bernabeu', icon: '⚽' },
          { id: 'es-mad-3', name: 'Retiro Parkı', icon: '🌳' },
          { id: 'es-mad-4', name: 'Kraliyet Sarayı', icon: '🏰' },
          { id: 'es-mad-5', name: 'Gran Vía', icon: '🛍️' },
          { id: 'es-mad-6', name: 'Thyssen-Bornemisza Müzesi', icon: '🎨' },
          { id: 'es-mad-7', name: 'Plaza Mayor', icon: '🏙️' },
        ],
      },
      {
        id: 'es-seville',
        name: 'Sevilla',
        attractions: [
          { id: 'es-sev-1', name: 'Sevilla Katedrali & Giralda', icon: '⛪' },
          { id: 'es-sev-2', name: 'Alcázar Sarayı', icon: '🏰' },
          { id: 'es-sev-3', name: 'Plaza de España', icon: '🏛️' },
          { id: 'es-sev-4', name: 'Barrio de Santa Cruz', icon: '🌆' },
          { id: 'es-sev-5', name: 'Metropol Parasol', icon: '🌂' },
        ],
      },
      {
        id: 'es-granada',
        name: 'Granada',
        attractions: [
          { id: 'es-gra-1', name: 'Elhamra Sarayı', icon: '🏰' },
          { id: 'es-gra-2', name: 'Generalife Bahçeleri', icon: '🌳' },
          { id: 'es-gra-3', name: 'Albaicín Semti', icon: '🌆' },
          { id: 'es-gra-4', name: 'Granada Katedrali', icon: '⛪' },
          { id: 'es-gra-5', name: 'Sierra Nevada', icon: '🏔️' },
        ],
      },
    ],
  },
  {
    code: 'JP',
    name: 'Japonya',
    flag: '🇯🇵',
    cities: [
      {
        id: 'jp-tokyo',
        name: 'Tokyo',
        attractions: [
          { id: 'jp-tok-1', name: 'Senso-ji Tapınağı', icon: '⛩️' },
          { id: 'jp-tok-2', name: 'Shibuya Geçidi', icon: '🚶' },
          { id: 'jp-tok-3', name: 'Tokyo Kulesi', icon: '🗼' },
          { id: 'jp-tok-4', name: 'Shinjuku Gyoen Parkı', icon: '🌸' },
          { id: 'jp-tok-5', name: 'Akihabara', icon: '🎮' },
          { id: 'jp-tok-6', name: 'Harajuku', icon: '👘' },
          { id: 'jp-tok-7', name: 'Meiji Tapınağı', icon: '⛩️' },
          { id: 'jp-tok-8', name: 'Tsukiji Balık Pazarı', icon: '🐟' },
          { id: 'jp-tok-9', name: 'Odaiba', icon: '🌃' },
        ],
      },
      {
        id: 'jp-kyoto',
        name: 'Kyoto',
        attractions: [
          { id: 'jp-kyo-1', name: 'Fushimi Inari Tapınağı', icon: '⛩️' },
          { id: 'jp-kyo-2', name: 'Altın Köşk (Kinkaku-ji)', icon: '🏯' },
          { id: 'jp-kyo-3', name: 'Arashiyama Bambu Ormanı', icon: '🎋' },
          { id: 'jp-kyo-4', name: 'Gion Semti', icon: '👘' },
          { id: 'jp-kyo-5', name: 'Nishiki Pazarı', icon: '🛒' },
          { id: 'jp-kyo-6', name: 'Ryoan-ji Kaya Bahçesi', icon: '🪨' },
          { id: 'jp-kyo-7', name: "Philosopher's Path", icon: '🌸' },
          { id: 'jp-kyo-8', name: 'Kiyomizu-dera Tapınağı', icon: '⛩️' },
        ],
      },
      {
        id: 'jp-osaka',
        name: 'Osaka',
        attractions: [
          { id: 'jp-osa-1', name: 'Osaka Kalesi', icon: '🏯' },
          { id: 'jp-osa-2', name: 'Dotonbori', icon: '🌃' },
          { id: 'jp-osa-3', name: 'Universal Studios Japan', icon: '🎢' },
          { id: 'jp-osa-4', name: 'Shinsekai', icon: '🌆' },
          { id: 'jp-osa-5', name: 'Namba', icon: '🛍️' },
          { id: 'jp-osa-6', name: 'Kuromon Pazarı', icon: '🛒' },
        ],
      },
      {
        id: 'jp-hiroshima',
        name: 'Hiroshima',
        attractions: [
          { id: 'jp-hir-1', name: 'Barış Anıtı Müzesi', icon: '🕊️' },
          { id: 'jp-hir-2', name: 'Atom Bombası Kubbesi', icon: '🏛️' },
          { id: 'jp-hir-3', name: 'Miyajima Adası & Itsukushima', icon: '⛩️' },
          { id: 'jp-hir-4', name: 'Şamandıra Torii Kapısı', icon: '⛩️' },
        ],
      },
    ],
  },
  {
    code: 'GB',
    name: 'İngiltere',
    flag: '🇬🇧',
    cities: [
      {
        id: 'gb-london',
        name: 'Londra',
        attractions: [
          { id: 'gb-lon-1', name: 'Big Ben & Westminster', icon: '🕰️' },
          { id: 'gb-lon-2', name: 'Britanya Müzesi', icon: '🏛️' },
          { id: 'gb-lon-3', name: 'Tower of London', icon: '🏰' },
          { id: 'gb-lon-4', name: 'Buckingham Sarayı', icon: '🏰' },
          { id: 'gb-lon-5', name: 'London Eye', icon: '🎡' },
          { id: 'gb-lon-6', name: 'Tate Modern', icon: '🎨' },
          { id: 'gb-lon-7', name: 'Oxford Street', icon: '🛍️' },
          { id: 'gb-lon-8', name: 'Hyde Park', icon: '🌳' },
          { id: 'gb-lon-9', name: 'Tower Bridge', icon: '🌉' },
          { id: 'gb-lon-10', name: 'Camden Market', icon: '🛍️' },
        ],
      },
      {
        id: 'gb-edinburgh',
        name: 'Edinburgh',
        attractions: [
          { id: 'gb-edi-1', name: 'Edinburgh Kalesi', icon: '🏰' },
          { id: 'gb-edi-2', name: 'Royal Mile', icon: '🚶' },
          { id: 'gb-edi-3', name: "Arthur's Seat", icon: '⛰️' },
          { id: 'gb-edi-4', name: 'Scottish National Museum', icon: '🏛️' },
          { id: 'gb-edi-5', name: 'Holyrood Sarayı', icon: '🏰' },
          { id: 'gb-edi-6', name: 'Scotch Whisky Deneyimi', icon: '🥃' },
        ],
      },
      {
        id: 'gb-bath',
        name: 'Bath',
        attractions: [
          { id: 'gb-bat-1', name: 'Roma Hamamları', icon: '🏛️' },
          { id: 'gb-bat-2', name: 'Bath Katedrali', icon: '⛪' },
          { id: 'gb-bat-3', name: 'Royal Crescent', icon: '🏘️' },
          { id: 'gb-bat-4', name: 'Thermae Bath Spa', icon: '♨️' },
        ],
      },
    ],
  },
  {
    code: 'US',
    name: 'ABD',
    flag: '🇺🇸',
    cities: [
      {
        id: 'us-newyork',
        name: 'New York',
        attractions: [
          { id: 'us-ny-1', name: 'Özgürlük Heykeli', icon: '🗽' },
          { id: 'us-ny-2', name: 'Central Park', icon: '🌳' },
          { id: 'us-ny-3', name: 'Times Square', icon: '🌃' },
          { id: 'us-ny-4', name: 'Empire State Binası', icon: '🏙️' },
          { id: 'us-ny-5', name: 'Metropolitan Müzesi (MET)', icon: '🎨' },
          { id: 'us-ny-6', name: 'Brooklyn Köprüsü', icon: '🌉' },
          { id: 'us-ny-7', name: '9/11 Anıtı', icon: '🕊️' },
          { id: 'us-ny-8', name: 'MoMA', icon: '🎨' },
          { id: 'us-ny-9', name: 'High Line', icon: '🌱' },
        ],
      },
      {
        id: 'us-sf',
        name: 'San Francisco',
        attractions: [
          { id: 'us-sf-1', name: 'Golden Gate Köprüsü', icon: '🌉' },
          { id: 'us-sf-2', name: 'Alcatraz Adası', icon: '🏝️' },
          { id: 'us-sf-3', name: "Fisherman's Wharf", icon: '🦀' },
          { id: 'us-sf-4', name: 'Chinatown', icon: '🏮' },
          { id: 'us-sf-5', name: 'Twin Peaks', icon: '⛰️' },
          { id: 'us-sf-6', name: 'Lombard Street', icon: '🌹' },
        ],
      },
      {
        id: 'us-lasvegas',
        name: 'Las Vegas',
        attractions: [
          { id: 'us-lv-1', name: 'The Strip', icon: '🎰' },
          { id: 'us-lv-2', name: 'Bellagio Çeşmesi', icon: '⛲' },
          { id: 'us-lv-3', name: 'Fremont Street', icon: '💡' },
          { id: 'us-lv-4', name: 'Grand Canyon Turu', icon: '🏜️' },
          { id: 'us-lv-5', name: 'The High Roller', icon: '🎡' },
        ],
      },
      {
        id: 'us-chicago',
        name: 'Chicago',
        attractions: [
          { id: 'us-chi-1', name: 'Cloud Gate (The Bean)', icon: '🫘' },
          { id: 'us-chi-2', name: 'Art Institute of Chicago', icon: '🎨' },
          { id: 'us-chi-3', name: 'Navy Pier', icon: '🎡' },
          { id: 'us-chi-4', name: 'Willis Tower (Skydeck)', icon: '🏙️' },
          { id: 'us-chi-5', name: 'Millennium Park', icon: '🌳' },
        ],
      },
    ],
  },
  {
    code: 'GR',
    name: 'Yunanistan',
    flag: '🇬🇷',
    cities: [
      {
        id: 'gr-athens',
        name: 'Atina',
        attractions: [
          { id: 'gr-ath-1', name: 'Akropolis & Parthenon', icon: '🏛️' },
          { id: 'gr-ath-2', name: 'Akropolis Müzesi', icon: '🏛️' },
          { id: 'gr-ath-3', name: 'Ulusal Arkeoloji Müzesi', icon: '🏛️' },
          { id: 'gr-ath-4', name: 'Plaka Semti', icon: '🌆' },
          { id: 'gr-ath-5', name: 'Likavitos Tepesi', icon: '⛰️' },
          { id: 'gr-ath-6', name: 'Monastiraki Pazarı', icon: '🛍️' },
        ],
      },
      {
        id: 'gr-santorini',
        name: 'Santorini',
        attractions: [
          { id: 'gr-san-1', name: 'Oia Gün Batımı', icon: '🌅' },
          { id: 'gr-san-2', name: 'Fira', icon: '🌇' },
          { id: 'gr-san-3', name: 'Kırmızı Plaj', icon: '🏖️' },
          { id: 'gr-san-4', name: 'Akrotiri Arkeolojik Alanı', icon: '🏛️' },
          { id: 'gr-san-5', name: 'İmerovigli', icon: '🌊' },
          { id: 'gr-san-6', name: 'Katamaran Turu', icon: '⛵' },
        ],
      },
      {
        id: 'gr-mykonos',
        name: 'Mikonos',
        attractions: [
          { id: 'gr-myk-1', name: 'Rüzgar Değirmenleri', icon: '⚙️' },
          { id: 'gr-myk-2', name: 'Little Venice', icon: '🌊' },
          { id: 'gr-myk-3', name: 'Hora (Chora)', icon: '🌆' },
          { id: 'gr-myk-4', name: 'Paradise Beach', icon: '🏖️' },
        ],
      },
    ],
  },
  {
    code: 'DE',
    name: 'Almanya',
    flag: '🇩🇪',
    cities: [
      {
        id: 'de-berlin',
        name: 'Berlin',
        attractions: [
          { id: 'de-ber-1', name: 'Brandenburg Kapısı', icon: '🏛️' },
          { id: 'de-ber-2', name: 'Berlin Duvarı Anıtı', icon: '🧱' },
          { id: 'de-ber-3', name: 'Reichstag Binası', icon: '🏛️' },
          { id: 'de-ber-4', name: 'Pergamon Müzesi', icon: '🏛️' },
          { id: 'de-ber-5', name: 'Checkpoint Charlie', icon: '🪖' },
          { id: 'de-ber-6', name: 'East Side Gallery', icon: '🎨' },
          { id: 'de-ber-7', name: 'Tiergarten', icon: '🌳' },
        ],
      },
      {
        id: 'de-munich',
        name: 'Münih',
        attractions: [
          { id: 'de-mun-1', name: 'Marienplatz & Belediye Binası', icon: '🏛️' },
          { id: 'de-mun-2', name: 'Deutsches Museum', icon: '🔬' },
          { id: 'de-mun-3', name: 'Nymphenburg Sarayı', icon: '🏰' },
          { id: 'de-mun-4', name: 'Englischer Garten', icon: '🌳' },
          { id: 'de-mun-5', name: 'Oktoberfest Alanı', icon: '🍺' },
          { id: 'de-mun-6', name: 'BMW Müzesi', icon: '🚗' },
          { id: 'de-mun-7', name: 'Neuschwanstein Kalesi Turu', icon: '🏰' },
        ],
      },
    ],
  },
  {
    code: 'NL',
    name: 'Hollanda',
    flag: '🇳🇱',
    cities: [
      {
        id: 'nl-amsterdam',
        name: 'Amsterdam',
        attractions: [
          { id: 'nl-ams-1', name: 'Rijksmuseum', icon: '🎨' },
          { id: 'nl-ams-2', name: 'Anne Frank Evi', icon: '🏠' },
          { id: 'nl-ams-3', name: 'Van Gogh Müzesi', icon: '🎨' },
          { id: 'nl-ams-4', name: 'Kanal Turu', icon: '⛵' },
          { id: 'nl-ams-5', name: 'Jordaan Semti', icon: '🌷' },
          { id: 'nl-ams-6', name: 'Vondelpark', icon: '🌳' },
          { id: 'nl-ams-7', name: 'Keukenhof Lale Bahçeleri', icon: '🌷' },
        ],
      },
    ],
  },
  {
    code: 'PT',
    name: 'Portekiz',
    flag: '🇵🇹',
    cities: [
      {
        id: 'pt-lisbon',
        name: 'Lizbon',
        attractions: [
          { id: 'pt-lis-1', name: 'Belém Kulesi', icon: '🗼' },
          { id: 'pt-lis-2', name: 'Jerónimos Manastırı', icon: '⛪' },
          { id: 'pt-lis-3', name: 'Alfama Semti', icon: '🌆' },
          { id: 'pt-lis-4', name: 'Tram 28', icon: '🚃' },
          { id: 'pt-lis-5', name: 'LX Factory', icon: '🏭' },
          { id: 'pt-lis-6', name: 'Sintra', icon: '🏰' },
          { id: 'pt-lis-7', name: 'São Jorge Kalesi', icon: '🏰' },
        ],
      },
      {
        id: 'pt-porto',
        name: 'Porto',
        attractions: [
          { id: 'pt-por-1', name: 'Dom Luís Köprüsü', icon: '🌉' },
          { id: 'pt-por-2', name: 'Ribeira Semti', icon: '🌆' },
          { id: 'pt-por-3', name: 'Livraria Lello (Kitabevi)', icon: '📚' },
          { id: 'pt-por-4', name: 'Porto Şarap Mahzenleri', icon: '🍷' },
          { id: 'pt-por-5', name: 'Clérigos Kulesi', icon: '⛪' },
        ],
      },
    ],
  },
  {
    code: 'AE',
    name: 'BAE',
    flag: '🇦🇪',
    cities: [
      {
        id: 'ae-dubai',
        name: 'Dubai',
        attractions: [
          { id: 'ae-dub-1', name: 'Burj Khalifa', icon: '🏙️' },
          { id: 'ae-dub-2', name: 'Dubai Mall & Çeşme', icon: '🛍️' },
          { id: 'ae-dub-3', name: 'Palm Jumeirah', icon: '🏝️' },
          { id: 'ae-dub-4', name: 'Çöl Safarisi', icon: '🏜️' },
          { id: 'ae-dub-5', name: 'Burj Al Arab', icon: '⛵' },
          { id: 'ae-dub-6', name: 'Dubai Frame', icon: '🖼️' },
          { id: 'ae-dub-7', name: 'Deira Altın Çarşısı', icon: '🥇' },
          { id: 'ae-dub-8', name: 'Museum of the Future', icon: '🔮' },
        ],
      },
      {
        id: 'ae-abudhabi',
        name: 'Abu Dabi',
        attractions: [
          { id: 'ae-abd-1', name: 'Sheikh Zayed Büyük Camii', icon: '🕌' },
          { id: 'ae-abd-2', name: 'Louvre Abu Dabi', icon: '🏛️' },
          { id: 'ae-abd-3', name: 'Ferrari World', icon: '🏎️' },
          { id: 'ae-abd-4', name: 'Yas Marina Devresi', icon: '🏁' },
          { id: 'ae-abd-5', name: 'Saadiyat Adası', icon: '🏝️' },
        ],
      },
    ],
  },
  {
    code: 'TH',
    name: 'Tayland',
    flag: '🇹🇭',
    cities: [
      {
        id: 'th-bangkok',
        name: 'Bangkok',
        attractions: [
          { id: 'th-bkk-1', name: 'Büyük Saray & Zümrüt Buda', icon: '🏯' },
          { id: 'th-bkk-2', name: 'Wat Pho (Uzanan Buda)', icon: '🛕' },
          { id: 'th-bkk-3', name: 'Khao San Road', icon: '🌃' },
          { id: 'th-bkk-4', name: 'Chatuchak Pazarı', icon: '🛒' },
          { id: 'th-bkk-5', name: 'Chao Phraya Tekne Turu', icon: '⛵' },
          { id: 'th-bkk-6', name: 'Chinatown (Yaowarat)', icon: '🏮' },
          { id: 'th-bkk-7', name: 'Asiatique', icon: '🌆' },
        ],
      },
      {
        id: 'th-chiangmai',
        name: 'Chiang Mai',
        attractions: [
          { id: 'th-cnx-1', name: 'Doi Suthep Tapınağı', icon: '🛕' },
          { id: 'th-cnx-2', name: 'Eski Şehir (Old City)', icon: '🏘️' },
          { id: 'th-cnx-3', name: 'Fil Kampı', icon: '🐘' },
          { id: 'th-cnx-4', name: 'Gece Pazarı', icon: '🌙' },
          { id: 'th-cnx-5', name: 'Doi Inthanon Milli Parkı', icon: '🌿' },
        ],
      },
      {
        id: 'th-phuket',
        name: 'Phuket',
        attractions: [
          { id: 'th-hkt-1', name: 'Patong Plajı', icon: '🏖️' },
          { id: 'th-hkt-2', name: 'Büyük Buda Heykeli', icon: '🛕' },
          { id: 'th-hkt-3', name: 'Phi Phi Adaları', icon: '🏝️' },
          { id: 'th-hkt-4', name: 'Phang Nga Körfezi', icon: '⛵' },
          { id: 'th-hkt-5', name: 'Rawai Plajı', icon: '🏖️' },
        ],
      },
    ],
  },
];

// ─── Helper functions ────────────────────────────────────
export function totalAttractions() {
  return WORLD_DATA.reduce(
    (sum, c) => sum + c.cities.reduce((s, city) => s + city.attractions.length, 0),
    0
  );
}

export function countryAttractionCount(country) {
  return country.cities.reduce((s, city) => s + city.attractions.length, 0);
}

export function countryVisitedCount(country, visited) {
  return country.cities.reduce(
    (s, city) => s + city.attractions.filter((a) => visited[a.id]).length,
    0
  );
}

export function cityVisitedCount(city, visited) {
  return city.attractions.filter((a) => visited[a.id]).length;
}

export function pct(visited, total) {
  if (!total) return 0;
  return Math.round((visited / total) * 100);
}
