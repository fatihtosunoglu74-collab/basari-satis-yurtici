export interface Plasiyer {
  ad: string;
  telefon: string;
}

// Yurt İçi Satış ekibi - MAİL VE İMZA ÇALIŞMASI 01.07.2026 tarihli listeden
export const PLASIYERLER: Plasiyer[] = [
  // Bölge Yöneticileri
  { ad: "Recep Yılmaz", telefon: "905379527147" },
  { ad: "Mustafa Yazı", telefon: "905398408447" },
  { ad: "Orçun Alıcı", telefon: "905339466362" },
  { ad: "Serkan Kunt", telefon: "905320120541" },
  // Satış Temsilcileri
  { ad: "Alpaslan Değer", telefon: "905358142961" },
  { ad: "Serdar Parlakkan", telefon: "905393046296" },
  { ad: "Barbaros Kanadıkırık", telefon: "905358678150" },
  { ad: "Ömer Kınalı", telefon: "905360328006" },
  { ad: "Seçkin Ozan Akıllı", telefon: "905330619360" },
  { ad: "Eren Ateş", telefon: "905331316507" },
  { ad: "Sefa Akkan", telefon: "905331316477" },
  { ad: "Onur Selvi", telefon: "905358146069" },
  { ad: "Erbay Atlı", telefon: "905339466251" },
  { ad: "Engin Alaca", telefon: "905358678150" },
  { ad: "Mustafa Koçalı", telefon: "905330704018" },
  { ad: "Emirhan Timur", telefon: "905358677242" },
  { ad: "Onur Okumuş", telefon: "905339466793" },
  // Satış Destek
  { ad: "Uğur Yıldız", telefon: "905312879307" },
  { ad: "Ferhan Demir", telefon: "905454939955" },
  { ad: "Enes Aykut", telefon: "905354918809" },
  { ad: "Ahmet Bahtiyar", telefon: "905379527423" },
  { ad: "Tarık Palak", telefon: "905312879323" },
  // Merkez Satış
  { ad: "Cüneyt Baş", telefon: "905353788978" },
  { ad: "Ali Osman Demir", telefon: "905358143051" },
  { ad: "Eren Aykut", telefon: "905359744480" },
];

// Unicode combining char'ları temizler — "Engi̇n" → "Engin"
function temizle(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Bazı plasiyerlerin bildirimleri başka bir kişiye yönlendirilir
// (örn. yönetici rolündeki kişiler operasyonel WhatsApp bildirimi almak istemeyebilir)
const YONLENDIRME: Record<string, string> = {
  "Cüneyt Baş": "Tarık Palak",
};

// Bir plasiyer adının bildirimi fiilen kime gideceğini döner (yönlendirme varsa onu, yoksa kendisini)
export function bildirimAlacakKisi(ad: string): string {
  const temizAd = temizle(ad).toLowerCase();
  const eslesen = Object.entries(YONLENDIRME).find(([k]) => temizle(k).toLowerCase() === temizAd);
  return eslesen ? eslesen[1] : ad;
}

export function telefonBul(ad: string): string | null {
  if (!ad) return null;
  const aranan = temizle(ad);
  const aranamLower = aranan.toLowerCase();

  // 1. Tam eşleşme (combining char temizlenmiş)
  const tam = PLASIYERLER.find((p) => temizle(p.ad) === aranan);
  if (tam) return tam.telefon;

  // 2. Büyük/küçük harf farkı
  const kucuk = PLASIYERLER.find((p) => temizle(p.ad).toLowerCase() === aranamLower);
  if (kucuk) return kucuk.telefon;

  // 3. İlk kelime eşleşmesi
  const ilkKelime = aranamLower.split(" ")[0];
  const partial = PLASIYERLER.find((p) => temizle(p.ad).toLowerCase().startsWith(ilkKelime));
  if (partial) return partial.telefon;

  return null;
}

export function whatsappUrl(telefon: string, mesaj: string): string {
  return `https://wa.me/${telefon}?text=${encodeURIComponent(mesaj)}`;
}
