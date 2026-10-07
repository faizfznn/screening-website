import { useState } from 'react';
import { HelpCircle, Star, Search, BookOpen, CheckCircle } from 'lucide-react';

export default function CriteriaQuestions() {
  const [selectedMinbur, setSelectedMinbur] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const criteriaList = [
    {
      code: "HC",
      ministry: "Human Capital",
      type: "Biro",
      color: "from-blue-600 to-indigo-600",
      criteria: ["Kritis & Evaluatif", "Komunikatif & Solutif", "Berempati", "Fast-Response", "Open-Minded & Humble", "Profesional"],
      questions: [
        "Apa motivasi utama kamu mendaftar di Biro Human Capital?",
        "Bagaimana cara kamu menyelesaikan konflik atau perbedaan pendapat dalam tim?",
        "Berikan contoh nyata saat kamu harus mengambil keputusan sulit di bawah tekanan."
      ]
    },
    {
      code: "TG",
      ministry: "Talent Growth",
      type: "Biro",
      color: "from-emerald-600 to-teal-600",
      criteria: ["Paham fungsi KMB", "Easy going & Humoris", "Komunikasi lancar", "Good attitude", "Suka tantangan", "Cepat beradaptasi"],
      questions: [
        "Apa yang membuat kamu tertarik memilih Biro Talent Growth?",
        "Sepengetahuan kamu, apa peran strategis Talent Growth dalam pengembangan staf BEM?",
        "Bagaimana kamu menyusun program apresiasi dan bonding yang efektif?"
      ]
    },
    {
      code: "CE",
      ministry: "Creative Enterprise",
      type: "Kementerian",
      color: "from-amber-500 to-orange-600",
      criteria: ["Kreatif & Inovatif", "Jiwa Kewirausahaan", "Paham Digital Marketing", "Manajemen Keuangan Dasar", "Kolaboratif"],
      questions: [
        "Jelaskan ide bisnis atau merchandise kreatif yang relevan untuk mahasiswa FILKOM.",
        "Bagaimana strategi kamu mempromosikan produk agar mencapai target penjualan?",
        "Bagaimana cara kamu menangani keluhan konsumen secara profesional?"
      ]
    },
    {
      code: "IAA",
      ministry: "Inter-Agency Affairs",
      type: "Kementerian",
      color: "from-sky-600 to-blue-700",
      criteria: ["Networking & Diplomasi", "Komunikasi Formal & Informal", "Percaya Diri", "Negosiator Baik", "Wawasan Eksternal Luas"],
      questions: [
        "Bagaimana cara kamu membangun relasi dengan instansi, kampus lain, atau mitra luar?",
        "Ceritakan pengalaman negosiasi atau sponsorship tersukses yang pernah kamu lakukan.",
        "Bagaimana kamu menyikapi penolakan kerjasama dari pihak eksternal?"
      ]
    },
    {
      code: "SAW",
      ministry: "Student Advocacy & Welfare",
      type: "Kementerian",
      color: "from-red-500 to-rose-600",
      criteria: ["Kritis & Tanggap Isu", "Empati Tinggi", "Solutif", "Berani Bersuara", "Paham Kebijakan Kampus"],
      questions: [
        "Apa isu advokasi atau fasilitas mahasiswa FILKOM yang menurutmu paling mendesak?",
        "Bagaimana langkah konkret kamu dalam mendampingi mahasiswa yang menghadapi kendala UKT/akademik?",
        "Bagaimana cara kamu mengumpulkan aspirasi mahasiswa secara objektif dan representatif?"
      ]
    },
    {
      code: "SEE",
      ministry: "Social Equity & Enviroment",
      type: "Kementerian",
      color: "from-teal-600 to-emerald-700",
      criteria: ["Peduli Sosial & Lingkungan", "Inisiatif Tinggi", "Kerja Lapangan Siaga", "Solutif", "Relasional"],
      questions: [
        "Apa inovasi program pengabdian masyarakat atau lingkungan hidup yang ingin kamu bawa?",
        "Bagaimana cara kamu mengajak mahasiswa FILKOM untuk lebih peduli terhadap isu sosial?",
        "Ceritakan pengalaman kerelawanan atau kegiatan sosial yang pernah kamu ikuti."
      ]
    },
    {
      code: "SSA",
      ministry: "Studies & Strategic Action",
      type: "Kementerian",
      color: "from-indigo-600 to-purple-700",
      criteria: ["Kritis & Analitis", "Kajian Mendalam", "Pemikiran Strategis", "Retorika Baik", "Paham Dinamika Politik Kampus"],
      questions: [
        "Bagaimana pandanganmu mengenai peran strategis BEM dalam pergerakan mahasiswa saat ini?",
        "Bagaimana tahapan kamu dalam menyusun naskah kajian isu strategis yang valid?",
        "Bagaimana strategi pencerdasan isu ke publik agar mudah dipahami mahasiswa awam?"
      ]
    },
    {
      code: "AF",
      ministry: "Administration & Finance",
      type: "Biro",
      color: "from-slate-700 to-slate-900",
      criteria: ["Teliti & Rapi", "Manajemen Arsip/Keuangan", "Bertanggung Jawab", "Disiplin Tenggat", "Jujur & Transparan"],
      questions: [
        "Bagaimana cara kamu memastikan pengelolaan surat-menyurat atau keuangan tetap akurat dan tertib?",
        "Bagaimana kamu menangani laporan SPJ kegiatan yang mengalami revisi berkali-kali?",
        "Apa tools manajemen dokumen yang paling sering kamu gunakan?"
      ]
    },
    {
      code: "ITS",
      ministry: "IT Solution",
      type: "Biro",
      color: "from-cyan-600 to-blue-600",
      criteria: ["Hard Skill Web / UI/UX / Mobile", "Problem Solving", "Clean Code", "Kerja Tim Git", "Inovatif"],
      questions: [
        "Jelaskan tech-stack atau portofolio digital yang pernah kamu bangun sebelumnya.",
        "Bagaimana alur kamu saat menemukan bug kritis pada website resmi BEM saat event besar?",
        "Bagaimana kamu membagi waktu antara pengerjaan fitur teknis dan koordinasi tim?"
      ]
    },
    {
      code: "CMI",
      ministry: "Creative Media & Information",
      type: "Kementerian",
      color: "from-pink-600 to-rose-600",
      criteria: ["Desain Grafis / Videografi / Copywriting", "Sense of Design", "Up-to-Date Tren", "Tahan Deadline Ketat", "Estetis"],
      questions: [
        "Software atau tools desain/video apa yang paling kamu kuasai?",
        "Bagaimana caramu menjaga konsistensi visual branding feed BEM FILKOM?",
        "Bagaimana kamu menyikapi feedback revisi mendadak dari pimpinan atau panitia lain?"
      ]
    }
  ];

  const filtered = criteriaList.filter(item => {
    const matchesCode = selectedMinbur === "ALL" || item.code === selectedMinbur;
    const matchesSearch = 
      item.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.criteria.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.questions.some(q => q.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCode && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100 mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Panduan Penilaian Panelis 2026
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Criteria & Question Bank</h1>
          <p className="text-slate-500 text-sm mt-1">
            Standarisasi kriteria staf dan bank pertanyaan wawancara untuk 10 Kementerian & Biro SGE FILKOM UB.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kementerian, kriteria, atau pertanyaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* FILTER PILLS */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedMinbur("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedMinbur === "ALL"
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua Kementerian & Biro ({criteriaList.length})
        </button>
        {criteriaList.map((m) => (
          <button
            key={m.code}
            onClick={() => setSelectedMinbur(m.code)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedMinbur === m.code
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {m.code} - {m.ministry}
          </button>
        ))}
      </div>

      {/* CRITERIA CARDS */}
      <div className="grid grid-cols-1 gap-6">
        {filtered.map((item) => (
          <div key={item.code} className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-all">
            <div className={`bg-gradient-to-r ${item.color} px-8 py-4.5 flex items-center justify-between text-white`}>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-extrabold text-sm border border-white/20">
                  {item.code}
                </span>
                <div>
                  <h2 className="text-lg font-extrabold tracking-wide">{item.ministry}</h2>
                  <p className="text-[11px] text-white/80 font-medium">{item.type} SGE FILKOM UB</p>
                </div>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-white text-xs font-bold backdrop-blur-md border border-white/20">
                {item.type}
              </div>
            </div>
            
            <div className="p-7 grid grid-cols-1 lg:grid-cols-12 gap-7">
              {/* CRITERIA COLUMN */}
              <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl p-6 border border-slate-200/70">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/70">
                  <Star className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-slate-800 text-sm">Staff Quality & Criteria</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.criteria.map((crit, i) => (
                    <span 
                      key={i} 
                      className="bg-white border border-slate-200/80 text-slate-700 text-xs px-3 py-1.5 rounded-xl shadow-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {crit}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* QUESTION LIST COLUMN */}
              <div className="lg:col-span-7 bg-blue-50/40 rounded-2xl p-6 border border-blue-100/70">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200/50">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-slate-800 text-sm">Interview Question Bank</h3>
                </div>
                <ul className="space-y-3">
                  {item.questions.map((q, i) => (
                    <li key={i} className="flex gap-3 text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs leading-relaxed">
                      <span className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-800">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 font-medium">Tidak ada kementerian atau kriteria yang cocok dengan pencarian "{searchQuery}".</p>
          </div>
        )}
      </div>
    </div>
  );
}

