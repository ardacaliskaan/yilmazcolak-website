// scripts/migrateTeamData.js - Mevcut team data'yı MongoDB'ye aktar
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yilmazcolak-hukuk';

// TeamMember Schema (models/TeamMember.js ile aynı)
const educationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  year: String,
  description: String
});

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim zorunludur'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Ünvan zorunludur'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  image: {
    type: String,
    default: null
  },
  position: {
    type: String,
    enum: ['founding-partner', 'managing-partner', 'lawyer', 'trainee-lawyer', 'legal-assistant'],
    required: true
  },
  bio: {
    type: String,
    trim: true
  },
  birthYear: Number,
  birthPlace: String,
  specializations: [String],
  education: [educationSchema],
  certificates: [String],
  languages: [String],
  barAssociation: String,
  masterThesis: String,
  specialFocus: String,
  internshipLocation: String, // Stajyerler için
  isActive: {
    type: Boolean,
    default: true
  },
  featuredOnHomepage: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema);

// Mevcut team data'nız (data/teamData.js'den)
const existingTeamData = [
  {
    id: 1,
    name: "Av. Yusuf ÇOLAK",
    title: "Kurucu Ortak & Avukat",
    slug: "yusuf-colak",
    image: "/images/team/yusuf-colak.jpg",
    position: "founding-partner",
    birthYear: 1991,
    birthPlace: "Erzurum",
    specializations: [
      "Aile Hukuku",
      "İş Hukuku", 
      "İdare Hukuku",
      "Ceza Hukuku",
      "İnfaz Hukuku",
      "KVKK Hukuku",
      "Sigorta Hukuku",
      "İcra Hukuku"
    ],
    education: [
      {
        degree: "Lisans",
        institution: "Polis Akademisi - Güvenlik Bilimleri Fakültesi",
        year: "2010-2014"
      },
      {
        degree: "Lisans", 
        institution: "Ondokuz Mayıs Üniversitesi Hukuk Fakültesi",
        year: "2016-2019"
      },
      {
        degree: "Ön Lisans",
        institution: "Atatürk Üniversitesi - İş Sağlığı ve Güvenliği", 
        year: "2018-2020"
      },
      {
        degree: "Yüksek Lisans",
        institution: "Karabük Üniversitesi - Uluslararası İlişkiler",
        year: "2021-2023"
      }
    ],
    masterThesis: "Avrupa İnsan Hakları Sözleşmesi",
    barAssociation: "Karabük Barosu",
    languages: ["Türkçe", "İngilizce (İyi Derece)"],
    specialFocus: "Sağlık hizmeti sunucularına hukuki danışmanlık",
    certificates: [
      "Şüpheli Kişi ve Araç Durdurma, Arama, Güvenli Müdahale Eğiticilerinin Eğitimi Kursu",
      "Polisin Görev, Yetki ve Sorumluluklarıyla İlgili Mevzuat Değişiklikleri Eğitici Yetiştirme Semineri",
      "Yargıtay Kararları Işığında Sağlık Hukuku Sertifika Programı",
      "CMK Uygulamaları Online Eğitim Programı",
      "Tüketici Hukuku Eğitim Semineri",
      "Hukuk Uyuşmazlıklarında Arabuluculuk Temel Eğitimi",
      "Mülteci Hukuku Eğitimi"
    ],
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 1
  },
  {
    id: 2,
    name: "Av. Samet YILMAZ",
    title: "Kurucu Ortak & Avukat", 
    slug: "samet-yilmaz",
    image: "/images/team/samet-yilmaz.jpg",
    position: "founding-partner",
    birthYear: 1993,
    birthPlace: "Karabük",
    specializations: [
      "Boşanma Davaları",
      "Tazminat Davaları", 
      "Alacak Davaları",
      "Tapu İptali ve Tescil Davaları",
      "İtirazın İptali Davaları",
      "Kamulaştırma Davaları",
      "İşçilik Davaları",
      "Menfi Tespit Davaları",
      "Ortaklığın Giderilmesi Davaları"
    ],
    education: [
      {
        degree: "Lise",
        institution: "Darüşşafaka Lisesi",
        year: ""
      },
      {
        degree: "Lise",
        institution: "Karabük Cumhuriyet Anadolu Lisesi", 
        year: ""
      },
      {
        degree: "Lisans",
        institution: "Uluslararası Kıbrıs Üniversitesi Hukuk Fakültesi",
        year: ""
      },
      {
        degree: "Yüksek Lisans (Devam Ediyor)",
        institution: "Karabük Üniversitesi - Hukuk Etiği",
        year: "2024-"
      }
    ],
    barAssociation: "Karabük Barosu",
    barRegistrationYear: 2020,
    internshipLocation: "Karabük",
    languages: ["Türkçe"],
    specialFocus: "Özel Hukuk alanındaki davalar",
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 2
  },
  {
    id: 3,
    name: "Av. Mustafa KESER",
    title: "Ortak & Avukat",
    slug: "mustafa-keser", 
    image: "/images/team/mustafa-keser.jpg",
    position: "managing-partner",
    birthYear: 1980,
    birthPlace: "Karabük",
    specializations: [
      "Aile Hukuku",
      "Gayrimenkul Hukuku",
      "İcra Hukuku", 
      "Miras Hukuku",
      "Ticaret Hukuku",
      "Tüketici Hukuku"
    ],
    education: [
      {
        degree: "Lisans",
        institution: "Selçuk Üniversitesi Hukuk Fakültesi",
        year: "2003"
      }
    ],
    careerHistory: [
      "İcra Müdürlüğü - Adana",
      "İcra Müdürlüğü - Iğdır", 
      "Hakim Adayı - Ankara",
      "Hakimlik - Kahramanmaraş",
      "Hakimlik - Tokat",
      "Hakimlik - Giresun",
      "Hakimlik - Şanlıurfa",
      "Yargıtay Tetkik Hakimliği"
    ],
    barAssociation: "Karabük Barosu",
    languages: ["Türkçe"],
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 3
  },
  {
    id: 4,
    name: "Av. Ümithan KAPLAN", 
    title: "Ortak & Avukat",
    slug: "umithan-kaplan",
    image: "/images/team/umithan-kaplan.jpg",
    position: "managing-partner",
    specializations: [
      "Ceza Davaları",
      "Hukuk Davaları",
      "İş Davaları",
      "Boşanma Davaları", 
      "Tazminat Davaları"
    ],
    barAssociation: "Karabük Barosu",
    languages: ["Türkçe"],
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 4
  },
  {
    id: 5,
    name: "Av. Gülşah MASATCI ERSÖZ",
    title: "Avukat",
    slug: "gulsah-masatci-ersoz",
    image: "/images/team/gulsah-masatci.jpg",
    position: "lawyer", 
    birthYear: 1991,
    birthPlace: "Zonguldak",
    specializations: [
      "İş Hukuku",
      "Ceza Hukuku",
      "İdare Hukuku",
      "Sigorta Hukuku",
      "İcra Hukuku",
      "Tazminat Hukuku"
    ],
    education: [
      {
        degree: "Lisans", 
        institution: "Eskişehir Anadolu Üniversitesi Hukuk Fakültesi",
        year: "2014"
      }
    ],
    barAssociation: "Karabük Barosu",
    previousBarAssociation: "Kastamonu Barosu",
    barRegistrationYear: 2024,
    internshipYear: "2014-2016",
    internshipLocation: "Kastamonu Barosu",
    languages: ["Türkçe"],
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 5
  },
  {
    id: 6,
    name: "Av. Beyza Nur TOPAL GİZLENCİ",
    title: "Avukat",
    slug: "beyza-nur-topal-gizlenci", 
    image: "/images/team/beyza-nur-topal.jpg",
    position: "lawyer",
    birthYear: 1998,
    birthPlace: "Antalya",
    specializations: [
      "Ceza Hukuku",
      "İdare Hukuku", 
      "Anayasa Mahkemesi Başvuruları",
      "AİHM Bireysel Başvuru"
    ],
    education: [
      {
        degree: "Lisans",
        institution: "Erciyes Üniversitesi Hukuk Fakültesi",
        year: "2020"
      },
      {
        degree: "Yüksek Lisans",
        institution: "Erciyes Üniversitesi Kamu Hukuku",
        year: "2023"
      },
      {
        degree: "Doktora (Devam Ediyor)",
        institution: "Süleyman Demirel Üniversitesi Kamu Hukuku",
        year: "2023-"
      }
    ],
    masterThesis: "Ceza Muhakemesinde Belirti",
    publishedBook: "Ceza Muhakemesinde Belirti - Adalet Yayınevi",
    barAssociation: "Karabük Barosu", 
    internshipYear: "2021",
    internshipLocation: "Antalya",
    languages: ["Türkçe"],
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 6
  },
  {
    id: 7,
    name: "Av. Asude GÖKÇE",
    title: "Avukat",
    slug: "asude-gokce",
    image: "/images/team/asude-gokce.jpg",
    position: "lawyer",
    birthYear: 1999,
    birthPlace: "Karabük", 
    specializations: [
      "Ceza Hukuku"
    ],
    education: [
      {
        degree: "Lise",
        institution: "Karabük Anadolu Öğretmen Lisesi",
        year: ""
      },
      {
        degree: "Lisans",
        institution: "Erzincan Binali Yıldırım Üniversitesi Hukuk Fakültesi",
        year: "2022"
      }
    ],
    barAssociation: "Karabük Barosu",
    internshipYear: "2022-2024",
    internshipLocation: "Karabük Barosu",
    barRegistrationYear: 2024,
    certificates: [
      "Avrupa İnsan Hakları Sözleşmesi ve Avrupa İnsan Hakları Mahkemesine Giriş - HELP Programı"
    ],
    languages: ["Türkçe", "İngilizce (İyi Derece)"],
    specialRole: "Ceza Avukatı",
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 7
  },
  {
    id: 8,
    name: "Av. Hatice Berna TURHAN", 
    title: "Avukat",
    slug: "hatice-berna-turhan",
    image: "/images/team/berna-turhan.jpg",
    position: "lawyer",
    birthYear: 1998,
    specializations: [
      "Ceza Hukuku",
      "Sigorta Hukuku",
      "İcra Hukuku",
      "Özel Hukuk"
    ],
    education: [
      {
        degree: "Lise",
        institution: "Safranbolu Özel Final Temel Lisesi",
        year: ""
      },
      {
        degree: "Lisans", 
        institution: "Lefke Avrupa Üniversitesi Hukuk Fakültesi",
        year: "2023"
      }
    ],
    universityActivities: [
      "Hukuk Kulübü - Hayvan Hakları Departmanı"
    ],
    barAssociation: "Karabük Barosu",
    internshipYear: "2023-2024",
    internshipLocation: "Karabük Barosu",
    barRegistrationYear: 2024,
    languages: ["Türkçe"],
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 8
  },
  {
    id: 9,
    name: "Av. Zeynep ÜRÜŞAN",
    title: "Avukat",
    slug: "zeynep-urusan",
    image: "/images/team/zeynep-urusan.jpg",
    position: "lawyer",
    specializations: [
      "Ceza Davaları",
      "Hukuk Davaları", 
      "İş Davaları",
      "Boşanma Davaları",
      "Tazminat Davaları"
    ],
    barAssociation: "Karabük Barosu",
    languages: ["Türkçe"],
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 9
  },
  {
    id: 10,
    name: "Stj. Av. Kürşat DEMİRELLİ",
    title: "Stajyer Avukat", 
    slug: "kursat-demirelli",
    image: "/images/team/kursat-demirelli.jpg",
    position: "trainee-lawyer",
    birthYear: 2001,
    birthPlace: "Karabük",
    specializations: [
      "İdare Hukuku",
      "Ceza Hukuku",
      "İcra Hukuku"
    ],
    education: [
      {
        degree: "Lise",
        institution: "15 Temmuz Şehitleri Lisesi",
        year: ""
      },
      {
        degree: "Lisans",
        institution: "Pamukkale Üniversitesi Hukuk Fakültesi", 
        year: "2023"
      }
    ],
    barAssociation: "Karabük Barosu",
    internshipLocation: "Yılmaz & Çolak Hukuk Bürosu",
    certificates: [
      "Uygulamada Gümrük Kaçakçılığı İleri Eğitim Programı - Türavak",
      "Spor Sözleşmelerinden Kaynaklanan Uyuşmazlıklar ve Çözüm Yolları - Türavak",
      "Bedensel Zararlara İlişkin Hesaplamalar - Aktüerya İleri Eğitim Programı - Türavak",
      "Kişisel Verileri Koruma Hukuku İleri Düzey Eğitim Programı - Türavak",
      "Sigorta Hukuku Uygulamaları İleri Eğitim Programı - Türavak", 
      "Sosyal Güvenlik Hukuku İleri Eğitim Programı - Türavak",
      "Patent Koruması ve Süreçleri İleri Eğitim Programı - Türavak"
    ],
    languages: ["Türkçe"],
    isActive: true,
    featuredOnHomepage: true,
    sortOrder: 10
  },
  {
    id: 11,
    name: "Neslihan TAKICAK",
    title: "Hukuk Asistanı",
    slug: "neslihan-takicak",
    image: "/images/team/neslihan-takicak.jpg",
    position: "legal-assistant",
    specializations: [
      "Hukuki Destek",
      "Dava Takibi",
      "Dokümantasyon"
    ],
    languages: ["Türkçe"],
    isActive: true, 
    featuredOnHomepage: true,
    sortOrder: 11
  }
];

async function migrateTeamData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut verileri kontrol et
    const existingCount = await TeamMember.countDocuments();
    if (existingCount > 0) {
      console.log(`❌ ${existingCount} ekip üyesi zaten mevcut. Migration atlanıyor.`);
      return;
    }

    // Team data'yı MongoDB'ye aktar
    for (const member of existingTeamData) {
      const { id, ...memberData } = member; // id field'ını çıkar
      await TeamMember.create(memberData);
      console.log(`✅ ${member.name} eklendi`);
    }

    console.log('🎉 Tüm ekip üyeleri başarıyla aktarıldı!');
    
    await mongoose.disconnect();
    console.log('✅ MongoDB bağlantısı kapatıldı');

  } catch (error) {
    console.error('❌ Migration hatası:', error.message);
    process.exit(1);
  }
}

migrateTeamData();