import type { ContactValidationMessages } from '../lib/contact';
import type { WorkFilterId } from '../lib/projects-filter';

export type Locale = 'id' | 'en';

export interface NavItem {
  id: string;
  href: string;
  label: string;
}

export interface HeroPillar {
  index: string;
  title: string;
  stack: string;
  summary: string;
}

export interface ExperienceItem {
  index: string;
  company: string;
  role: string;
  period: string;
  location: string;
  isCurrent?: boolean;
  provenance: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface RepoLink {
  label: string;
  url: string;
}

export interface WorkItem {
  id: string;
  index: string;
  group: 'enterprise' | 'fullstack';
  title: string;
  subtitle: string;
  period: string;
  organization: string;
  roleLabel: string;
  provenance: string;
  problemContext: string;
  architectureSolution: string;
  stack: string[];
  filterTags: WorkFilterId[];
  repos: RepoLink[];
  scopeNote?: string;
}

export interface LabExplorationItem {
  index: string;
  title: string;
  summary: string;
  stack: string[];
  repos: RepoLink[];
}

export interface SkillCategory {
  index: string;
  category: string;
  focusNote: string;
  items: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  location: string;
  details: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  issuedDate: string;
  credentialUrl?: string;
}

export interface RecommendationItem {
  author: string;
  roleAndCompany: string;
  relationship: string;
  quote: string;
}

export interface PortfolioDictionary {
  locale: Locale;
  htmlLang: 'id' | 'en';
  ogLocale: 'id_ID' | 'en_US';
  ogLocaleAlternate: 'en_US' | 'id_ID';
  canonicalUrl: string;
  alternateUrl: string;
  seo: {
    title: string;
    description: string;
    jobTitle: string;
    knowsAbout: string[];
  };
  a11y: {
    skipToContent: string;
    primaryNavigation: string;
    mobileNavigationTitle: string;
    openMenuButton: string;
    closeMenuButton: string;
    languageSwitcherLabel: string;
    themeSwitcherLabel: string;
    externalRepoNotice: string;
  };
  header: {
    brandName: string;
    brandRole: string;
    nav: NavItem[];
    certificationsNavLabel: string;
    recommendationsNavLabel: string;
    downloadCvShort: string;
    themeAuto: string;
    themeLight: string;
    themeDark: string;
    themeCycleHint: string;
  };
  hero: {
    sectionIndex: string;
    eyebrow: string;
    currentStatusLabel: string;
    currentRoleText: string;
    currentRoleProvenance: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    locationLabel: string;
    experienceYearsLabel: string;
    coreStackLabel: string;
    pillars: HeroPillar[];
  };
  experience: {
    sectionIndex: string;
    title: string;
    subtitle: string;
    currentBadge: string;
    items: ExperienceItem[];
  };
  works: {
    sectionIndex: string;
    title: string;
    subtitle: string;
    noLiveDemoPolicyNote: string;
    filterLegend: string;
    searchLabel: string;
    searchPlaceholder: string;
    filters: Array<{ id: WorkFilterId; label: string }>;
    countTemplate: string;
    emptyStateTitle: string;
    emptyStateReset: string;
    enterpriseGroupTitle: string;
    enterpriseGroupSubtitle: string;
    fullstackGroupTitle: string;
    fullstackGroupSubtitle: string;
    contextHeading: string;
    architectureHeading: string;
    privateArchitectureBadge: string;
    items: WorkItem[];
  };
  lab: {
    sectionIndex: string;
    title: string;
    subtitle: string;
    explorationsHeading: string;
    telemetryHeading: string;
    telemetrySubheading: string;
    publicReposLabel: string;
    followersLabel: string;
    syncedAtLabel: string;
    recentNonForkHeading: string;
    noDescriptionLabel: string;
    unavailableTitle: string;
    unavailableBody: string;
    viewGitHubProfileCta: string;
    syncingStatusLabel: string;
    cachedStatusLabel: string;
    explorations: LabExplorationItem[];
  };
  skills: {
    sectionIndex: string;
    title: string;
    subtitle: string;
    categories: SkillCategory[];
  };
  education: {
    sectionIndex: string;
    title: string;
    subtitle: string;
    items: EducationItem[];
    certificationsTitle: string;
    recommendationsTitle: string;
    certifications: CertificationItem[];
    recommendations: RecommendationItem[];
  };
  contact: {
    sectionIndex: string;
    title: string;
    subtitle: string;
    directChannelsHeading: string;
    directChannelsBody: string;
    emailLabel: string;
    copyEmailButton: string;
    emailCopiedFeedback: string;
    copyFailedFeedback: string;
    sendMailtoButton: string;
    linkedinLabel: string;
    githubLabel: string;
    phoneLabel: string;
    formHeading: string;
    formIntro: string;
    requiredNote: string;
    fields: {
      nameLabel: string;
      nameHint: string;
      namePlaceholder: string;
      emailLabel: string;
      emailHint: string;
      emailPlaceholder: string;
      subjectLabel: string;
      subjectHint: string;
      subjectPlaceholder: string;
      messageLabel: string;
      messageHint: string;
      messagePlaceholder: string;
      honeypotLabel: string;
    };
    validation: ContactValidationMessages;
    submitButton: string;
    submittingButton: string;
    cooldownButtonTemplate: string;
    unconfiguredTitle: string;
    unconfiguredBody: string;
    successTitle: string;
    successBody: string;
    validationSummaryError: string;
    rateLimitError: string;
    deliveryFailedTitle: string;
    deliveryFailedBody: string;
    copyDraftButton: string;
    draftCopiedFeedback: string;
    openPrefilledMailtoButton: string;
  };
  footer: {
    copyrightText: string;
    architectureNote: string;
    timezoneNote: string;
  };
}

export const PROFILE_CONSTANTS = {
  fullName: 'Angga VB',
  email: 'anggavb8@gmail.com',
  githubUrl: 'https://github.com/anggavb',
  githubHandle: '@anggavb',
  linkedinUrl: 'https://www.linkedin.com/in/angga-vb/',
  linkedinHandle: 'linkedin.com/in/angga-vb',
  siteUrl: 'https://anggavb.my.id',
  cvDownloadPath: '/cv/CV-Angga-VB-Fullstack-Developer.pdf',
  cvDownloadFilename: 'CV-Angga-VB-Fullstack-Developer.pdf',
} as const;

export const PORTFOLIO_DICTIONARY: Record<Locale, PortfolioDictionary> = {
  id: {
    locale: 'id',
    htmlLang: 'id',
    ogLocale: 'id_ID',
    ogLocaleAlternate: 'en_US',
    canonicalUrl: 'https://anggavb.my.id/id/',
    alternateUrl: 'https://anggavb.my.id/en/',
    seo: {
      title: 'Angga VB | Fullstack Software Engineer (Golang, Next.js, Laravel, PostgreSQL)',
      description:
        'Portofolio rekayasa perangkat lunak Angga VB, Fullstack Developer berpengalaman 5+ tahun di layanan microservices perbankan (BRI), sistem enterprise, dan platform pemerintahan.',
      jobTitle: 'Fullstack Developer',
      knowsAbout: [
        'Golang',
        'Microservices',
        'Gin-Gonic',
        'Next.js',
        'React.js',
        'Laravel',
        'Vue.js',
        'PostgreSQL Full-Text Search',
        'MySQL',
        'Redis',
        'Docker',
      ],
    },
    a11y: {
      skipToContent: 'Lewati ke konten utama',
      primaryNavigation: 'Navigasi bagian utama',
      mobileNavigationTitle: 'Indeks Navigasi Halaman',
      openMenuButton: 'Menu',
      closeMenuButton: 'Tutup',
      languageSwitcherLabel: 'Pilih bahasa halaman',
      themeSwitcherLabel: 'Ubah mode tema tampilan',
      externalRepoNotice: '(membuka repositori GitHub di tab baru)',
    },
    header: {
      brandName: 'ANGGA VB',
      brandRole: 'Fullstack Engineer',
      nav: [
        { id: 'experience', href: '#experience', label: '01 Karir' },
        { id: 'projects', href: '#projects', label: '02 Karya' },
        { id: 'github-lab', href: '#github-lab', label: '03 Lab' },
        { id: 'tech-stack', href: '#tech-stack', label: '04 Spesifikasi' },
        { id: 'education', href: '#education', label: '05 Pendidikan' },
        { id: 'contact', href: '#contact', label: '06 Kontak' },
      ],
      certificationsNavLabel: 'Sertifikasi',
      recommendationsNavLabel: 'Rekomendasi',
      downloadCvShort: 'Unduh CV',
      themeAuto: 'Auto UTC+7',
      themeLight: 'Terang',
      themeDark: 'Gelap',
      themeCycleHint: 'Siklus mode tema: Otomatis UTC+7, Terang, Gelap',
    },
    hero: {
      sectionIndex: '00 / PROFIL EKSEKUTIF',
      eyebrow: 'JAKARTA, INDONESIA // REKAYASA SISTEM FULLSTACK',
      currentStatusLabel: 'PERAN SAAT INI',
      currentRoleText: 'Fullstack Developer di PT Bank Rakyat Indonesia (Persero) Tbk (BRI)',
      currentRoleProvenance: 'Dikonfirmasi Pemilik Profil',
      headline:
        'Membangun layanan microservices perbankan, sistem web enterprise, dan platform pemerintahan berskala produksi.',
      subheadline:
        'Fullstack Software Engineer dengan 5+ tahun pengalaman merancang arsitektur backend modular, mengoptimasi performa database relasional dan caching Redis, serta menghadirkan antarmuka web modern yang terukur menggunakan Golang, Next.js, React.js, Laravel, dan Vue.js.',
      primaryCta: 'Jelajahi Studi Kasus & Proyek',
      secondaryCta: 'Unduh CV (PDF)',
      locationLabel: 'Basis Operasional: Jakarta, ID (UTC+7)',
      experienceYearsLabel: 'Rekam Jejak: 5+ Tahun Produksi',
      coreStackLabel: 'Fokus Utama: Golang, Next.js, Laravel, PostgreSQL, MySQL, Redis',
      pillars: [
        {
          index: 'P.01',
          title: 'Backend & Microservices',
          stack: 'Golang / Gin / Laravel / REST & gRPC',
          summary:
            'Perancangan layanan terdistribusi, batas domain modular, autentikasi JWT/Sanctum/RBAC, serta refactoring sistem legacy berbeban tinggi.',
        },
        {
          index: 'P.02',
          title: 'Modern Frontend Systems',
          stack: 'Next.js / React.js / Vue.js / Astro / Tailwind CSS',
          summary:
            'Pengembangan aplikasi kerja multi-modul, dashboard analitik, dan antarmuka aksesibel yang cepat serta mudah dipelihara lintas tim.',
        },
        {
          index: 'P.03',
          title: 'Data, Search & Caching',
          stack: 'PostgreSQL FTS & GIN / MySQL / Redis / Docker',
          summary:
            'Optimasi query relasional, pencarian teks penuh berindeks GIN, strategi caching berlatensi rendah, dan workflow migrasi terkontainerisasi.',
        },
      ],
    },
    experience: {
      sectionIndex: '01 / KRONOLOGI KARIR',
      title: 'Pengalaman Profesional',
      subtitle:
        'Rekam jejak pengembangan perangkat lunak lintas sektor perbankan, solusi korporasi, lembaga pemerintahan pusat, dan operasional layanan kesehatan.',
      currentBadge: 'Aktif / Sekarang',
      items: [
        {
          index: '01.1',
          company: 'PT Bank Rakyat Indonesia (Persero) Tbk (BRI)',
          role: 'Fullstack Developer',
          period: 'Jul 2026 - Sekarang',
          location: 'Jakarta, Indonesia',
          isCurrent: true,
          provenance: 'Dikonfirmasi Pemilik Profil',
          summary:
            'Mengembangkan dan memelihara layanan aplikasi perbankan berbasis arsitektur microservice dengan fokus pada keandalan transaksi, efisiensi akses data, dan antarmuka web modern.',
          highlights: [
            'Membangun dan mengintegrasikan layanan backend berbasis Golang Microservice dengan penyimpanan relasional MySQL serta lapisan caching Redis.',
            'Mengembangkan antarmuka aplikasi web menggunakan Next.js yang terhubung dengan kontrak API layanan internal perbankan.',
          ],
          stack: ['Golang Microservice', 'MySQL', 'Next.js', 'Redis'],
        },
        {
          index: '01.2',
          company: 'Koda Tech Academy',
          role: 'Fullstack Developer Trainee',
          period: 'Feb 2026 - Jun 2026',
          location: 'Onsite - Bogor, Jawa Barat',
          provenance: 'Terverifikasi CV',
          summary:
            'Menuntaskan program rekayasa fullstack intensif berbasis proyek produksi dengan kepemimpinan tim teknis pada ekosistem Golang, Gin, React.js, PostgreSQL, Redis, dan Docker.',
          highlights: [
            'Memimpin tim 4 developer sebagai Team Lead pada proyek Tickitz hingga rilis penuh dalam waktu kurang dari satu bulan, mengoordinasikan pembagian modul dan integrasi API.',
            'Merancang arsitektur fullstack ShortLink (pemendek URL dengan Redis caching dan analitik klik) serta Kasvior (dompet digital dengan alur transaksi saldo dan autentikasi JWT).',
            'Menerapkan skema migrasi database, seeder terstruktur, dan dokumentasi Swagger/OpenAPI untuk menjaga konsistensi pengujian lintas layanan.',
          ],
          stack: [
            'Golang',
            'Gin',
            'React.js',
            'Vite',
            'Redux Toolkit',
            'Zustand',
            'Tailwind CSS',
            'PostgreSQL',
            'Redis',
            'Docker',
            'Swagger',
          ],
        },
        {
          index: '01.3',
          company: 'PT Centrinova Solusi Edukasi',
          role: 'Fullstack Developer',
          period: 'Feb 2022 - Feb 2026',
          location: 'Hybrid - Jakarta',
          provenance: 'Terverifikasi CV',
          summary:
            'Mengembangkan, memelihara, dan mengoptimasi berbagai platform web enterprise untuk klien jasa keuangan, manajemen SDM perbankan, dan sistem pembelajaran korporat.',
          highlights: [
            'Merilis modul inti FIF Learning Management System (LMS) mencakup pengelolaan anggaran pelatihan, alur persetujuan berjenjang, pelaporan manajerial, dan evaluasi karyawan.',
            'Membangun modul Net Promoter Score (NPS), reservasi ruangan, dan keterlibatan karyawan pada HRULTRA / UOB HR Platform sekaligus memangkas bottleneck performa modul legacy.',
            'Mengembangkan panel administrasi Danamon KUIZU untuk manajemen pengguna, kontrol akses berbasis peran, dan integrasi workflow bersama tim pengembang gim.',
            'Mengoptimasi struktur skema dan query PostgreSQL/MySQL untuk meningkatkan stabilitas produksi serta waktu respons sistem.',
          ],
          stack: ['Laravel', 'Vue.js', 'PostgreSQL', 'MySQL', 'REST API'],
        },
        {
          index: '01.4',
          company: 'Kementerian PPN/Bappenas (termasuk MediaWatch Bappenas)',
          role: 'Web Developer & Application Administrator / Solo Full-Stack Developer',
          period: 'Feb 2021 - Des 2025',
          location: 'Onsite - Kuningan, Jakarta',
          provenance: 'Terverifikasi CV & GitHub',
          summary:
            'Berkolaborasi dengan Divisi Pusdatinrenbang dalam pengembangan portal web pemerintahan publik dan aplikasi internal, serta merancang penuh platform analitik pemberitaan MediaWatch Bappenas (Agu - Des 2025).',
          highlights: [
            'Membangun dan menyempurnakan modul CMS portal resmi Bappenas untuk manajemen artikel, taksonomi kategori, penandaan topik, dan administrasi berita berbasis peran.',
            'Merancang mandiri (Solo Full-Stack) platform MediaWatch Bappenas dengan PostgreSQL Full-Text Search, peringkat relevansi, cuplikan kata kunci tersorot, GIN Indexing, pelacakan sentimen/narasumber, dan ekspor-impor Excel.',
            'Mendukung validasi User Acceptance Testing (UAT) situs Indonesia 2045 serta berkontribusi dalam diskusi arsitektur integrasi autentikasi SSO Gateway lintas sistem Bappenas.',
          ],
          stack: [
            'Laravel',
            'Vue.js',
            'Vuetify',
            'Pinia',
            'Laravel Sanctum',
            'PostgreSQL Full-Text Search',
            'GIN Indexing',
            'REST API',
          ],
        },
        {
          index: '01.5',
          company: 'PT Medika Solusi Pratamajaya',
          role: 'Web Developer',
          period: 'Jan 2020 - Feb 2021',
          location: 'Onsite - Bogor, Jawa Barat',
          provenance: 'Terverifikasi CV',
          summary:
            'Membangun aplikasi web operasional layanan kesehatan secara end-to-end untuk mendukung pemrosesan data harian dan pelaporan bisnis internal.',
          highlights: [
            'Mengembangkan modul manajemen data operasional, aturan validasi transaksi, dan pelaporan berkala menggunakan Laravel, MySQL, jQuery, dan integrasi REST API.',
            'Menata ulang struktur tabel dan mengoptimasi query MySQL guna mempercepat respons aplikasi serta menurunkan insiden gangguan berulang di lingkungan operasional.',
          ],
          stack: ['Laravel', 'MySQL', 'jQuery', 'REST API'],
        },
        {
          index: '01.6',
          company: 'PT Exa Mitra Solusi',
          role: 'IT Support & Internal Application Developer',
          period: 'Nov 2018 - Des 2019',
          location: 'Onsite - Kedoya, Jakarta',
          provenance: 'Terverifikasi CV',
          summary:
            'Mengembangkan perkakas web internal untuk digitalisasi pengajuan kartu kredit sekaligus mendukung kelancaran operasional sistem pengguna bisnis.',
          highlights: [
            'Membangun aplikasi workflow pengajuan dan persetujuan kartu kredit internal menggunakan CodeIgniter, JavaScript, dan MySQL.',
            'Menerapkan validasi input formulir, pelacakan status persetujuan bertahap, serta perbaikan antarmuka kerja untuk menekan kesalahan input manual.',
          ],
          stack: ['CodeIgniter', 'JavaScript', 'MySQL'],
        },
      ],
    },
    works: {
      sectionIndex: '02 / STUDI KASUS & PROYEK',
      title: 'Karya & Arsitektur Sistem',
      subtitle:
        'Kurasi studi kasus sistem enterprise/pemerintahan beserta proyek fullstack open-source dengan pemisahan repositori frontend dan backend.',
      noLiveDemoPolicyNote:
        'Catatan Rilis: Studi kasus enterprise terikat kebijakan internal/NDA, sedangkan proyek open-source difokuskan pada transparansi kode sumber melalui repositori GitHub terverifikasi.',
      filterLegend: 'Saring karya berdasarkan domain atau teknologi',
      searchLabel: 'Cari kata kunci teknologi atau nama proyek',
      searchPlaceholder: 'Filter kata kunci (mis. GIN, Microservice, Sanctum)...',
      filters: [
        { id: 'all', label: 'Semua' },
        { id: 'enterprise', label: 'Enterprise & Pemerintahan' },
        { id: 'golang', label: 'Golang' },
        { id: 'laravel', label: 'Laravel' },
        { id: 'react-next', label: 'React / Next.js' },
        { id: 'vue-svelte', label: 'Vue.js' },
        { id: 'postgres-redis', label: 'PostgreSQL / Redis' },
      ],
      countTemplate: 'Menampilkan {shown} dari {total} karya terkurasi',
      emptyStateTitle: 'Tidak ada karya yang cocok dengan filter "{filter}".',
      emptyStateReset: 'Reset Filter',
      enterpriseGroupTitle: 'A. Studi Kasus Enterprise & Pemerintahan',
      enterpriseGroupSubtitle:
        'Konteks masalah operasional dan rancangan solusi teknis pada sistem produksi korporasi serta instansi pemerintah.',
      fullstackGroupTitle: 'B. Proyek Fullstack Open-Source Unggulan',
      fullstackGroupSubtitle:
        'Implementasi arsitektur terpisah antara klien SPA dan layanan API dengan kode sumber publik yang dapat diaudit.',
      contextHeading: 'Konteks & Tantangan',
      architectureHeading: 'Solusi Arsitektur & Kontribusi',
      privateArchitectureBadge: 'Sistem Internal / NDA (Tanpa Repo Publik)',
      items: [
        {
          id: 'bri-banking-services',
          index: '02.1',
          group: 'enterprise',
          title: 'BRI Banking Services Ecosystem',
          subtitle: 'Pengembangan layanan perbankan terdistribusi dan antarmuka web modern',
          period: '2026 - Sekarang',
          organization: 'PT Bank Rakyat Indonesia (Persero) Tbk (BRI)',
          roleLabel: 'Fullstack Developer',
          provenance: 'Dikonfirmasi Pemilik Profil',
          problemContext:
            'Layanan digital perbankan menuntut pemisahan tanggung jawab antar-layanan yang tegas, konsistensi penyimpanan relasional, serta waktu baca yang cepat pada beban akses tinggi.',
          architectureSolution:
            'Mengembangkan layanan backend menggunakan pola Golang Microservice yang terhubung dengan database MySQL dan lapisan caching Redis, dipadukan dengan antarmuka aplikasi berbasis Next.js.',
          stack: ['Golang Microservice', 'MySQL', 'Next.js', 'Redis'],
          filterTags: ['enterprise', 'golang', 'react-next', 'postgres-redis'],
          repos: [],
        },
        {
          id: 'mediawatch-bappenas',
          index: '02.2',
          group: 'enterprise',
          title: 'MediaWatch Bappenas: Media Monitoring & News Analytics',
          subtitle: 'Platform pemantauan berita nasional dengan pencarian teks penuh berindeks GIN',
          period: 'Agu - Des 2025',
          organization: 'Kementerian PPN/Bappenas',
          roleLabel: 'Solo Full-Stack Developer',
          provenance: 'Terverifikasi CV & GitHub',
          problemContext:
            'Tim analisis membutuhkan pencarian multi-kata kunci yang presisi di atas ribuan arsip berita, lengkap dengan pelacakan sentimen, pemetaan narasumber, dan pengolahan laporan Excel.',
          architectureSolution:
            'Merancang arsitektur Laravel REST API + SPA Vue.js (Pinia, Vuetify) dengan PostgreSQL Full-Text Search (relevance ranking, highlighted snippets, GIN Indexing), RBAC berbasis Laravel Sanctum, serta modul impor/ekspor Excel.',
          stack: [
            'Laravel',
            'Vue.js',
            'Vuetify',
            'Pinia',
            'Laravel Sanctum',
            'PostgreSQL Full-Text Search',
            'GIN Indexing',
            'REST API',
          ],
          filterTags: ['enterprise', 'laravel', 'vue-svelte', 'postgres-redis'],
          repos: [
            {
              label: 'Repo GitHub (mediawatch-bappenas)',
              url: 'https://github.com/anggavb/mediawatch-bappenas',
            },
          ],
        },
        {
          id: 'fif-lms',
          index: '02.3',
          group: 'enterprise',
          title: 'FIF Learning Management System (LMS)',
          subtitle: 'Sistem pelatihan korporat, penganggaran, dan persetujuan berjenjang',
          period: '2022 - 2026',
          organization: 'PT Centrinova Solusi Edukasi',
          roleLabel: 'Fullstack Developer',
          provenance: 'Terverifikasi CV',
          problemContext:
            'Penyelenggaraan pelatihan berskala korporasi membutuhkan kontrol pagu anggaran yang ketat, persetujuan berlapis lintas jabatan, serta evaluasi pasca-pelatihan yang terdokumentasi.',
          architectureSolution:
            'Mengembangkan modul manajemen anggaran pelatihan, mesin workflow persetujuan multi-level, dashboard pelaporan manajerial, dan instrumen evaluasi karyawan menggunakan Laravel, Vue.js, dan PostgreSQL/MySQL.',
          stack: ['Laravel', 'Vue.js', 'PostgreSQL', 'MySQL', 'REST API'],
          filterTags: ['enterprise', 'laravel', 'vue-svelte', 'postgres-redis'],
          repos: [],
        },
        {
          id: 'hrultra-uob-danamon-kuizu',
          index: '02.4',
          group: 'enterprise',
          title: 'HRULTRA / UOB HR Platform & Danamon KUIZU Admin',
          subtitle: 'Modul keterlibatan SDM perbankan, optimasi legacy, dan panel admin RBAC',
          period: '2022 - 2026',
          organization: 'PT Centrinova Solusi Edukasi',
          roleLabel: 'Fullstack Developer',
          provenance: 'Terverifikasi CV',
          problemContext:
            'Platform SDM dan gamifikasi internal perbankan membutuhkan perluasan fitur interaktif tanpa mengganggu stabilitas modul legacy yang sudah berjalan di produksi.',
          architectureSolution:
            'Membangun fitur survei NPS, reservasi ruang rapat, dan engagement karyawan pada HRULTRA/UOB, merancang panel admin manajemen peran & integrasi gim Danamon KUIZU, serta mengoptimasi query lambat pada kode legacy.',
          stack: ['Laravel', 'Vue.js', 'PostgreSQL', 'MySQL', 'REST API', 'RBAC'],
          filterTags: ['enterprise', 'laravel', 'vue-svelte', 'postgres-redis'],
          repos: [],
        },
        {
          id: 'bappenas-cms-2045-sso',
          index: '02.5',
          group: 'enterprise',
          title: 'Bappenas Official CMS, Indonesia 2045 & SSO Gateway',
          subtitle: 'Portal publik pemerintahan, validasi UAT, dan strategi integrasi akses tunggal',
          period: '2021 - 2025',
          organization: 'Kementerian PPN/Bappenas (Pusdatinrenbang)',
          roleLabel: 'Web Developer & Application Administrator',
          provenance: 'Terverifikasi CV',
          problemContext:
            'Portal publik kementerian menuntut tata kelola publikasi berita multi-peran yang tertib serta penyelarasan alur autentikasi lintas aplikasi internal.',
          architectureSolution:
            'Mengembangkan modul manajemen artikel, kategori, dan tagging berbasis peran pada CMS resmi Bappenas, memvalidasi alur publikasi portal Indonesia 2045 pada tahap UAT, dan berkontribusi dalam rancangan integrasi SSO Gateway.',
          stack: ['Laravel / PHP CMS', 'RBAC', 'SSO Architecture', 'MySQL / PostgreSQL'],
          filterTags: ['enterprise', 'laravel'],
          repos: [],
        },
        {
          id: 'tickitz',
          index: '02.6',
          group: 'fullstack',
          title: 'Tickitz: Online Movie Ticket Booking Platform',
          subtitle: 'Kepemimpinan tim 4 developer pada sistem pemesanan kursi bioskop dan tiket QR',
          period: 'Jun 2026',
          organization: 'Koda Tech Academy',
          roleLabel: 'Team Lead & Fullstack Developer',
          provenance: 'Terverifikasi CV & GitHub',
          problemContext:
            'Pemesanan tiket sinema memerlukan sinkronisasi ketersediaan peta kursi, manajemen pesanan tertunda (pending order), pembuatan tiket QR, dan koordinasi kontrak API ketat antar 4 anggota tim.',
          architectureSolution:
            'Memimpin pembagian tugas dan integrasi frontend React.js (Redux Toolkit, React Hook Form) dengan backend Golang Gin, PostgreSQL, Redis caching, autentikasi JWT, migrasi/seeder terotomasi, Docker, dan Swagger.',
          stack: [
            'Golang',
            'Gin',
            'React.js',
            'Vite',
            'Redux Toolkit',
            'React Hook Form',
            'Tailwind CSS',
            'PostgreSQL',
            'Redis',
            'JWT',
            'Docker',
            'Swagger',
          ],
          filterTags: ['golang', 'react-next', 'postgres-redis'],
          repos: [
            {
              label: 'Frontend (tickitz-frontend)',
              url: 'https://github.com/anggavb/tickitz-frontend',
            },
            {
              label: 'Backend (tickitz-backend)',
              url: 'https://github.com/anggavb/tickitz-backend',
            },
          ],
        },
        {
          id: 'shortlink',
          index: '02.7',
          group: 'fullstack',
          title: 'ShortLink: High-Throughput URL Shortener',
          subtitle: 'Pemendek tautan kustom dengan resolusi cepat Redis dan analitik klik',
          period: 'Jun 2026',
          organization: 'Koda Tech Academy',
          roleLabel: 'Fullstack Developer',
          provenance: 'Terverifikasi CV & GitHub',
          problemContext:
            'Layanan redirect URL memiliki rasio baca jauh lebih tinggi dibanding tulis, sehingga pembacaan langsung ke database relasional pada setiap klik akan menciptakan bottleneck latensi.',
          architectureSolution:
            'Mengimplementasikan lapisan caching Redis pada endpoint resolusi slug di Golang Gin untuk memangkas beban baca PostgreSQL, dilengkapi fitur custom slug, soft delete, paginasi pencarian, analitik klik, dan dashboard JWT di React.js.',
          stack: [
            'Golang',
            'Gin',
            'React.js',
            'Vite',
            'Redux',
            'Tailwind CSS',
            'PostgreSQL',
            'Redis',
            'Docker',
            'Swagger',
          ],
          filterTags: ['golang', 'react-next', 'postgres-redis'],
          repos: [
            {
              label: 'Frontend (shortlink-frontend)',
              url: 'https://github.com/anggavb/shortlink-frontend',
            },
            {
              label: 'Backend (shortlink-backend)',
              url: 'https://github.com/anggavb/shortlink-backend',
            },
          ],
        },
        {
          id: 'kasvior',
          index: '02.8',
          group: 'fullstack',
          title: 'Kasvior: Digital E-Wallet Web Application',
          subtitle: 'Aplikasi dompet digital dengan alur transfer saldo dan riwayat transaksi',
          period: 'Mar - Mei 2026',
          organization: 'Koda Tech Academy',
          roleLabel: 'Fullstack Developer',
          provenance: 'Terverifikasi CV & GitHub',
          problemContext:
            'Aplikasi dompet digital membutuhkan alur mutasi saldo, kirim/terima dana, serta pencatatan riwayat transaksi yang konsisten dengan respons antarmuka yang ringkas.',
          architectureSolution:
            'Membangun REST API modular menggunakan Golang Gin, PostgreSQL (dengan workflow migrasi & seeder), serta optimasi Redis pada pembacaan data terpilih, dipasangkan dengan SPA responsif berbasis React.js, Redux/Zustand, dan Tailwind CSS.',
          stack: [
            'Golang',
            'Gin',
            'React.js',
            'Vite',
            'Redux',
            'Zustand',
            'Tailwind CSS',
            'PostgreSQL',
            'Redis',
            'Docker',
          ],
          filterTags: ['golang', 'react-next', 'postgres-redis'],
          repos: [
            {
              label: 'Frontend (kasvior-wallet-app)',
              url: 'https://github.com/anggavb/kasvior-wallet-app',
            },
            {
              label: 'Backend (kasvior-wallet-backend)',
              url: 'https://github.com/anggavb/kasvior-wallet-backend',
            },
          ],
        },
      ],
    },
    lab: {
      sectionIndex: '03 / LABORATORIUM & TELEMETRI GITHUB',
      title: 'Eksplorasi Rekayasa & Aktivitas Publik',
      subtitle:
        'Eksperimen lintas runtime modern (Bun, ElysiaJS, Svelte, Python, Golang) serta ringkasan repositori non-fork terbaru dari akun GitHub @anggavb.',
      explorationsHeading: 'Eksplorasi Teknis Terkurasi',
      telemetryHeading: 'Telemetri Publik GitHub (@anggavb)',
      telemetrySubheading:
        'Disinkronkan saat build dan diperbarui secara hemat kuota dengan batas TTL 60 menit.',
      publicReposLabel: 'Repositori Publik',
      followersLabel: 'Pengikut',
      syncedAtLabel: 'Sinkronisasi Terakhir',
      recentNonForkHeading: 'Repositori Non-Fork Terbaru (Urutan Push)',
      noDescriptionLabel: 'Belum ada deskripsi singkat pada repositori ini.',
      unavailableTitle: 'Data aktivitas GitHub belum tersedia',
      unavailableBody:
        'Snapshot telemetri publik belum dapat dimuat saat ini. Seluruh kode sumber tetap dapat diakses langsung melalui profil GitHub resmi.',
      viewGitHubProfileCta: 'Buka github.com/anggavb',
      syncingStatusLabel: 'Memeriksa pembaruan GitHub...',
      cachedStatusLabel: 'Snapshot Terverifikasi',
      explorations: [
        {
          index: 'L.01',
          title: 'YouTube Comment Priority System',
          summary:
            'Eksplorasi arsitektur pemeringkatan prioritas komentar menggunakan runtime Bun, framework ElysiaJS, Drizzle ORM di atas PostgreSQL 16, dan antarmuka Svelte bertipe ketat.',
          stack: ['Bun', 'ElysiaJS', 'Drizzle ORM', 'PostgreSQL 16', 'TypeScript', 'Svelte'],
          repos: [
            { label: 'yt-comment-priority-be', url: 'https://github.com/anggavb/yt-comment-priority-be' },
            { label: 'yt-comment-priority-fe', url: 'https://github.com/anggavb/yt-comment-priority-fe' },
          ],
        },
        {
          index: 'L.02',
          title: 'Wrapped Weekly',
          summary:
            'Aplikasi rekapitulasi mingguan fullstack yang memadukan layanan backend Golang dengan frontend Next.js dan TypeScript.',
          stack: ['Next.js', 'TypeScript', 'Golang'],
          repos: [
            { label: 'wrapped-weekly', url: 'https://github.com/anggavb/wrapped-weekly' },
            {
              label: 'wrapped-weekly-backend',
              url: 'https://github.com/anggavb/wrapped-weekly-backend',
            },
          ],
        },
        {
          index: 'L.03',
          title: 'Tabunganku',
          summary:
            'Eksplorasi aplikasi pencatatan dan pengelolaan target tabungan personal berbasis Svelte, TypeScript, dan layanan Python.',
          stack: ['Svelte', 'TypeScript', 'Python'],
          repos: [{ label: 'tabunganku', url: 'https://github.com/anggavb/tabunganku' }],
        },
        {
          index: 'L.04',
          title: 'Huawei Technical Test & Automation',
          summary:
            'Implementasi modular skrip pengujian teknis, otomasi alur verifikasi, dan dokumentasi evaluasi sistem.',
          stack: ['Automation', 'System Testing', 'Modular Scripting'],
          repos: [{ label: 'huawei-automation', url: 'https://github.com/anggavb/huawei-automation' }],
        },
        {
          index: 'L.05',
          title: 'Agentic AI Skills',
          summary:
            'Kumpulan definisi instruksi terstruktur dan otomasi workflow untuk asisten rekayasa perangkat lunak berbasis AI menggunakan Python dan Markdown.',
          stack: ['Python', 'Markdown', 'AI Agent Workflows'],
          repos: [{ label: 'agent-skills', url: 'https://github.com/anggavb/agent-skills' }],
        },
      ],
    },
    skills: {
      sectionIndex: '04 / MATRIKS SPESIFIKASI TEKNIS',
      title: 'Keahlian & Kapabilitas Arsitektur',
      subtitle:
        'Daftar perangkat teknologi yang digunakan dalam proyek produksi dan laboratorium rekayasa, dikelompokkan berdasarkan lapisan tanggung jawab sistem tanpa angka persentase subjektif.',
      categories: [
        {
          index: 'S.01',
          category: 'Backend & Distributed Systems',
          focusNote: 'Layanan API modular, microservices, dan kontrak antar-layanan',
          items: [
            'Golang',
            'Gin-Gonic',
            'Microservices Architecture',
            'Laravel',
            'Express.js',
            'ElysiaJS',
            'REST API',
            'gRPC',
            'Clean Architecture',
          ],
        },
        {
          index: 'S.02',
          category: 'Frontend & UI Engineering',
          focusNote: 'Aplikasi SPA/SSR modern, manajemen state, dan aksesibilitas WCAG AA',
          items: [
            'React.js',
            'Next.js',
            'Vue.js (Pinia, Vuetify)',
            'Astro',
            'Svelte',
            'TypeScript',
            'JavaScript (ES6+)',
            'Redux Toolkit',
            'Zustand',
            'Tailwind CSS',
            'Responsive & Accessible Design',
          ],
        },
        {
          index: 'S.03',
          category: 'Database, Search & Caching',
          focusNote: 'Pemodelan relasional, pencarian teks penuh, dan optimasi query',
          items: [
            'PostgreSQL (Full-Text Search, GIN Indexing)',
            'MySQL',
            'Redis',
            'SQL Query Optimization',
            'Drizzle ORM',
            'Eloquent',
            'Sequelize',
          ],
        },
        {
          index: 'S.04',
          category: 'DevOps & Infrastructure',
          focusNote: 'Kontainerisasi layanan, otomasi pipeline, dan administrasi server Linux',
          items: [
            'Docker',
            'Dockerfile',
            'Docker Compose',
            'GitHub Actions (CI/CD)',
            'NGINX',
            'Linux CLI',
            'Database Migration & Seeder',
          ],
        },
        {
          index: 'S.05',
          category: 'Security, Testing & Quality',
          focusNote: 'Otorisasi berlapis, pengujian kontrak API, dan pemeliharaan sistem legacy',
          items: [
            'JWT',
            'PASETO',
            'OAuth',
            'Role-Based Access Control (RBAC)',
            'Input Validation',
            'CORS',
            'HTTPS',
            'Go Test',
            'Swagger / OpenAPI',
            'Postman',
            'Legacy Codebase Refactoring',
          ],
        },
      ],
    },
    education: {
      sectionIndex: '05 / PENDIDIKAN FORMAL & INTENSIF',
      title: 'Riwayat Pendidikan',
      subtitle: 'Fondasi akademik sistem informasi dan pelatihan rekayasa perangkat lunak intensif.',
      items: [
        {
          institution: 'Universitas Esa Unggul',
          degree: 'S1 Sistem Informasi (Bachelor of Information Systems)',
          period: '2023 - Estimasi Lulus 2026',
          location: 'Kebon Jeruk, Jakarta',
          details: [
            'Fokus pada rekayasa sistem informasi enterprise, pemodelan basis data, dan tata kelola proses bisnis digital.',
          ],
        },
        {
          institution: 'Koda Tech Academy',
          degree: 'Fullstack Web Developer Intensive Program',
          period: 'Feb 2026 - Jun 2026',
          location: 'Bogor, Jawa Barat',
          details: [
            'Frontend: React.js, Redux Toolkit, Zustand, React Router, Tailwind CSS.',
            'Backend & DevOps: Golang, Gin-Gonic, PostgreSQL, Redis, Git, Docker, SSH, CI/CD, Database Migration & Seeder.',
          ],
        },
        {
          institution: 'Politeknik LP3I Jakarta',
          degree: 'D3 Manajemen Informatika (Diploma in Computer Informatics)',
          period: '2015 - 2018',
          location: 'Kampus Bogor, Jawa Barat',
          details: [
            'Mempelajari dasar pemrograman aplikasi bisnis, administrasi jaringan, dan perancangan basis data relasional.',
          ],
        },
      ],
      certificationsTitle: 'Sertifikasi & Lisensi',
      recommendationsTitle: 'Rekomendasi Profesional',
      certifications: [],
      recommendations: [],
    },
    contact: {
      sectionIndex: '06 / KONTAK & KOLABORASI',
      title: 'Diskusi Teknis & Peluang Kolaborasi',
      subtitle:
        'Terbuka untuk diskusi peran Fullstack / Backend Engineer, kolaborasi arsitektur sistem web, maupun konsultasi pengembangan produk.',
      directChannelsHeading: 'Kanal Komunikasi Langsung',
      directChannelsBody:
        'Gunakan tombol salin email untuk menghubungi langsung dari klien surat pilihan Anda, atau terhubung melalui profil profesional terverifikasi di bawah ini.',
      emailLabel: 'Surat Elektronik Utama',
      copyEmailButton: 'Salin Alamat Email',
      emailCopiedFeedback: 'Alamat anggavb8@gmail.com berhasil disalin ke papan klip.',
      copyFailedFeedback: 'Gagal menyalin otomatis. Silakan salin manual: anggavb8@gmail.com',
      sendMailtoButton: 'Buka Aplikasi Email',
      linkedinLabel: 'Profil LinkedIn',
      githubLabel: 'Profil GitHub',
      phoneLabel: 'Telepon / WhatsApp',
      formHeading: 'Kirim Pesan Langsung',
      formIntro:
        'Draf ketikan Anda tersimpan otomatis selama sesi ini agar tidak hilang apabila koneksi jaringan terputus.',
      requiredNote: 'Semua kolom bertanda bintang (*) wajib diisi.',
      fields: {
        nameLabel: 'Nama Lengkap *',
        nameHint: '2 sampai 100 karakter.',
        namePlaceholder: 'Contoh: Budi Santoso',
        emailLabel: 'Alamat Email Balasan *',
        emailHint: 'Format email aktif ( contoh: nama@perusahaan.co.id ).',
        emailPlaceholder: 'budi@perusahaan.co.id',
        subjectLabel: 'Subjek Diskusi *',
        subjectHint: '3 sampai 120 karakter (mis. Peluang Peran Fullstack Engineer).',
        subjectPlaceholder: 'Peluang Kolaborasi / Rekrutmen Engineering',
        messageLabel: 'Rincian Pesan *',
        messageHint: '20 sampai 2.000 karakter. Jelaskan konteks proyek, peran, atau jadwal diskusi.',
        messagePlaceholder:
          'Halo Angga, kami ingin mendiskusikan kebutuhan pengembangan layanan web...',
        honeypotLabel: 'Jangan isi kolom ini bila Anda manusia',
      },
      validation: {
        nameLength: 'Nama wajib diisi antara 2 hingga 100 karakter.',
        emailInvalid: 'Masukkan alamat email yang valid (maksimal 254 karakter).',
        subjectLength: 'Subjek wajib diisi antara 3 hingga 120 karakter.',
        messageLength: 'Pesan wajib diisi antara 20 hingga 2.000 karakter.',
      },
      submitButton: 'Kirim Pesan',
      submittingButton: 'Mengirim Pesan...',
      cooldownButtonTemplate: 'Terkirim (Tunggu {seconds}d)',
      unconfiguredTitle: 'Konfigurasi formulir belum aktif',
      unconfiguredBody:
        'Endpoint pengiriman langsung sedang menunggu pemasangan ID formulir aktif pada environment produksi. Silakan hubungi langsung melalui tombol Salin Alamat Email atau tautan aplikasi email di samping.',
      successTitle: 'Pesan berhasil dikirim',
      successBody:
        'Terima kasih. Pesan Anda telah diterima oleh layanan formulir dan diteruskan ke kotak masuk Angga VB.',
      validationSummaryError:
        'Mohon periksa kembali kolom yang ditandai sebelum mengirim ulang pesan.',
      rateLimitError:
        'Batas laju pengiriman tercapai (HTTP 429). Draf Anda tetap aman di formulir. Silakan tunggu sejenak atau gunakan tombol Salin Alamat Email.',
      deliveryFailedTitle: 'Pengiriman langsung belum berhasil',
      deliveryFailedBody:
        'Permintaan gagal diselesaikan akibat kendala jaringan atau layanan penerima. Draf pesan Anda tetap tersimpan utuh di bawah dan dapat langsung disalin atau dikirim via aplikasi email.',
      copyDraftButton: 'Salin Isi Draf Pesan',
      draftCopiedFeedback: 'Isi draf pesan berhasil disalin ke papan klip.',
      openPrefilledMailtoButton: 'Kirim Draf via Aplikasi Email',
    },
    footer: {
      copyrightText: 'Angga VB. Seluruh konten diverifikasi terhadap CV, GitHub publik, dan konfirmasi pemilik profil.',
      architectureNote: 'Dibangun statis dengan Astro, Tailwind CSS v4, dan TypeScript ketat.',
      timezoneNote: 'Tema otomatis disinkronkan ke waktu standar Indonesia Barat (UTC+7).',
    },
  },
  en: {
    locale: 'en',
    htmlLang: 'en',
    ogLocale: 'en_US',
    ogLocaleAlternate: 'id_ID',
    canonicalUrl: 'https://anggavb.my.id/en/',
    alternateUrl: 'https://anggavb.my.id/id/',
    seo: {
      title: 'Angga VB | Fullstack Software Engineer (Golang, Next.js, Laravel, PostgreSQL)',
      description:
        'Software engineering portfolio of Angga VB, a Fullstack Developer with 5+ years of production experience across banking microservices (BRI), enterprise platforms, and government systems.',
      jobTitle: 'Fullstack Developer',
      knowsAbout: [
        'Golang',
        'Microservices',
        'Gin-Gonic',
        'Next.js',
        'React.js',
        'Laravel',
        'Vue.js',
        'PostgreSQL Full-Text Search',
        'MySQL',
        'Redis',
        'Docker',
      ],
    },
    a11y: {
      skipToContent: 'Skip to main content',
      primaryNavigation: 'Primary section navigation',
      mobileNavigationTitle: 'Page Navigation Index',
      openMenuButton: 'Menu',
      closeMenuButton: 'Close',
      languageSwitcherLabel: 'Select page language',
      themeSwitcherLabel: 'Switch display color theme',
      externalRepoNotice: '(opens GitHub repository in a new tab)',
    },
    header: {
      brandName: 'ANGGA VB',
      brandRole: 'Fullstack Engineer',
      nav: [
        { id: 'experience', href: '#experience', label: '01 Experience' },
        { id: 'projects', href: '#projects', label: '02 Works' },
        { id: 'github-lab', href: '#github-lab', label: '03 Lab' },
        { id: 'tech-stack', href: '#tech-stack', label: '04 Specs' },
        { id: 'education', href: '#education', label: '05 Education' },
        { id: 'contact', href: '#contact', label: '06 Contact' },
      ],
      certificationsNavLabel: 'Certifications',
      recommendationsNavLabel: 'Recommendations',
      downloadCvShort: 'Download CV',
      themeAuto: 'Auto UTC+7',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeCycleHint: 'Cycle theme mode: Auto UTC+7, Light, Dark',
    },
    hero: {
      sectionIndex: '00 / EXECUTIVE PROFILE',
      eyebrow: 'JAKARTA, INDONESIA // FULLSTACK SYSTEMS ENGINEERING',
      currentStatusLabel: 'CURRENT ROLE',
      currentRoleText: 'Fullstack Developer at PT Bank Rakyat Indonesia (Persero) Tbk (BRI)',
      currentRoleProvenance: 'Owner-Confirmed',
      headline:
        'Engineering banking microservices, enterprise web platforms, and production government systems.',
      subheadline:
        'Fullstack Software Engineer with 5+ years of hands-on experience designing modular backend services, tuning relational databases and Redis caching layers, and shipping maintainable web interfaces with Golang, Next.js, React.js, Laravel, and Vue.js.',
      primaryCta: 'Explore Case Studies & Projects',
      secondaryCta: 'Download CV (PDF)',
      locationLabel: 'Base: Jakarta, ID (UTC+7)',
      experienceYearsLabel: 'Track Record: 5+ Years in Production',
      coreStackLabel: 'Core Stack: Golang, Next.js, Laravel, PostgreSQL, MySQL, Redis',
      pillars: [
        {
          index: 'P.01',
          title: 'Backend & Microservices',
          stack: 'Golang / Gin / Laravel / REST & gRPC',
          summary:
            'Designing modular service boundaries, JWT/Sanctum/RBAC authorization flows, and targeted performance refactoring for high-traffic legacy systems.',
        },
        {
          index: 'P.02',
          title: 'Modern Frontend Systems',
          stack: 'Next.js / React.js / Vue.js / Astro / Tailwind CSS',
          summary:
            'Building multi-module operational workflows, analytics dashboards, and accessible responsive interfaces engineered for long-term team velocity.',
        },
        {
          index: 'P.03',
          title: 'Data, Search & Caching',
          stack: 'PostgreSQL FTS & GIN / MySQL / Redis / Docker',
          summary:
            'Relational query tuning, GIN-indexed full-text search ranking, low-latency Redis caching strategies, and reproducible Docker migration pipelines.',
        },
      ],
    },
    experience: {
      sectionIndex: '01 / CAREER CHRONOLOGY',
      title: 'Professional Experience',
      subtitle:
        'Production engineering track record spanning national banking services, corporate enterprise platforms, central government ministries, and healthcare operations.',
      currentBadge: 'Active / Present',
      items: [
        {
          index: '01.1',
          company: 'PT Bank Rakyat Indonesia (Persero) Tbk (BRI)',
          role: 'Fullstack Developer',
          period: 'Jul 2026 - Present',
          location: 'Jakarta, Indonesia',
          isCurrent: true,
          provenance: 'Owner-Confirmed',
          summary:
            'Developing and maintaining banking web applications and distributed backend services focused on transactional reliability, fast data retrieval, and modern web interfaces.',
          highlights: [
            'Building and integrating backend services on a Golang Microservice architecture backed by MySQL relational storage and Redis caching.',
            'Delivering web frontend modules in Next.js aligned with internal banking service API contracts.',
          ],
          stack: ['Golang Microservice', 'MySQL', 'Next.js', 'Redis'],
        },
        {
          index: '01.2',
          company: 'Koda Tech Academy',
          role: 'Fullstack Developer Trainee',
          period: 'Feb 2026 - Jun 2026',
          location: 'Onsite - Bogor, West Java',
          provenance: 'CV Verified',
          summary:
            'Completed an intensive production-oriented fullstack engineering program with technical team leadership across Golang, Gin, React.js, PostgreSQL, Redis, and Docker.',
          highlights: [
            'Led a 4-developer team as Team Lead on Tickitz to ship the complete booking platform in under one month, coordinating scope, task allocation, and frontend/backend integration.',
            'Engineered ShortLink (high-throughput URL shortener with Redis-cached slug resolution and click analytics) and Kasvior (digital wallet supporting JWT auth and peer-to-peer balance transfers).',
            'Standardized database migrations, seeders, and Swagger/OpenAPI specifications to keep API contracts verifiable across services.',
          ],
          stack: [
            'Golang',
            'Gin',
            'React.js',
            'Vite',
            'Redux Toolkit',
            'Zustand',
            'Tailwind CSS',
            'PostgreSQL',
            'Redis',
            'Docker',
            'Swagger',
          ],
        },
        {
          index: '01.3',
          company: 'PT Centrinova Solusi Edukasi',
          role: 'Fullstack Developer',
          period: 'Feb 2022 - Feb 2026',
          location: 'Hybrid - Jakarta',
          provenance: 'CV Verified',
          summary:
            'Built, maintained, and optimized multi-tenant enterprise web applications for financial institutions, banking HR teams, and corporate training divisions.',
          highlights: [
            'Delivered core modules for FIF Learning Management System (LMS), including training budget controls, multi-level approval workflows, management reporting, and employee evaluations.',
            'Built Net Promoter Score (NPS), room booking, and employee engagement modules for HRULTRA / UOB HR Platform while resolving legacy module performance bottlenecks.',
            'Developed Danamon KUIZU admin panel workflows for user administration, role-based access control, and game service integration alongside the game engineering team.',
            'Refactored legacy application bottlenecks and tuned PostgreSQL/MySQL queries to improve production stability and response latency.',
          ],
          stack: ['Laravel', 'Vue.js', 'PostgreSQL', 'MySQL', 'REST API'],
        },
        {
          index: '01.4',
          company: 'Ministry of National Development Planning / Bappenas (incl. MediaWatch Bappenas)',
          role: 'Web Developer & Application Administrator / Solo Full-Stack Developer',
          period: 'Feb 2021 - Dec 2025',
          location: 'Onsite - Kuningan, Jakarta',
          provenance: 'CV & GitHub Verified',
          summary:
            'Collaborated with the Pusdatinrenbang Division to maintain public-facing government web platforms and internal systems, and solo-engineered the MediaWatch Bappenas analytics platform (Aug - Dec 2025).',
          highlights: [
            'Built and enhanced CMS modules on the official Bappenas portal covering article publishing, category taxonomy, tagging, and role-based news administration.',
            'Solo-architected MediaWatch Bappenas using PostgreSQL Full-Text Search with multi-keyword relevance ranking, highlighted snippets, GIN Indexing, sentiment/speaker tracking, and Excel import/export.',
            'Supported Indonesia 2045 portal User Acceptance Testing (UAT) and contributed to SSO Gateway architecture discussions for cross-application authentication.',
          ],
          stack: [
            'Laravel',
            'Vue.js',
            'Vuetify',
            'Pinia',
            'Laravel Sanctum',
            'PostgreSQL Full-Text Search',
            'GIN Indexing',
            'REST API',
          ],
        },
        {
          index: '01.5',
          company: 'PT Medika Solusi Pratamajaya',
          role: 'Web Developer',
          period: 'Jan 2020 - Feb 2021',
          location: 'Onsite - Bogor, West Java',
          provenance: 'CV Verified',
          summary:
            'Developed end-to-end healthcare operational web applications supporting daily clinical and administrative data workflows.',
          highlights: [
            'Built core operational modules for healthcare data management, input validation, and periodic reporting using Laravel, MySQL, jQuery, and REST APIs.',
            'Optimized MySQL queries and backend processing logic to improve responsiveness and eliminate recurring operational issues.',
          ],
          stack: ['Laravel', 'MySQL', 'jQuery', 'REST API'],
        },
        {
          index: '01.6',
          company: 'PT Exa Mitra Solusi',
          role: 'IT Support & Internal Application Developer',
          period: 'Nov 2018 - Dec 2019',
          location: 'Onsite - Kedoya, Jakarta',
          provenance: 'CV Verified',
          summary:
            'Built internal workflow tooling for credit card application processing while supporting daily IT operations for business teams.',
          highlights: [
            'Developed an internal credit card submission and multi-stage approval workflow application using CodeIgniter, JavaScript, and MySQL.',
            'Implemented structured form validation and submission status tracking to improve data accuracy and reduce manual handling.',
          ],
          stack: ['CodeIgniter', 'JavaScript', 'MySQL'],
        },
      ],
    },
    works: {
      sectionIndex: '02 / CASE STUDIES & PROJECTS',
      title: 'Selected Works & System Architecture',
      subtitle:
        'Curated enterprise and government architecture highlights paired with open-source fullstack projects featuring dedicated frontend and backend repositories.',
      noLiveDemoPolicyNote:
        'Release Note: Enterprise engagements operate under internal/NDA policies, while open-source projects prioritize direct source-code inspection via verified GitHub repositories.',
      filterLegend: 'Filter works by domain or technology stack',
      searchLabel: 'Search technology keyword or project title',
      searchPlaceholder: 'Filter by keyword (e.g. GIN, Microservice, Sanctum)...',
      filters: [
        { id: 'all', label: 'All' },
        { id: 'enterprise', label: 'Enterprise & Government' },
        { id: 'golang', label: 'Golang' },
        { id: 'laravel', label: 'Laravel' },
        { id: 'react-next', label: 'React / Next.js' },
        { id: 'vue-svelte', label: 'Vue.js' },
        { id: 'postgres-redis', label: 'PostgreSQL / Redis' },
      ],
      countTemplate: 'Showing {shown} of {total} curated works',
      emptyStateTitle: 'No works match the active filter "{filter}".',
      emptyStateReset: 'Reset Filter',
      enterpriseGroupTitle: 'A. Enterprise & Government Architecture Highlights',
      enterpriseGroupSubtitle:
        'Operational problem context and architectural implementation across corporate and public-sector production systems.',
      fullstackGroupTitle: 'B. Featured Open-Source Fullstack Projects',
      fullstackGroupSubtitle:
        'Decoupled SPA client and API service implementations backed by auditable public GitHub repositories.',
      contextHeading: 'Problem Context',
      architectureHeading: 'Architectural Solution & Contribution',
      privateArchitectureBadge: 'Internal / NDA System (No Public Repo)',
      items: [
        {
          id: 'bri-banking-services',
          index: '02.1',
          group: 'enterprise',
          title: 'BRI Banking Services Ecosystem',
          subtitle: 'Distributed banking microservices and modern web application delivery',
          period: '2026 - Present',
          organization: 'PT Bank Rakyat Indonesia (Persero) Tbk (BRI)',
          roleLabel: 'Fullstack Developer',
          provenance: 'Owner-Confirmed',
          problemContext:
            'Banking digital services require clear service isolation, dependable relational persistence, and low-latency read paths under concurrent workload demands.',
          architectureSolution:
            'Engineering backend capabilities on a Golang Microservice architecture integrated with MySQL storage and Redis caching, paired with modern Next.js web interfaces.',
          stack: ['Golang Microservice', 'MySQL', 'Next.js', 'Redis'],
          filterTags: ['enterprise', 'golang', 'react-next', 'postgres-redis'],
          repos: [],
        },
        {
          id: 'mediawatch-bappenas',
          index: '02.2',
          group: 'enterprise',
          title: 'MediaWatch Bappenas: Media Monitoring & News Analytics',
          subtitle: 'National news intelligence platform powered by GIN-indexed full-text search',
          period: 'Aug - Dec 2025',
          organization: 'Ministry of National Development Planning / Bappenas',
          roleLabel: 'Solo Full-Stack Developer',
          provenance: 'CV & GitHub Verified',
          problemContext:
            'Policy analysts needed fast multi-keyword search across large news archives alongside sentiment categorization, speaker tracking, and structured Excel reporting.',
          architectureSolution:
            'Solo-engineered a modular Laravel REST API and Vue.js SPA (Pinia, Vuetify) utilizing PostgreSQL Full-Text Search (relevance ranking, highlighted snippets, GIN Indexing), Laravel Sanctum RBAC, and Excel import/export pipelines.',
          stack: [
            'Laravel',
            'Vue.js',
            'Vuetify',
            'Pinia',
            'Laravel Sanctum',
            'PostgreSQL Full-Text Search',
            'GIN Indexing',
            'REST API',
          ],
          filterTags: ['enterprise', 'laravel', 'vue-svelte', 'postgres-redis'],
          repos: [
            {
              label: 'GitHub Repo (mediawatch-bappenas)',
              url: 'https://github.com/anggavb/mediawatch-bappenas',
            },
          ],
        },
        {
          id: 'fif-lms',
          index: '02.3',
          group: 'enterprise',
          title: 'FIF Learning Management System (LMS)',
          subtitle: 'Corporate training budgeting, multi-level approvals, and evaluation workflows',
          period: '2022 - 2026',
          organization: 'PT Centrinova Solusi Edukasi',
          roleLabel: 'Fullstack Developer',
          provenance: 'CV Verified',
          problemContext:
            'Enterprise training programs require strict budget allocation tracking, hierarchical approval gates, and measurable post-training evaluation reporting.',
          architectureSolution:
            'Delivered budget management modules, multi-stage approval state machines, managerial reporting views, and training evaluation workflows using Laravel, Vue.js, and PostgreSQL/MySQL.',
          stack: ['Laravel', 'Vue.js', 'PostgreSQL', 'MySQL', 'REST API'],
          filterTags: ['enterprise', 'laravel', 'vue-svelte', 'postgres-redis'],
          repos: [],
        },
        {
          id: 'hrultra-uob-danamon-kuizu',
          index: '02.4',
          group: 'enterprise',
          title: 'HRULTRA / UOB HR Platform & Danamon KUIZU Admin',
          subtitle: 'Banking HR engagement suites, legacy query tuning, and RBAC game admin',
          period: '2022 - 2026',
          organization: 'PT Centrinova Solusi Edukasi',
          roleLabel: 'Fullstack Developer',
          provenance: 'CV Verified',
          problemContext:
            'Financial-sector HR and employee engagement platforms needed new interactive modules while remediating performance bottlenecks in long-running legacy codebases.',
          architectureSolution:
            'Shipped NPS survey, room booking, and engagement tools on HRULTRA/UOB, built role-managed admin & game integration workflows for Danamon KUIZU, and optimized slow relational queries.',
          stack: ['Laravel', 'Vue.js', 'PostgreSQL', 'MySQL', 'REST API', 'RBAC'],
          filterTags: ['enterprise', 'laravel', 'vue-svelte', 'postgres-redis'],
          repos: [],
        },
        {
          id: 'bappenas-cms-2045-sso',
          index: '02.5',
          group: 'enterprise',
          title: 'Bappenas Official CMS, Indonesia 2045 & SSO Gateway',
          subtitle: 'Government public web publishing, UAT verification, and SSO integration planning',
          period: '2021 - 2025',
          organization: 'Ministry of National Development Planning / Bappenas',
          roleLabel: 'Web Developer & Application Administrator',
          provenance: 'CV Verified',
          problemContext:
            'High-visibility ministry portals require structured role-based editorial governance and unified authentication strategy across internal government applications.',
          architectureSolution:
            'Built and enhanced official Bappenas CMS modules for article, category, and tag management, validated publishing workflows during Indonesia 2045 UAT, and contributed to SSO Gateway architecture planning.',
          stack: ['Laravel / PHP CMS', 'RBAC', 'SSO Architecture', 'MySQL / PostgreSQL'],
          filterTags: ['enterprise', 'laravel'],
          repos: [],
        },
        {
          id: 'tickitz',
          index: '02.6',
          group: 'fullstack',
          title: 'Tickitz: Online Movie Ticket Booking Platform',
          subtitle: 'Led a 4-developer team delivering interactive seat booking and QR ticketing',
          period: 'Jun 2026',
          organization: 'Koda Tech Academy',
          roleLabel: 'Team Lead & Fullstack Developer',
          provenance: 'CV & GitHub Verified',
          problemContext:
            'Cinema ticketing requires accurate seat-map availability, pending order lifecycle handling, QR ticket generation, and tight API contract coordination across a 4-person team.',
          architectureSolution:
            'Led sprint tasking and integration between a React.js SPA (Redux Toolkit, React Hook Form) and a Golang Gin backend powered by PostgreSQL, Redis, JWT auth, automated migrations/seeders, Docker, and Swagger.',
          stack: [
            'Golang',
            'Gin',
            'React.js',
            'Vite',
            'Redux Toolkit',
            'React Hook Form',
            'Tailwind CSS',
            'PostgreSQL',
            'Redis',
            'JWT',
            'Docker',
            'Swagger',
          ],
          filterTags: ['golang', 'react-next', 'postgres-redis'],
          repos: [
            {
              label: 'Frontend (tickitz-frontend)',
              url: 'https://github.com/anggavb/tickitz-frontend',
            },
            {
              label: 'Backend (tickitz-backend)',
              url: 'https://github.com/anggavb/tickitz-backend',
            },
          ],
        },
        {
          id: 'shortlink',
          index: '02.7',
          group: 'fullstack',
          title: 'ShortLink: High-Throughput URL Shortener',
          subtitle: 'Custom-slug link management accelerated by Redis caching and click analytics',
          period: 'Jun 2026',
          organization: 'Koda Tech Academy',
          roleLabel: 'Fullstack Developer',
          provenance: 'CV & GitHub Verified',
          problemContext:
            'Short-link redirection workloads are heavily read-skewed, where hitting relational storage on every redirect introduces avoidable latency.',
          architectureSolution:
            'Integrated Redis look-aside caching inside the Golang Gin redirect pipeline to offload PostgreSQL reads, paired with custom slugs, soft deletes, search pagination, click analytics, and a JWT-protected React.js dashboard.',
          stack: [
            'Golang',
            'Gin',
            'React.js',
            'Vite',
            'Redux',
            'Tailwind CSS',
            'PostgreSQL',
            'Redis',
            'Docker',
            'Swagger',
          ],
          filterTags: ['golang', 'react-next', 'postgres-redis'],
          repos: [
            {
              label: 'Frontend (shortlink-frontend)',
              url: 'https://github.com/anggavb/shortlink-frontend',
            },
            {
              label: 'Backend (shortlink-backend)',
              url: 'https://github.com/anggavb/shortlink-backend',
            },
          ],
        },
        {
          id: 'kasvior',
          index: '02.8',
          group: 'fullstack',
          title: 'Kasvior: Digital E-Wallet Web Application',
          subtitle: 'Digital wallet platform supporting peer transfers and transaction ledgers',
          period: 'Mar - May 2026',
          organization: 'Koda Tech Academy',
          roleLabel: 'Fullstack Developer',
          provenance: 'CV & GitHub Verified',
          problemContext:
            'Digital wallet workflows demand consistent balance updates, send/receive money flows, and clear transaction history auditing across client and API layers.',
          architectureSolution:
            'Designed a Golang Gin REST API with PostgreSQL migrations/seeders and targeted Redis response caching, coupled with a responsive React.js client using Redux/Zustand and Tailwind CSS.',
          stack: [
            'Golang',
            'Gin',
            'React.js',
            'Vite',
            'Redux',
            'Zustand',
            'Tailwind CSS',
            'PostgreSQL',
            'Redis',
            'Docker',
          ],
          filterTags: ['golang', 'react-next', 'postgres-redis'],
          repos: [
            {
              label: 'Frontend (kasvior-wallet-app)',
              url: 'https://github.com/anggavb/kasvior-wallet-app',
            },
            {
              label: 'Backend (kasvior-wallet-backend)',
              url: 'https://github.com/anggavb/kasvior-wallet-backend',
            },
          ],
        },
      ],
    },
    lab: {
      sectionIndex: '03 / ENGINEERING LAB & GITHUB TELEMETRY',
      title: 'Technical Explorations & Public Activity',
      subtitle:
        'Cross-ecosystem experiments (Bun, ElysiaJS, Svelte, Python, Golang) alongside verified recent non-fork repository telemetry from @anggavb.',
      explorationsHeading: 'Curated Engineering Explorations',
      telemetryHeading: 'GitHub Public Telemetry (@anggavb)',
      telemetrySubheading:
        'Synchronized at build time with quota-aware 60-minute client TTL revalidation.',
      publicReposLabel: 'Public Repositories',
      followersLabel: 'Followers',
      syncedAtLabel: 'Last Verified Sync',
      recentNonForkHeading: 'Latest Non-Fork Repositories (By Push Activity)',
      noDescriptionLabel: 'No short description provided on this repository.',
      unavailableTitle: 'GitHub activity data currently unavailable',
      unavailableBody:
        'The public telemetry snapshot could not be loaded at this moment. All public repositories remain directly accessible on GitHub.',
      viewGitHubProfileCta: 'Open github.com/anggavb',
      syncingStatusLabel: 'Checking GitHub updates...',
      cachedStatusLabel: 'Verified Snapshot',
      explorations: [
        {
          index: 'L.01',
          title: 'YouTube Comment Priority System',
          summary:
            'Exploration of comment prioritization pipelines built on the Bun runtime, ElysiaJS, Drizzle ORM with PostgreSQL 16, and a strictly typed Svelte frontend.',
          stack: ['Bun', 'ElysiaJS', 'Drizzle ORM', 'PostgreSQL 16', 'TypeScript', 'Svelte'],
          repos: [
            { label: 'yt-comment-priority-be', url: 'https://github.com/anggavb/yt-comment-priority-be' },
            { label: 'yt-comment-priority-fe', url: 'https://github.com/anggavb/yt-comment-priority-fe' },
          ],
        },
        {
          index: 'L.02',
          title: 'Wrapped Weekly',
          summary:
            'Fullstack weekly activity recap web application pairing a Golang backend service with a Next.js and TypeScript frontend.',
          stack: ['Next.js', 'TypeScript', 'Golang'],
          repos: [
            { label: 'wrapped-weekly', url: 'https://github.com/anggavb/wrapped-weekly' },
            {
              label: 'wrapped-weekly-backend',
              url: 'https://github.com/anggavb/wrapped-weekly-backend',
            },
          ],
        },
        {
          index: 'L.03',
          title: 'Tabunganku',
          summary:
            'Personal savings goal tracker exploration combining a Svelte and TypeScript web interface with Python backend tooling.',
          stack: ['Svelte', 'TypeScript', 'Python'],
          repos: [{ label: 'tabunganku', url: 'https://github.com/anggavb/tabunganku' }],
        },
        {
          index: 'L.04',
          title: 'Huawei Technical Test & Automation',
          summary:
            'Modular technical test implementation, automated verification scripts, and system evaluation documentation.',
          stack: ['Automation', 'System Testing', 'Modular Scripting'],
          repos: [{ label: 'huawei-automation', url: 'https://github.com/anggavb/huawei-automation' }],
        },
        {
          index: 'L.05',
          title: 'Agentic AI Skills',
          summary:
            'Collection of structured instruction modules and workflow automations for AI software engineering agents written in Python and Markdown.',
          stack: ['Python', 'Markdown', 'AI Agent Workflows'],
          repos: [{ label: 'agent-skills', url: 'https://github.com/anggavb/agent-skills' }],
        },
      ],
    },
    skills: {
      sectionIndex: '04 / TECHNICAL SPECIFICATION MATRIX',
      title: 'Capabilities & Stack Matrix',
      subtitle:
        'Production and laboratory technologies organized by architectural responsibility without subjective percentage progress bars.',
      categories: [
        {
          index: 'S.01',
          category: 'Backend & Distributed Systems',
          focusNote: 'Modular APIs, microservice boundaries, and service contracts',
          items: [
            'Golang',
            'Gin-Gonic',
            'Microservices Architecture',
            'Laravel',
            'Express.js',
            'ElysiaJS',
            'REST API',
            'gRPC',
            'Clean Architecture',
          ],
        },
        {
          index: 'S.02',
          category: 'Frontend & UI Engineering',
          focusNote: 'Modern SPA/SSR applications, state management, and WCAG AA interfaces',
          items: [
            'React.js',
            'Next.js',
            'Vue.js (Pinia, Vuetify)',
            'Astro',
            'Svelte',
            'TypeScript',
            'JavaScript (ES6+)',
            'Redux Toolkit',
            'Zustand',
            'Tailwind CSS',
            'Responsive & Accessible Design',
          ],
        },
        {
          index: 'S.03',
          category: 'Database, Search & Caching',
          focusNote: 'Relational schema design, full-text search indexing, and query tuning',
          items: [
            'PostgreSQL (Full-Text Search, GIN Indexing)',
            'MySQL',
            'Redis',
            'SQL Query Optimization',
            'Drizzle ORM',
            'Eloquent',
            'Sequelize',
          ],
        },
        {
          index: 'S.04',
          category: 'DevOps & Infrastructure',
          focusNote: 'Containerized workflows, CI/CD automation, and Linux server operations',
          items: [
            'Docker',
            'Dockerfile',
            'Docker Compose',
            'GitHub Actions (CI/CD)',
            'NGINX',
            'Linux CLI',
            'Database Migration & Seeder',
          ],
        },
        {
          index: 'S.05',
          category: 'Security, Testing & Quality',
          focusNote: 'Layered authorization, API contract verification, and legacy refactoring',
          items: [
            'JWT',
            'PASETO',
            'OAuth',
            'Role-Based Access Control (RBAC)',
            'Input Validation',
            'CORS',
            'HTTPS',
            'Go Test',
            'Swagger / OpenAPI',
            'Postman',
            'Legacy Codebase Refactoring',
          ],
        },
      ],
    },
    education: {
      sectionIndex: '05 / ACADEMIC & INTENSIVE TRAINING',
      title: 'Education',
      subtitle: 'Academic grounding in information systems paired with intensive fullstack engineering training.',
      items: [
        {
          institution: 'Esa Unggul University',
          degree: "Bachelor's Degree in Information Systems",
          period: '2023 - Expected 2026',
          location: 'Kebon Jeruk, Jakarta',
          details: [
            'Focused on enterprise information systems architecture, relational database modeling, and digital business workflows.',
          ],
        },
        {
          institution: 'Koda Tech Academy',
          degree: 'Fullstack Web Developer Intensive Program',
          period: 'Feb 2026 - Jun 2026',
          location: 'Bogor, West Java',
          details: [
            'Frontend: React.js, Redux Toolkit, Zustand, React Router, Tailwind CSS.',
            'Backend & DevOps: Golang, Gin-Gonic, PostgreSQL, Redis, Git, Docker, SSH, CI/CD, Database Migration & Seeder.',
          ],
        },
        {
          institution: 'Politeknik LP3I Jakarta',
          degree: 'Diploma Degree of Computer Informatics',
          period: '2015 - 2018',
          location: 'Bogor Campus, West Java',
          details: [
            'Studied foundational business application development, network administration, and relational database design.',
          ],
        },
      ],
      certificationsTitle: 'Licenses & Certifications',
      recommendationsTitle: 'Professional Recommendations',
      certifications: [],
      recommendations: [],
    },
    contact: {
      sectionIndex: '06 / CONTACT & COLLABORATION',
      title: 'Technical Discussions & Opportunities',
      subtitle:
        'Available for Fullstack or Backend Software Engineer roles, web system architecture collaborations, and product engineering inquiries.',
      directChannelsHeading: 'Direct Communication Channels',
      directChannelsBody:
        'Copy the primary email address to write from your preferred mail client, or connect directly through the verified profiles below.',
      emailLabel: 'Primary Email',
      copyEmailButton: 'Copy Email Address',
      emailCopiedFeedback: 'Copied anggavb8@gmail.com to clipboard.',
      copyFailedFeedback: 'Automatic copy unavailable. Please copy manually: anggavb8@gmail.com',
      sendMailtoButton: 'Open Mail App',
      linkedinLabel: 'LinkedIn Profile',
      githubLabel: 'GitHub Profile',
      phoneLabel: 'Phone / WhatsApp',
      formHeading: 'Send a Direct Message',
      formIntro:
        'Your message draft is preserved in session storage automatically so nothing is lost if a network interruption occurs.',
      requiredNote: 'All fields marked with an asterisk (*) are required.',
      fields: {
        nameLabel: 'Full Name *',
        nameHint: '2 to 100 characters.',
        namePlaceholder: 'e.g. Alex Pratama',
        emailLabel: 'Reply-To Email Address *',
        emailHint: 'Valid email format ( e.g. name@company.com ).',
        emailPlaceholder: 'alex@company.com',
        subjectLabel: 'Subject *',
        subjectHint: '3 to 120 characters (e.g. Senior Fullstack Engineer Role).',
        subjectPlaceholder: 'Engineering Role / Project Collaboration',
        messageLabel: 'Message *',
        messageHint: '20 to 2,000 characters. Share role scope, system context, or timeline.',
        messagePlaceholder:
          'Hello Angga, we would like to discuss a Fullstack Engineer opportunity...',
        honeypotLabel: 'Leave this field empty if you are human',
      },
      validation: {
        nameLength: 'Please enter a name between 2 and 100 characters.',
        emailInvalid: 'Please enter a valid email address (up to 254 characters).',
        subjectLength: 'Please enter a subject between 3 and 120 characters.',
        messageLength: 'Please enter a message between 20 and 2,000 characters.',
      },
      submitButton: 'Send Message',
      submittingButton: 'Sending Message...',
      cooldownButtonTemplate: 'Sent (Wait {seconds}s)',
      unconfiguredTitle: 'Direct form endpoint not yet activated',
      unconfiguredBody:
        'Direct form submission is awaiting the production Formspree form ID configuration. Please reach out immediately using Copy Email Address or Open Mail App alongside this panel.',
      successTitle: 'Message sent',
      successBody:
        'Thank you. Your message has been accepted by the form endpoint and routed to Angga VB.',
      validationSummaryError:
        'Please review the highlighted fields below before submitting again.',
      rateLimitError:
        'Submission rate limit reached (HTTP 429). Your draft remains intact below. Please wait a moment or use Copy Email Address.',
      deliveryFailedTitle: 'Direct delivery could not be completed',
      deliveryFailedBody:
        'The request failed due to a network or upstream service issue. Your draft is safely preserved below so you can copy it or open it directly in your mail client.',
      copyDraftButton: 'Copy Message Draft',
      draftCopiedFeedback: 'Copied your message draft to clipboard.',
      openPrefilledMailtoButton: 'Send Draft via Mail App',
    },
    footer: {
      copyrightText: 'Angga VB. All records verified against CV, public GitHub repositories, and owner confirmation.',
      architectureNote: 'Statically compiled with Astro, Tailwind CSS v4, and strict TypeScript.',
      timezoneNote: 'Automatic theme synchronized to Western Indonesia Time (UTC+7).',
    },
  },
};
