import React, { useState, useEffect } from 'react';
import Navbar, { TabKey } from './components/Navbar';
import HomeTab from './components/HomeTab';
import GradeTab from './components/GradeTab';
import RealWorldTab from './components/RealWorldTab';
import ExamTab from './components/ExamTab';
import WeekProblemTab from './components/WeekProblemTab';
import DocumentsTab from './components/DocumentsTab';
import AdminTab from './components/AdminTab';
import AskTeacherModal from './components/AskTeacherModal';

import { INITIAL_WEEK_PROBLEMS, INITIAL_LEADERBOARD } from './data/weekProblemsData';
import { WeekProblem, WeekSubmission, TeacherMessage, MathDocument } from './types/math';
import { MATH_DOCUMENTS } from './data/documentsData';
import { Mail, Phone, Heart, ShieldCheck, GraduationCap, ArrowUp } from 'lucide-react';

export default function App() {
  // Hash-based navigation synced with URL
  const [currentTab, setCurrentTab] = useState<TabKey>(() => {
    const hash = window.location.hash.replace('#', '') as TabKey;
    const validTabs: TabKey[] = ['home', 'g10', 'g11', 'g12', 'tt', 'exam', 'week', 'docs', 'admin'];
    return validTabs.includes(hash) ? hash : 'home';
  });

  // Admin status
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('pba_is_admin') === 'true';
  });

  // Dark mode status (auto-detects system preference or uses saved preference)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pba_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Keep html class in sync with dark mode state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pba_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pba_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Ask Teacher Modal
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  // Global State with LocalStorage
  const [weekProblems, setWeekProblems] = useState<WeekProblem[]>(() => {
    const saved = localStorage.getItem('pba_week_problems');
    return saved ? JSON.parse(saved) : INITIAL_WEEK_PROBLEMS;
  });

  const [submissions, setSubmissions] = useState<WeekSubmission[]>(() => {
    const saved = localStorage.getItem('pba_week_leaderboard');
    return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
  });

  const [messages, setMessages] = useState<TeacherMessage[]>(() => {
    const saved = localStorage.getItem('pba_messages');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'msg-sample',
            studentName: 'Trịnh Khánh Linh',
            studentContact: '0978 112 233',
            grade: 12,
            question: 'Thầy cho em hỏi câu 4 phần II về tính đơn điệu của hàm số chứa dấu giá trị tuyệt đối ạ.',
            reply: 'Chào em, dạng toán này em cần chia hai trường hợp phá dấu trị tuyệt đối hoặc xét đạo hàm từng nhánh $f(x) \\cdot f\'(x) / |f(x)|$. Thầy đã cập nhật chi tiết trong chuyên đề Oxyz & Khảo sát hàm số!',
            createdAt: 'Hôm qua lúc 14:20',
            status: 'answered'
          }
        ];
  });

  const [documents, setDocuments] = useState<MathDocument[]>(() => {
    const saved = localStorage.getItem('pba_documents');
    return saved ? JSON.parse(saved) : MATH_DOCUMENTS;
  });

  // Sync hash on navigation
  useEffect(() => {
    window.location.hash = currentTab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  // Listen to hash change from browser buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabKey;
      const validTabs: TabKey[] = ['home', 'g10', 'g11', 'g12', 'tt', 'exam', 'week', 'docs', 'admin'];
      if (validTabs.includes(hash)) {
        setCurrentTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.setItem('pba_is_admin', 'false');
      if (currentTab === 'admin') {
        setCurrentTab('home');
      }
    } else {
      const pwd = window.prompt('Nhập mã khóa quản trị (mặc định: 123456):', '123456');
      if (pwd === '123456' || pwd === 'pba' || pwd === 'admin') {
        setIsAdmin(true);
        localStorage.setItem('pba_is_admin', 'true');
        setCurrentTab('admin');
      } else if (pwd !== null) {
        alert('Mật khẩu không chính xác.');
      }
    }
  };

  const handleAddWeekProblem = (prob: WeekProblem) => {
    const updated = [prob, ...weekProblems];
    setWeekProblems(updated);
    localStorage.setItem('pba_week_problems', JSON.stringify(updated));
  };

  const handleUpdateSubmission = (sub: WeekSubmission) => {
    const updated = submissions.map((s) => (s.id === sub.id ? sub : s));
    setSubmissions(updated);
    localStorage.setItem('pba_week_leaderboard', JSON.stringify(updated));
  };

  const handleMessageSent = (msg: TeacherMessage) => {
    const updated = [msg, ...messages];
    setMessages(updated);
    localStorage.setItem('pba_messages', JSON.stringify(updated));
  };

  const handleReplyMessage = (msgId: string, reply: string) => {
    const updated = messages.map((m) =>
      m.id === msgId ? { ...m, reply, status: 'answered' as const } : m
    );
    setMessages(updated);
    localStorage.setItem('pba_messages', JSON.stringify(updated));
  };

  const handleAddDocument = (doc: MathDocument) => {
    const updated = [doc, ...documents];
    setDocuments(updated);
    localStorage.setItem('pba_documents', JSON.stringify(updated));
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode
          ? 'dark bg-[#09131D] text-[#E2E8F0]'
          : 'bg-[#F6F9FA] text-[#15283A]'
      } font-sans selection:bg-teal-100 selection:text-teal-900 transition-colors duration-200`}
    >
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        onOpenAskModal={() => setIsAskModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'home' && (
          <HomeTab
            onNavigate={setCurrentTab}
            onOpenAskModal={() => setIsAskModalOpen(true)}
          />
        )}

        {currentTab === 'g10' && <GradeTab grade={10} />}
        {currentTab === 'g11' && <GradeTab grade={11} />}
        {currentTab === 'g12' && <GradeTab grade={12} />}

        {currentTab === 'tt' && <RealWorldTab />}

        {currentTab === 'exam' && <ExamTab />}

        {currentTab === 'week' && <WeekProblemTab />}

        {currentTab === 'docs' && <DocumentsTab />}

        {currentTab === 'admin' && (
          <AdminTab
            weekProblems={weekProblems}
            onAddWeekProblem={handleAddWeekProblem}
            submissions={submissions}
            onUpdateSubmission={handleUpdateSubmission}
            messages={messages}
            onReplyMessage={handleReplyMessage}
            onAddDocument={handleAddDocument}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="print:hidden bg-[#0B2A3C] text-white border-t border-teal-900/60 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Column 1: Teacher Brand */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F4B942] text-[#0B2A3C] flex items-center justify-center font-black text-sm">
                  PBA
                </div>
                <span className="font-extrabold text-base tracking-tight">
                  Dạy học Toán PBA · Thầy Phạm Bảo Anh
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                Trang web học tập, rèn luyện toán THPT theo chương trình GDPT 2018 mới nhất và cấu trúc đề thi Tốt nghiệp THPT 2025: Trắc nghiệm 4 lựa chọn, Đúng/Sai, Trả lời ngắn và Toán thực tiễn.
              </p>
              <div className="text-xs text-teal-300 flex items-center gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#F4B942]" />
                <span>Nội dung chuẩn kiến thức Bộ GD&ĐT</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#F4B942]">
                Chuyên mục chính
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li>
                  <button
                    onClick={() => setCurrentTab('exam')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Đề thi Chuẩn Bộ GD&ĐT 2025
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('g12')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Ôn luyện Toán 12
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('tt')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Toán ứng dụng thực tiễn
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('week')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Thử thách bài toán tuần
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('docs')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Tải tài liệu & Sổ tay Casio
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Teacher */}
            <div className="md:col-span-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#F4B942]">
                Liên hệ Thầy Phạm Bảo Anh
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                  <a
                    href="mailto:baoanh.math@gmail.com"
                    className="hover:underline text-white font-medium"
                  >
                    baoanh.math@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="text-white font-medium">0988 567 890</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsAskModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
                  >
                    Nhắn tin trao đổi với thầy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              © {new Date().getFullYear()} Dạy học Toán PBA · Thầy Phạm Bảo Anh. Toàn bộ bản quyền được bảo lưu.
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Đồng hành cùng học sinh chinh phục điểm 9+ môn Toán</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Ask Teacher Button in bottom-right */}
      <button
        onClick={() => setIsAskModalOpen(true)}
        className="print:hidden fixed bottom-5 right-5 z-40 bg-[#F4B942] hover:bg-[#FFCB5C] text-[#0B2A3C] p-3.5 rounded-full shadow-xl flex items-center gap-2 font-bold text-xs sm:text-sm hover:scale-105 transition-all cursor-pointer border-2 border-white/40"
        title="Nhắn tin hỏi Thầy Phạm Bảo Anh"
      >
        <GraduationCap className="w-5 h-5" />
        <span className="hidden sm:inline">Hỏi thầy PBA</span>
      </button>

      {/* Ask Teacher Modal */}
      <AskTeacherModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
