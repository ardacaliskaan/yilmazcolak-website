'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Ultra Modern Professional Color Palette
const modernColors = {
  midnight: "from-slate-900 via-gray-900 to-black",
  obsidian: "from-gray-900 via-slate-800 to-zinc-900", 
  charcoal: "from-zinc-800 via-gray-800 to-stone-900",
  navy: "from-blue-900 via-slate-900 to-gray-900",
  forest: "from-green-900 via-emerald-900 to-slate-900",
  crimson: "from-red-900 via-rose-900 to-gray-900",
  bronze: "from-amber-900 via-orange-900 to-stone-900",
  plum: "from-purple-900 via-indigo-900 to-slate-900",
  steel: "from-slate-700 via-zinc-800 to-gray-900",
  sapphire: "from-blue-800 via-indigo-900 to-slate-900",
  emerald: "from-emerald-800 via-teal-900 to-gray-900"
};

// Practice Areas Data with Modern Structure
const practiceAreasData = [
  {
    id: 1,
    name: "Aile Hukuku",
    slug: "aile-hukuku",
    shortDescription: "Ailenizin geleceğini güvence altına alın",
    description: "Boşanma, nafaka, velayet, mal paylaşımı ve evlilik süreçlerinde deneyimli kadromuzla yanınızdayız. Hassas konularda uzman yaklaşım ve güvenilir çözümler sunuyoruz.",
    longDescription: "Aile hukuku alanında 15 yılı aşkın deneyimimizle, müvekkillerimizin en hassas dönemlerinde yanlarında yer alıyoruz. Boşanma süreçlerinde hem duygusal hem de hukuki desteği bir arada sunarak, en az hasarla süreci tamamlamanızı sağlıyoruz.\n\nVelayet konularında çocukların menfaatini ön planda tutarak, aile içi dengeleri koruyacak çözümler üretiyoruz. Nafaka hesaplamalarında güncel yasal düzenlemeleri takip ederek, hakkınız olan tutarı tam olarak almanızı sağlıyoruz.\n\nMal paylaşımı süreçlerinde adil bir dağılım için detaylı analiz yapıyor, gayrimenkul değerlendirmelerinden finansal varlıklara kadar tüm unsurları titizlikle inceliyoruz.",
    icon: "👨‍👩‍👧‍👦",
    gradient: modernColors.crimson,
    accentColor: "rose",
    features: [
      "Boşanma Davaları",
      "Nafaka Hesaplamaları", 
      "Velayet Süreçleri",
      "Mal Paylaşımı",
      "Evlilik Sözleşmeleri",
      "Aile İçi Uyuşmazlık Çözümü",
      "Çocuk Hakları",
      "Evlat Edinme Süreçleri"
    ],
    processes: [
      "Ücretsiz ön görüşme ve durum analizi",
      "Strateji belirleme ve dosya hazırlığı", 
      "Gerekli belgelerin toplanması",
      "Mahkeme sürecinin başlatılması",
      "Uzlaşma görüşmeleri yürütülmesi",
      "Duruşmalarda profesyonel temsil",
      "Karar sonrası takip ve uygulama"
    ],
    faqs: [
      {
        question: "Boşanma davası ne kadar sürer?",
        answer: "Anlaşmalı boşanmalar 2-3 ayda sonuçlanırken, çekişmeli boşanmalar 6 ay ile 2 yıl arasında sürebilir. Süre, davaya konu olan konuların karmaşıklığına göre değişir."
      },
      {
        question: "Nafaka miktarı nasıl belirlenir?",
        answer: "Nafaka miktarı, tarafların gelir durumu, yaşam standardı, çocukların ihtiyaçları ve yerel yaşam koşulları dikkate alınarak belirlenir."
      },
      {
        question: "Velayet kararında hangi faktörler önemli?",
        answer: "Çocuğun yüksek yararı ilkesi çerçevesinde, ebeveynlerin maddi durumu, çocukla ilgilenme kapasitesi ve yaşam koşulları değerlendirilir."
      }
    ]
  },
  {
    id: 2,
    name: "Bilişim Hukuku",
    slug: "bilisim-hukuku",
    shortDescription: "Dijital dünyada haklarınızı koruyoruz",
    description: "Siber suçlar, dijital haklar, e-ticaret uyuşmazlıkları ve teknoloji hukuku konularında uzman danışmanlık hizmeti sunuyoruz.",
    longDescription: "Bilişim hukuku alanında teknolojinin hızla geliştiği çağımızda karşılaşılan hukuki sorunlara modern çözümler üretiyoruz. Siber suçlar, veri ihlalleri ve dijital haklar konusunda kapsamlı deneyimimizle müvekkillerimizi temsil ediyoruz.\n\nE-ticaret platformlarında yaşanan uyuşmazlıklar, domain adı anlaşmazlıkları ve yazılım lisans sorunlarında uzman yaklaşım sergiliyoruz. Sosyal medya hukuku ve dijital platformlarda yaşanan sorunlarda da profesyonel destek sağlıyoruz.\n\nKurumsal müvekkillerimiz için bilişim sistemleri güvenliği, veri koruma politikaları ve teknoloji transferi konularında danışmanlık hizmeti veriyoruz.",
    icon: "💻",
    gradient: modernColors.sapphire,
    accentColor: "blue",
    features: [
      "Siber Suç Savunması",
      "E-ticaret Uyuşmazlıkları",
      "Dijital Haklar",
      "Domain Adı Anlaşmazlıkları",
      "Yazılım Lisans Sorunları",
      "Sosyal Medya Hukuku",
      "Veri İhlali Davaları",
      "Teknoloji Transferi"
    ],
    processes: [
      "Dijital delil toplama ve analizi",
      "Siber olay inceleme raporu",
      "Hukuki strateji geliştirme",
      "Teknik uzman koordinasyonu",
      "Mahkeme süreci yönetimi",
      "Dijital forensik destegi",
      "Uzlaşma ve tazminat süreçleri"
    ],
    faqs: [
      {
        question: "Siber dolandırıcılığa maruz kaldım, ne yapmalıyım?",
        answer: "Derhal delilleri güvence altına alın, banka/kart işlemlerini durdurm ve hemen hukuki destek alın. İlk 24 saat kritik öneme sahiptir."
      },
      {
        question: "E-ticaret sitesinde sorun yaşıyorum, nasıl çözebilirim?",
        answer: "E-ticaret uyuşmazlıkları tüketici hakları ve sözleşme hukuku kapsamında değerlendirilir. Platform politikaları ve yasal haklarınızı birlikte değerlendiririz."
      },
      {
        question: "Sosyal medyada hakarete uğradım, dava açabilir miyim?",
        answer: "Sosyal medyada hakaret, kişilik haklarına saldırı teşkil eder. Ekran görüntüleri ve delillerle hem cezai hem hukuki yollara başvurulabilir."
      }
    ]
  },
  {
    id: 3,
    name: "Ceza Hukuku",
    slug: "ceza-hukuku", 
    shortDescription: "Haklarınızı güçlü savunuculukla koruyoruz",
    description: "Ceza davalarında etkili savunma stratejileri ve deneyimli yaklaşımla adaletin tecellisi için mücadele ediyoruz. Her durumda yanınızdayız.",
    longDescription: "Ceza hukuku alanında güçlü savunma stratejileri geliştirerek, müvekkillerimizin haklarını sonuna kadar koruyoruz. Her dava kendine özgü özellikler taşıdığından, detaylı dosya analizi yaparak en etkili savunma yöntemlerini belirliyoruz.\n\nSuçlamalara karşı delil toplama, tanık ifadeleri, bilirkişi raporları ve hukuki gerekçelendirmelerle güçlü bir savunma hattı oluşturuyoruz. Beraat için tüm hukuki imkanları sonuna kadar kullanırken, gerekli durumlarda ceza indirimi veya erteleme için çalışıyoruz.\n\nUzlaşma süreçlerinde de deneyimli yaklaşımımızla, mağdurla en uygun koşullarda anlaşma sağlayarak ceza davalarını sonlandırabiliyoruz.",
    icon: "⚖️",
    gradient: modernColors.navy,
    accentColor: "blue",
    features: [
      "Suç Savunması",
      "Beraat Stratejileri",
      "Ceza İndirimi",
      "Uzlaşma Süreçleri",
      "Temyiz İşlemleri",
      "Tutuklama İtirazları",
      "Soruşturma Savunması",
      "Adli Kontrol"
    ],
    processes: [
      "Acil durum müdahalesi 7/24",
      "Dosya inceleme ve detaylı analiz",
      "Savunma stratejisi geliştirme",
      "Delil toplama ve değerlendirme",
      "Savcılık aşaması savunma",
      "Mahkeme sürecinde güçlü temsil",
      "Temyiz başvurusu ve takibi"
    ],
    faqs: [
      {
        question: "Gözaltına alındığımda ne yapmalıyım?",
        answer: "Öncelikle sakin kalın ve hiçbir ifade vermeden avukatınızı isteyin. Gözaltı süresince susma hakkınızı kullanabilirsiniz."
      },
      {
        question: "Ceza davası açıldı, beraat şansım var mı?",
        answer: "Her dava kendine özgüdür. Dosya analizi sonrasında delil durumu ve savunma imkanlarını değerlendirerek beraat şansınızı belirleyebiliriz."
      },
      {
        question: "Uzlaşma sürecinde nelere dikkat etmeliyim?",
        answer: "Uzlaşma teklifi yapmadan önce suçun niteliği, mağdurun durumu konusunda profesyonel değerlendirme almak önemlidir."
      }
    ]
  },
  {
    id: 4,
    name: "Gayrimenkul Hukuku",
    slug: "gayrimenkul-hukuku",
    shortDescription: "Emlak yatırımlarınızı güvenceye alın",
    description: "Gayrimenkul alım-satımı, tapu işlemleri, imar sorunları ve emlak uyuşmazlıklarında uzman hukuki danışmanlık hizmeti sunuyoruz.",
    longDescription: "Gayrimenkul hukuku alanında emlak yatırımlarınızın güvencesi olmak için kapsamlı hizmet sunuyoruz. Tapu işlemlerinden imar planı değişikliklerine, gayrimenkul alım-satımından kiralama süreçlerine kadar tüm aşamalarda yanınızdayız.\n\nİmar uyuşmazlıkları, kamulaştırma süreçleri ve yapı ruhsatı sorunlarında deneyimli kadromuzla çözüm üretiyoruz. Gayrimenkul değerleme, ekspertiz raporları ve hasar tespit süreçlerinde teknik uzmanlarla koordineli çalışıyoruz.\n\nYatırım amaçlı gayrimenkul alımlarında hukuki risk analizi yaparak, güvenli yatırım yapmanızı sağlıyoruz. Emlak geliştirme projeleri için de kapsamlı hukuki destek veriyoruz.",
    icon: "🏢",
    gradient: modernColors.bronze,
    accentColor: "amber",
    features: [
      "Gayrimenkul Alım-Satımı",
      "Tapu İşlemleri",
      "İmar Uyuşmazlıkları",
      "Kamulaştırma Davaları",
      "Yapı Ruhsat Sorunları",
      "Emlak Değerleme",
      "Yatırım Danışmanlığı",
      "İnşaat Sözleşmeleri"
    ],
    processes: [
      "Gayrimenkul hukuki durum analizi",
      "Tapu araştırması ve inceleme",
      "İmar durumu kontrolü",
      "Risk değerlendirme raporu",
      "Sözleşme hazırlama ve müzakere",
      "Resmi işlemlerin takibi",
      "Tesellüm ve devir süreçleri"
    ],
    faqs: [
      {
        question: "Gayrimenkul alırken nelere dikkat etmeliyim?",
        answer: "Tapu durumu, imar durumu, borç-haciz sorgulaması ve yapı ruhsatı kontrolü temel kontroller arasındadır. Hukuki inceleme yaptırmanız önerilir."
      },
      {
        question: "İmar planı değişikliği emlakımı nasıl etkiler?",
        answer: "İmar planı değişiklikleri gayrimenkulün kullanım amacını, yapılaşma koşullarını ve değerini etkileyebilir. Hukuki haklarınızı korumak için uzman desteği alın."
      },
      {
        question: "Kamulaştırma kararına itiraz edebilir miyim?",
        answer: "Kamulaştırma kararlarına hem idari hem yargı yollarıyla itiraz edilebilir. Süre sınırları olduğu için hemen başvurmak önemlidir."
      }
    ]
  },
  {
    id: 5,
    name: "İdare Hukuku",
    slug: "idare-hukuku",
    shortDescription: "Devlete karşı haklarınızı savunuyoruz",
    description: "Kamu kurumlarıyla yaşanan sorunlarda, memur hakları, ihale süreçleri ve idari işlemlerde uzman desteği sağlıyoruz. Bürokrasiye karşı güçlü savunma.",
    longDescription: "İdare hukuku alanında vatandaşların kamu yönetimine karşı haklarını korumak için çalışıyoruz. Bürokrasinin karmaşıklığında kaybolmadan, etkili çözümler üretiyoruz.\n\nMemur hakları konusunda atama, terfi, disiplin cezaları ve emeklilik süreçlerinde yaşanan sorunlarda deneyimli kadromuzla hizmet veriyoruz. İhale süreçlerinde şeffaflık ve adalet için gerekli hukuki başvuruları yapıyoruz.\n\nKamu kurumlarının verdiği kararların iptali, tazminat talepleri ve idari yargı süreçlerinde güçlü temsil sağlıyoruz.",
    icon: "🏛️",
    gradient: modernColors.steel,
    accentColor: "slate",
    features: [
      "İdari Davalar",
      "Memur Hakları",
      "İhale İptalleri",
      "Lisans İşlemleri",
      "Disiplin Cezaları",
      "Kamu İhale Uyuşmazlıkları",
      "İmar Planı İtirazları",
      "Vergi Uyuşmazlıkları"
    ],
    processes: [
      "İdari işlem detaylı analizi",
      "Süre kontrolü ve başvuru hazırlığı",
      "Dava dosyası profesyonel hazırlık",
      "İdare mahkemesi süreci yönetimi",
      "Danıştay temyiz başvurusu",
      "İcra ve takip süreçleri",
      "Tazminat talep süreçleri"
    ],
    faqs: [
      {
        question: "İdari davada süre sınırı var mı?",
        answer: "Evet, idari işlemler aleyhine dava açma süresi genellikle 60 gündür. Bu süre işlemin tebliğ edildiği tarihten itibaren başlar."
      },
      {
        question: "Memur disiplin cezasına nasıl itiraz edilir?",
        answer: "Disiplin cezası tebliğinden itibaren 15 gün içinde üst makama itiraz, red halinde 60 gün içinde mahkemeye başvuru yapılabilir."
      },
      {
        question: "İhale iptali davası ne zaman açılır?",
        answer: "İhale kararının ilanından itibaren 10 gün itiraz, sonrasında 30 gün içinde dava açma süresi vardır."
      }
    ]
  },
  {
    id: 6,
    name: "İş Hukuku",
    slug: "is-hukuku",
    shortDescription: "Çalışma hayatında haklarınızı koruyoruz",
    description: "İşçi-işveren ilişkilerinde dengeli çözümler, kıdem-ihbar tazminatları, mobbing konularında profesyonel danışmanlık hizmeti veriyoruz.",
    longDescription: "İş hukuku alanında hem işçi hem de işveren perspektifinden deneyimli yaklaşımımızla, çalışma hayatında yaşanan sorunlara çözüm üretiyoruz. Kıdem ve ihbar tazminatı hesaplamalarında güncel yasal düzenlemeleri takip ederek, hakkınız olan tutarı tam olarak almanızı sağlıyoruz.\n\nMobbing vakalarında detaylı dosya hazırlığı yaparak, maddi ve manevi tazminat taleplerinde güçlü temsil sağlıyoruz. İş sözleşmelerinin hazırlanması ve müzakeresinde tarafların haklarını koruyacak dengeli çözümler üretiyoruz.\n\nToplu işten çıkarma, sendika hakları ve sosyal güvenlik konularında da uzman desteği sunuyoruz.",
    icon: "💼",
    gradient: modernColors.forest,
    accentColor: "emerald",
    features: [
      "Kıdem Tazminatı",
      "İhbar Tazminatı",
      "Mobbing Davaları",
      "İş Sözleşmeleri",
      "Çalışma Koşulları",
      "Fazla Çalışma Ücretleri",
      "Sendika Hakları",
      "Toplu İş Sözleşmesi"
    ],
    processes: [
      "İş ilişkisi kapsamlı analizi",
      "Belge ve delil sistematik toplama",
      "Tazminat detaylı hesaplaması",
      "İcra takibi etkili başlatma",
      "İş mahkemesi profesyonel süreç",
      "Uzlaşma görüşmeleri yönetimi",
      "Temyiz başvuru ve takibi"
    ],
    faqs: [
      {
        question: "Kıdem tazminatı ne zaman ödenir?",
        answer: "İş sözleşmesinin işveren tarafından haklı sebep olmaksızın feshedilmesi, işçinin haklı nedenle feshi veya emeklilik durumlarında hak doğar."
      },
      {
        question: "Mobbing davası nasıl açılır?",
        answer: "Önce delil toplama süreci kritiktir. Yazılı belgeler, tanık ifadeleri ve tıbbi raporlarla güçlü dosya hazırlanır."
      },
      {
        question: "İşten çıkarma tazminatları ne kadar sürede alınır?",
        answer: "İcra takibi ile 1-3 ay, mahkeme süreci ile 6 ay-2 yıl arasında değişir. İşverenin durumu süreyi etkiler."
      }
    ]
  },
  {
    id: 7,
    name: "Kira Hukuku",
    slug: "kira-hukuku",
    shortDescription: "Mülk haklarınızı güvenceye alın",
    description: "Kiracı-kiraya veren uyuşmazlıkları, tahliye davaları ve kira artış süreçlerinde uzman çözümler sunuyoruz.",
    longDescription: "Kira hukuku alanında hem kiracı hem de kiraya veren haklarını koruma konusunda uzman hizmet sunuyoruz. Tahliye davalarında güçlü savunma stratejileri geliştirerek, müvekkillerimizin haklarını en iyi şekilde temsil ediyoruz.\n\nKira artış süreçlerinde yasal sınırları ve prosedürleri titizlikle takip ederek, adil çözümler üretiyoruz. Depozito iade süreçlerinde hakkaniyetli çözümler için çalışırken, onarım yükümlülüklerinde tarafların sorumluluklarını net şekilde belirliyoruz.\n\nKira sözleşmelerinin hazırlanmasında her iki tarafın da menfaatini koruyacak dengeli hükümler oluşturuyoruz.",
    icon: "🏠",
    gradient: modernColors.mahogany,
    accentColor: "orange",
    features: [
      "Tahliye Davaları",
      "Kira Artışı",
      "Depozito İadeleri",
      "Onarım Yükümlülükleri",
      "Sözleşme Düzenlemeleri",
      "Komşuluk Hakları",
      "Kat Mülkiyeti",
      "Emlak Süreçleri"
    ],
    processes: [
      "Sözleşme kapsamlı analizi",
      "Hukuki durum değerlendirmesi",
      "Uzlaşma görüşmeleri yürütme",
      "İcra takibi profesyonel başlatma",
      "Tahliye davası etkili açma",
      "Duruşma sürecinde güçlü temsil",
      "İcra ve boşaltma takibi"
    ],
    faqs: [
      {
        question: "Tahliye davası ne kadar sürer?",
        answer: "Basit tahliye davaları 3-6 ay, karmaşık davalar 1-2 yıl sürebilir. Davanın gerekçesi ve taraf tutumları süreyi etkiler."
      },
      {
        question: "Kira artışında hangi oranlara uymalıyım?",
        answer: "Kira artışı TÜİK TÜFE oranını geçemez. 1 yıl bekleme ve yazılı bildirim şartları vardır."
      },
      {
        question: "Depozito ne zaman iade edilir?",
        answer: "Kiracı taşındıktan sonra hasar tespiti yapılarak 15-30 gün içinde iade edilmelidir."
      }
    ]
  },
  {
    id: 8,
    name: "KVKK Hukuku",
    slug: "kvkk-hukuku",
    shortDescription: "Dijital çağda gizliliğinizi koruyoruz",
    description: "Kişisel Verilerin Korunması Kanunu kapsamında bireysel ve kurumsal haklar, veri ihlalleri konularında uzman danışmanlık hizmeti sunuyoruz.",
    longDescription: "KVKK hukuku alanında hem bireysel hem de kurumsal müvekkillerimize kapsamlı hukuki destek sağlıyoruz. Kişisel veri ihlalleri konusunda güçlü başvuru dosyaları hazırlayarak, haklarınızın korunması için gerekli tüm adımları atıyoruz.\n\nKurumsal müvekkillerimiz için KVKK uyum süreçlerinde danışmanlık hizmeti verirken, veri işleme politikalarının hazırlanmasında rehberlik ediyoruz. Veri Koruma Kurulu'na yapılacak başvurularda professional temsil sağlıyoruz.\n\nDijital haklar konusunda bilinçlendirme ve farkındalık yaratarak, müvekkillerimizin gizlilik haklarını en üst düzeyde koruyoruz.",
    icon: "🔐",
    gradient: modernColors.plum,
    accentColor: "purple",
    features: [
      "Veri İhlali Şikayetleri",
      "Gizlilik Hakları",
      "KVKK Uyum Süreçleri",
      "Kişisel Veri Silme",
      "Dijital Haklar",
      "Veri Koruma Politikaları",
      "Aydınlatma Metinleri",
      "VKK Başvuruları"
    ],
    processes: [
      "Veri ihlali detaylı tespiti",
      "Hasar kapsamlı değerlendirmesi",
      "Başvuru dosyası profesyonel hazırlık",
      "VKK'ya etkili başvuru",
      "İdari süreç sistematik takip",
      "Tazminat talep süreci",
      "Mahkeme süreci yönetimi"
    ],
    faqs: [
      {
        question: "Kişisel verilerimin silinmesini nasıl talep ederim?",
        answer: "Veri sorumlusuna yazılı başvuru yapabilirsiniz. 30 gün cevap alamazsanız VKK'ya başvuru hakkınız vardır."
      },
      {
        question: "KVKK ihlali durumunda tazminat alabilir miyim?",
        answer: "Evet, kişisel veri ihlali nedeniyle zarar görürseniz maddi ve manevi tazminat talep edebilirsiniz."
      },
      {
        question: "Şirketim KVKK'ya nasıl uyum sağlar?",
        answer: "Veri envanteri, politika hazırlama, aydınlatma metinleri ve güvenlik önlemleri gerekir. Profesyonel danışmanlık önemlidir."
      }
    ]
  },
  {
    id: 9,
    name: "Miras Hukuku",
    slug: "miras-hukuku",
    shortDescription: "Gelecek nesillere güvenli geçiş",
    description: "Miras paylaşımı, vasiyet düzenleme ve saklı pay hesaplamaları konularında ailevi uyuşmazlıkları çözmek için deneyimli kadromuzla hizmet veriyoruz.",
longDescription: "Miras hukuku alanında ailevi bağları koruyarak adil miras dağılımını sağlamak için çalışıyoruz. Vasiyet düzenleme süreçlerinde hukuki geçerliliği olan belgeler hazırlayarak, mirasçılar arasında uyuşmazlık çıkmasını önlüyoruz.\n\nSaklı pay hesaplamaları ve miras paylaşımında matematiksel doğruluk ile hukuki gereklilikeri bir arada değerlendirerek, tüm mirasçıların haklarını koruyoruz. Mirastan feragat ve hibeler konusunda da uzman danışmanlık sağlıyoruz.\n\nTereke tespit süreçlerinde detaylı envanter çıkararak, borçların ve alacakların net şekilde belirlenmesini sağlıyoruz.",
    icon: "🏺",
    gradient: modernColors.onyx,
    accentColor: "gray",
    features: [
      "Miras Paylaşımı",
      "Vasiyet Düzenleme",
      "Saklı Pay Hesaplaması",
      "Mirastan Feragat",
      "Tereke Süreçleri",
      "Hibe İşlemleri",
      "Mirasçılık Davaları",
      "Gaiplik Süreçleri"
    ],
    processes: [
      "Miras bırakanın mal varlığı tespiti",
      "Mirasçıların belirlenmesi",
      "Saklı pay hesaplaması",
      "Vasiyet geçerliliği incelemesi",
      "Paylaşım planı hazırlığı",
      "Resmi işlemlerin yürütülmesi",
      "Tapu devir süreçleri"
    ],
    faqs: [
      {
        question: "Vasiyet nasıl düzenlenir?",
        answer: "Vasiyet resmi senetle noterde veya ölüm döşeğinde iki tanık huzurunda düzenlenebilir. Hukuki geçerlilik için belirli şartlar aranır."
      },
      {
        question: "Saklı pay nedir, kimler saklı paya sahiptir?",
        answer: "Saklı pay, mirasın belirli bir kısmının belirli mirasçılara (eş, çocuklar, ana-baba) ayrılması zorunluluğudur. Bu pay vasiyet ile bile engellenemez."
      },
      {
        question: "Miras paylaşımından önce hangi işlemler yapılır?",
        answer: "Tereke tespiti, borç-alacak durumu, vergi yükümlülükleri ve mirasçıların belirlenmesi süreçleri tamamlanır."
      }
    ]
  },
  {
    id: 10,
    name: "Sağlık Hukuku",
    slug: "saglik-hukuku",
    shortDescription: "Sağlık haklarınızın güvencesiyiz",
    description: "Tıbbi malpraktis, hasta hakları, sağlık sigortası uyuşmazlıkları ve sağlık kuruluşları ile yaşanan sorunlarda uzman çözümler üretiyoruz.",
    longDescription: "Sağlık hukuku alanında hasta hakları ve tıbbi malpraktis konularında uzman hizmet sunuyoruz. Tıbbi hataların tespiti, uzman hekimlerle koordineli çalışarak bilirkişi raporları hazırlama ve tazminat süreçlerinde güçlü temsil sağlıyoruz.\n\nSağlık sigortası uyuşmazlıklarında sigorta şirketleriyle müzakere süreçlerinde deneyimli yaklaşımımızla müvekkillerimizin haklarını koruyoruz. Hastane-hasta ilişkilerinde yaşanan sorunlarda da uzman çözümler üretiyoruz.\n\nÖzel sağlık kuruluşları için de hukuki danışmanlık hizmeti vererek, hasta güvenliği ve hukuki uyum konularında destek sağlıyoruz.",
    icon: "🏥",
    gradient: modernColors.emerald,
    accentColor: "green",
    features: [
      "Tıbbi Malpraktis",
      "Hasta Hakları",
      "Sigorta Uyuşmazlıkları",
      "Sağlık Tazminatları",
      "Hastane Süreçleri",
      "İlaç Yan Etkileri",
      "Ameliyat Hataları",
      "Teşhis Gecikmeleri"
    ],
    processes: [
      "Tıbbi dosya inceleme ve analiz",
      "Uzman hekim görüşü alınması",
      "Bilirkişi raporu koordinasyonu",
      "Tazminat miktarı hesaplaması",
      "Sigorta şirketi müzakereleri",
      "Mahkeme süreci yönetimi",
      "İcra ve tahsilat takibi"
    ],
    faqs: [
      {
        question: "Tıbbi hata durumunda ne yapmalıyım?",
        answer: "Tüm tıbbi belgelerinizi saklayın, ikinci doktor görüşü alın ve hukuki destek için başvurun. Zaman aşımı süreleri önemlidir."
      },
      {
        question: "Ameliyat hatası nasıl kanıtlanır?",
        answer: "Tıbbi kayıtlar, bilirkişi raporları ve uzman hekim görüşleriyle ameliyat hatası tespit edilir. Nedensellik bağı kurulması gerekir."
      },
      {
        question: "Sağlık sigortası tazminatımı ödemezse ne yaparım?",
        answer: "Önce sigorta şirketiyle yazışma yapın, gerekirse TSRŞB'ye şikayet edin. Hukuki süreç başlatmak için hemen destek alın."
      }
    ]
  },
  {
    id: 11,
    name: "Sigorta Hukuku",
    slug: "sigorta-hukuku",
    shortDescription: "Sigorta haklarınızı tam olarak alın",
    description: "Sigorta şirketleriyle yaşanan uyuşmazlıklar, tazminat ödemeleri ve poliçe kapsamı konularında haklarınızı sonuna kadar savunuyoruz.",
    longDescription: "Sigorta hukuku alanında poliçe sahiplerinin haklarını korumak için sigorta şirketleriyle güçlü müzakereler yürütüyoruz. Hasar dosyalarının detaylı incelenmesi, ekspertiz raporlarının değerlendirilmesi ve tazminat hesaplamalarında uzman yaklaşım sergiliyoruz.\n\nKasko, trafik, konut, sağlık ve hayat sigortalarında yaşanan uyuşmazlıklarda deneyimli kadromuzla hizmet veriyoruz. Red kararlarına itiraz süreçlerinde etkili savunma stratejileri geliştiriyoruz.\n\nSigorta sözleşmelerinin şartlarını detaylı inceleyerek, müvekkillerimizin lehine olan tüm hakları gün yüzüne çıkarıyoruz.",
    icon: "🛡️",
    gradient: modernColors.jade,
    accentColor: "teal",
    features: [
      "Sigorta Tazminatları",
      "Poliçe Uyuşmazlıkları",
      "Hasar Değerlendirme",
      "Red Kararları",
      "Prim İadesi",
      "Kasko Sigortası",
      "Sağlık Sigortası",
      "Hayat Sigortası"
    ],
    processes: [
      "Poliçe şartları detaylı analizi",
      "Hasar dosyası incelenmesi",
      "Ekspertiz raporu değerlendirmesi",
      "Tazminat hesaplama ve talep",
      "Sigorta şirketi müzakereleri",
      "Hukuki süreç başlatılması",
      "İcra ve tahsilat takibi"
    ],
    faqs: [
      {
        question: "Sigorta şirketim tazminatımı ödemiyor, ne yapabilirim?",
        answer: "Önce ret gerekçesini öğrenin, poliçe şartlarını inceleyin. Hukuki haklarınızı korumak için uzman desteği alarak itiraz sürecini başlatın."
      },
      {
        question: "Kasko tazminatı nasıl hesaplanır?",
        answer: "Araç değeri, hasar miktarı, muafiyet tutarı ve poliçe şartları dikkate alınır. Ekspertiz raporu kritik önem taşır."
      },
      {
        question: "Sağlık sigortası tedavi masraflarını karşılamıyor, ne yaparım?",
        answer: "Poliçe kapsamını kontrol edin, gerekli belgeleri toplayın ve sigorta şirketiyle görüşün. Ret durumunda hukuki başvuru yapın."
      }
    ]
  },
  {
    id: 12,
    name: "Ticaret Hukuku",
    slug: "ticaret-hukuku",
    shortDescription: "İş dünyasında güvenli ortaklıklar",
    description: "Şirket kuruluşları, ortaklık uyuşmazlıkları, ticari sözleşmeler ve ticaret hukuku uyuşmazlıklarında kapsamlı danışmanlık hizmeti sunuyoruz.",
    longDescription: "Ticaret hukuku alanında şirketlerin kuruluşundan tasfiyesine kadar tüm süreçlerde uzman danışmanlık sağlıyoruz. Ortaklık uyuşmazlıklarında taraflar arasında dengeli çözümler üretmeye odaklanıyoruz.\n\nTicari sözleşmelerin hazırlanması, müzakeresi ve uygulanması konularında deneyimli yaklaşımımızla şirketlerin hukuki risklerini minimize ediyoruz. Franchise, distribütörlük ve bayilik sözleşmelerinde de uzman hizmet veriyoruz.\n\nŞirket birleşme ve devralma süreçlerinde (M&A) hukuki due diligence çalışmaları yaparak, yatırımcılarımızın güvenli işlem yapmalarını sağlıyoruz.",
    icon: "🏪",
    gradient: modernColors.copper,
    accentColor: "orange",
    features: [
      "Şirket Kuruluşları",
      "Ortaklık Uyuşmazlıkları",
      "Ticari Sözleşmeler",
      "Franchise Sözleşmeleri",
      "M&A İşlemleri",
      "Şirket Tasfiyesi",
      "Ticari Tahkim",
      "Rekabet Hukuku"
    ],
    processes: [
      "İş planı hukuki analizi",
      "Şirket türü seçimi danışmanlığı",
      "Kuruluş işlemlerinin yürütülmesi",
      "Sözleşme taslaklarının hazırlanması",
      "Ticaret sicili işlemleri",
      "Ortaklık anlaşması düzenlenmesi",
      "Sürekli hukuki danışmanlık"
    ],
    faqs: [
      {
        question: "Hangi şirket türünü seçmeliyim?",
        answer: "İş hacminiz, ortak sayısı, sorumluluk tercihiniz ve vergi planlama durumunuza göre en uygun şirket türünü belirleyebiliriz."
      },
      {
        question: "Ortaklarımla anlaşmazlık yaşıyorum, ne yapabilirim?",
        answer: "Ortaklık sözleşmesi incelenip, uyuşmazlığın türüne göre arabuluculuk veya dava süreçleri değerlendirilebilir."
      },
      {
        question: "Ticari sözleşmemde haksız rekabet var, nasıl korunurum?",
        answer: "Sözleşme şartları ve rekabet durumu analiz edilerek, gerekli hukuki başvurular ve tedbir talepleri yapılabilir."
      }
    ]
  },
  {
    id: 13,
    name: "Tüketici Hukuku",
    slug: "tuketici-hukuku",
    shortDescription: "Tüketici olarak haklarınızı koruyoruz",
    description: "Satın aldığınız ürün ve hizmetlerde yaşanan sorunlar, ayıplı mal, garanti süreçleri ve tüketici haklarınızda uzman destek alın.",
    longDescription: "Tüketici hukuku alanında müşteri memnuniyetsizliği ve haksız ticari uygulamalar karşısında tüketicilerin haklarını korumak için çalışıyoruz. Ayıplı mal iadesi, garanti kapsamı ve hizmet kusurları konularında uzman yaklaşım sergiliyoruz.\n\nE-ticaret sitelerinden alışveriş, online hizmetler ve dijital ürünlerde yaşanan sorunlarda da deneyimli destek sağlıyoruz. Tüketici mahkemesi süreçlerinde etkili temsil ediyoruz.\n\nKredi kartı uyuşmazlıkları, banka işlemleri ve finansal hizmetlerde yaşanan sorunlarda da tüketicilerin yanında yer alıyoruz.",
    icon: "🛒",
    gradient: modernColors.charcoal,
    accentColor: "zinc",
    features: [
      "Ayıplı Mal İadesi",
      "Garanti Süreçleri",
      "Hizmet Kusurları",
      "Tüketici Mahkemesi",
      "Cayma Hakları",
      "E-ticaret Sorunları",
      "Kredi Kartı Uyuşmazlıkları",
      "Online Alışveriş"
    ],
    processes: [
      "Tüketici hakkı ihlali tespiti",
      "Delil ve belge toplama",
      "Satıcı/hizmet sağlayıcı ile görüşme",
      "Tüketici hakem heyeti başvurusu",
      "Tüketici mahkemesi süreci",
      "İcra takip işlemleri",
      "Tazminat tahsil süreci"
    ],
    faqs: [
      {
        question: "Aldığım üründe sorun var, nasıl iade edebilirim?",
        answer: "Satın alma tarihinden itibaren 2 yıl içinde ayıplı mal nedeniyle iade, değişim veya indirim talep edebilirsiniz."
      },
      {
        question: "Online alışverişte cayma hakkımı nasıl kullanırım?",
        answer: "Ürünü teslim aldıktan sonra 14 gün içinde sebep göstermeden cayma hakkınızı kullanabilirsiniz."
      },
      {
        question: "Garanti süresi içinde arıza çıktı, ne yapmam gerek?",
        answer: "Satıcıya başvurarak ücretsiz onarım, değişim veya iade talebinde bulunabilirsiniz. Red durumunda hukuki başvuru yapın."
      }
    ]
  },
  {
    id: 14,
    name: "Vergi Hukuku",
    slug: "vergi-hukuku",
    shortDescription: "Vergi yükümlülüklerinizde uzman rehberlik",
    description: "Vergi planlaması, vergi uyuşmazlıkları, vergi denetimi süreçleri ve vergi cezalarında uzman danışmanlık hizmeti sunuyoruz.",
    longDescription: "Vergi hukuku alanında hem bireysel hem de kurumsal mükelleflerin vergi yükümlülüklerini optimize etmek için çalışıyoruz. Vergi planlaması süreçlerinde yasal vergi avantajlarından maksimum düzeyde yararlanmanızı sağlıyoruz.\n\nVergi denetimi süreçlerinde mükelleflerin haklarını koruyarak, denetim sürecini en az hasarla atlatmalarına yardımcı oluyoruz. Vergi uyuşmazlıklarında idari başvuru süreçlerinden yargı aşamasına kadar güçlü temsil sağlıyoruz.\n\nVergi cezalarının kaldırılması veya indirilmesi için etkili savunma stratejileri geliştiriyoruz.",
    icon: "📊",
    gradient: modernColors.obsidian,
    accentColor: "gray",
    features: [
      "Vergi Planlaması",
      "Vergi Uyuşmazlıkları",
      "Vergi Denetimi",
      "Vergi Cezaları",
      "Vergi İadesi",
      "KDV İşlemleri",
      "Gelir Vergisi",
      "Kurumlar Vergisi"
    ],
    processes: [
      "Vergi durumu analizi",
      "Vergi planı hazırlama",
      "İtiraz dilekçesi düzenleme",
      "Vergi mahkemesi süreci",
      "Danıştay temyiz başvurusu",
      "Vergi barışı başvuruları",
      "İcra takip süreçleri"
    ],
    faqs: [
      {
        question: "Vergi cezası aldım, nasıl itiraz edebilirim?",
        answer: "Ceza ihbarnamesi tebliğ edildiği tarihten itibaren 30 gün içinde vergi dairesine itiraz edebilirsiniz."
      },
      {
        question: "Vergi denetimi geliyor, ne yapmalıyım?",
        answer: "Sakin olun, belgeleri hazırlayın ve mutlaka uzman destek alın. Denetim sürecinde haklarınızı bilin ve koruyun."
      },
      {
        question: "Vergi barışından yararlanabilir miyim?",
        answer: "Vergi barışı düzenlemeleri periyodik olarak çıkar. Durumunuza uygun olup olmadığını değerlendirmek için danışmanlık alın."
      }
    ]
  },
  {
    id: 15,
    name: "Yabancılar Hukuku",
    slug: "yabancilar-hukuku",
    shortDescription: "Uluslararası haklarınızda yanınızdayız",
    description: "Oturma izni, çalışma izni, vatandaşlık süreçleri ve yabancılar için hukuki işlemlerde kapsamlı danışmanlık hizmeti sunuyoruz.",
    longDescription: "Yabancılar hukuku alanında Türkiye'de yaşayan yabancı uyruklu kişilerin hukuki süreçlerinde rehberlik ediyoruz. Oturma izni ve çalışma izni başvurularından vatandaşlık süreçlerine kadar tüm aşamalarda uzman destek sağlıyoruz.\n\nVatandaşlık başvuru süreçlerinde gerekli belgelerin hazırlanması, başvuru takibi ve gerekli durumlarda itiraz süreçlerinde yanınızda yer alıyoruz. Yabancı yatırımcılar için şirket kuruluşu ve yatırım danışmanlığı hizmetleri de sunuyoruz.\n\nUluslararası evlilik ve aile birleşimi süreçlerinde karşılaşılan hukuki sorunlarda da deneyimli yaklaşımımızla çözüm üretiyoruz.",
    icon: "🌍",
    gradient: modernColors.midnight,
    accentColor: "slate",
    features: [
      "Oturma İzni",
      "Çalışma İzni",
      "Vatandaşlık Başvurusu",
      "Sınır Dışı Davası",
      "Uluslararası Evlilik",
      "Aile Birleşimi",
      "Yabancı Yatırımcı",
      "Mülteci Hakları"
    ],
    processes: [
      "Başvuru koşulları analizi",
      "Gerekli belgelerin hazırlanması",
      "Başvuru dosyası düzenleme",
      "Resmi başvuru süreci takibi",
      "İtiraz ve başvuru süreçleri",
      "Mahkeme temsili",
      "Süreç tamamlanması"
    ],
    faqs: [
      {
        question: "Türk vatandaşlığına nasıl başvurabilirim?",
        answer: "5 yıl kesintisiz ikamet, Türkçe bilgisi, gelir şartları ve güvenlik soruşturması gibi şartları sağlamanız gerekir."
      },
      {
        question: "Çalışma iznim iptal edildi, ne yapabilirim?",
        answer: "İptal kararına karşı 30 gün içinde İçişleri Bakanlığı'na itiraz edebilir, ardından idari yargıya başvurabilirsiniz."
      },
      {
        question: "Sınır dışı kararı aldım, haklarım nelerdir?",
        answer: "Sınır dışı kararına itiraz etme, avukat talep etme ve tercüman hakkınız vardır. Hemen hukuki destek alın."
      }
    ]
  }
];

// Modern Hero Section
const HeroSection = ({ area }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ultra Modern Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${area.gradient}`}>
        {/* Sophisticated Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='white' fill-opacity='1'%3e%3cpath d='M0 0h60v60H0z' fill='none'/%3e%3cpath d='M0 0h30v30H0zm30 30h30v30H30z'/%3e%3c/g%3e%3c/svg%3e")`,
             }}>
        </div>
        
        {/* Modern Floating Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/4 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Modern Breadcrumb */}
        <nav className="flex items-center justify-center space-x-2 text-white/60 mb-12 text-sm font-medium">
          <Link href="/" className="hover:text-white transition-colors duration-300">Ana Sayfa</Link>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <Link href="/calisma-alanlari" className="hover:text-white transition-colors duration-300">Çalışma Alanları</Link>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <span className="text-white">{area.name}</span>
        </nav>

        {/* Icon with Modern Animation */}
        <div className="text-8xl mb-8 animate-bounce-slow">
          {area.icon}
        </div>

        {/* Main Title with Ultra Modern Typography */}
        <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] mb-6 tracking-tight">
          <span className="block">{area.name.split(' ')[0]}</span>
          <span className="block text-white/80 text-4xl md:text-6xl font-light">
            {area.name.split(' ').slice(1).join(' ')}
          </span>
        </h1>

        {/* Subtitle with Modern Styling */}
        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          {area.shortDescription}
        </p>

        {/* Ultra Modern CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href="/online-danismanlik"
            className="group relative overflow-hidden px-10 py-5 bg-white text-gray-900 font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <span className="relative z-10 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Ücretsiz Danışmanlık
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          
          <Link
            href="/iletisim"
            className="group px-10 py-5 bg-white/10 backdrop-blur-xl text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              Hemen Arayın
            </span>
          </Link>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
          {[
            { number: "15+", label: "Yıl Deneyim" },
            { number: "500+", label: "Başarılı Dava" },
            { number: "24/7", label: "Destek" },
            { number: "100%", label: "Gizlilik" }
          ].map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-black text-white mb-2">{stat.number}</div>
              <div className="text-white/70 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Ultra Modern Content Section
const ContentSection = ({ area }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <section className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Detaylı Bilgiler
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Ultra Modern Tab Navigation */}
        <div className="relative mb-20">
          <div className="flex flex-wrap justify-center bg-gray-50 rounded-3xl p-3 shadow-inner">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: '📋' },
              { id: 'process', label: 'Süreç', icon: '🔄' },
              { id: 'faq', label: 'S.S.S.', icon: '💬' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-amber-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content with Modern Design */}
        <div className="max-w-4xl mx-auto">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-fade-in">
              
              {/* Main Description */}
              <div className="prose prose-xl max-w-none">
                <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line font-light">
                  {area.longDescription}
                </div>
              </div>

              {/* Modern Features Grid */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 shadow-lg border">
                <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
                  Hizmet Alanlarımız
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {area.features.map((feature, index) => (
                    <div key={index} className="group flex items-center space-x-4 p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md hover:scale-105 transition-all duration-300">
<div className={`w-3 h-3 bg-amber-500 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-300`}></div>
                      <span className="text-gray-800 font-medium text-lg group-hover:text-gray-900 transition-colors duration-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Process Tab */}
{activeTab === 'process' && area.processes && (
  <div className="animate-fade-in">
    <h3 className="text-4xl font-bold text-gray-900 mb-12 text-center">
      Çalışma Sürecimiz
    </h3>
    <div className="space-y-6">
      {area.processes.map((step, index) => (
        <div key={index} className="group">
          <div className="flex items-start space-x-6 p-8 bg-white rounded-3xl shadow-lg border hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                {index + 1}
              </div>
              <div className="absolute -inset-2 bg-amber-100 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 mb-3 text-xl">
                {index + 1}. Adım
              </h4>
              <p className="text-gray-700 leading-relaxed text-lg font-light">{step}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

          {/* FAQ Tab */}
          {activeTab === 'faq' && area.faqs && (
            <div className="animate-fade-in">
              <h3 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                Sıkça Sorulan Sorular
              </h3>
              <div className="space-y-8">
                {area.faqs.map((faq, index) => (
                  <div key={index} className="group bg-white rounded-3xl shadow-lg border p-8 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                        S
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-4 text-xl leading-tight">
                          {faq.question}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 mt-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        C
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed text-lg font-light">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Ultra Modern CTA Section
const CTASection = ({ area }) => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Ultra Modern Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${area.gradient}`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Modern Icon */}
        <div className="text-7xl mb-8 animate-bounce-slow">
          {area.icon}
        </div>

        {/* Ultra Modern Title */}
        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
          {area.name} Konusunda
          <span className="block text-white/80 font-light text-3xl md:text-5xl mt-2">
            Yardıma İhtiyacınız Var mı?
          </span>
        </h2>

        {/* Modern Description */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          Uzman ekibimiz sizin için en uygun çözümü bulacak. 
          <span className="block mt-2 font-medium">Hemen iletişime geçin ve ücretsiz ön değerlendirme alın.</span>
        </p>

        {/* Ultra Modern Action Buttons */}
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
          <Link
            href="/online-danismanlik"
            className="group relative overflow-hidden px-12 py-6 bg-white text-gray-900 font-black text-lg rounded-3xl transition-all duration-300 hover:scale-110 hover:shadow-2xl min-w-[280px]"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Online Danışmanlık Al
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          
          <Link
            href="/iletisim"
            className="group px-12 py-6 bg-white/15 backdrop-blur-xl text-white font-bold text-lg rounded-3xl border-2 border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-300 hover:scale-105 min-w-[280px]"
          >
            <span className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              Hemen Arayın
            </span>
          </Link>
        </div>

        {/* Modern Contact Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-2xl mb-3">📞</div>
            <div className="text-white font-bold text-lg mb-1">Telefon</div>
            <div className="text-white/80">0 (370) 418 46 34</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-2xl mb-3">📧</div>
            <div className="text-white font-bold text-lg mb-1">E-posta</div>
            <div className="text-white/80">info@yusufcolak.av.tr</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-2xl mb-3">⏰</div>
            <div className="text-white font-bold text-lg mb-1">Çalışma Saatleri</div>
            <div className="text-white/80">Pazartesi-Cuma 09:00-18:00</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Component Export
export default function PracticeAreaPage({ params }) {
  const { slug } = params;
  
  // Find the area by slug
  const area = practiceAreasData.find(area => area.slug === slug);

  // If area not found, return 404
  if (!area) {
    notFound();
  }

  return (
    <>
      <Header />
      <HeroSection area={area} />
      <ContentSection area={area} />
      <CTASection area={area} />
      <Footer />
    </>
  );
}

// Add custom CSS for animations
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce-slow {
    0%, 20%, 53%, 80%, 100% {
      transform: translateY(0px);
    }
    40%, 43% {
      transform: translateY(-15px);
    }
    70% {
      transform: translateY(-7px);
    }
    90% {
      transform: translateY(-2px);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }

  .animate-bounce-slow {
    animation: bounce-slow 3s infinite;
  }
`;