/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Plus, 
  Trash2, 
  Edit2, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  RotateCcw, 
  Copy, 
  Check, 
  Crown, 
  Trophy, 
  RefreshCw,
  HelpCircle, 
  Share2, 
  ArrowLeftRight,
  FileSpreadsheet,
  X,
  Sparkles,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassData, GroupResult, AppView } from './types';

// Predefined sample classes for immediate play and premium UX
const DEFAULT_CLASSES: ClassData[] = [
  {
    id: 'sample-1',
    name: '3학년 1반 (샘플 학급)',
    students: [
      '김민준', '이서연', '박지우', '최예은', '정윤우', 
      '강다은', '조시우', '윤서진', '임도현', '한지민', 
      '오민서', '서주원', '신하은', '권우진', '황지현', 
      '안태양', '송다빈', '전은우' // 18 students
    ]
  },
  {
    id: 'sample-2',
    name: '3학년 2반 (샘플 학급)',
    students: [
      '박민서', '김도윤', '이하은', '최민재', '정서윤',
      '강준우', '조하율', '윤도현', '임서진', '한지우',
      '오윤우', '서하은', '신건우', '권민지', '황주원' // 15 students
    ]
  }
];

// Beautiful background/accent colors for 5 groups structured precisely with border-top-4 accents based on the Sleek Interface design
const GROUP_COLORS = [
  {
    id: 1,
    name: 'blue',
    bg: 'bg-white border border-slate-200 border-t-4 border-t-blue-500 shadow-sm p-4 rounded-2xl',
    headerBg: 'transparent',
    headerText: 'text-slate-800',
    badge: 'bg-blue-50 text-blue-600 rounded text-[10px] font-extrabold px-2 py-0.5',
    border: 'border-blue-200 focus-within:ring-2 focus-within:ring-blue-400',
    tagBg: 'bg-blue-100',
    accent: 'text-blue-600',
    chipHover: 'hover:bg-blue-50/50'
  },
  {
    id: 2,
    name: 'emerald',
    bg: 'bg-white border border-slate-200 border-t-4 border-t-emerald-500 shadow-sm p-4 rounded-2xl',
    headerBg: 'transparent',
    headerText: 'text-slate-800',
    badge: 'bg-emerald-50 text-emerald-600 rounded text-[10px] font-extrabold px-2 py-0.5',
    border: 'border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-400',
    tagBg: 'bg-emerald-100',
    accent: 'text-emerald-600',
    chipHover: 'hover:bg-emerald-50/50'
  },
  {
    id: 3,
    name: 'amber',
    bg: 'bg-white border border-slate-200 border-t-4 border-t-amber-500 shadow-sm p-4 rounded-2xl',
    headerBg: 'transparent',
    headerText: 'text-slate-800',
    badge: 'bg-amber-50 text-amber-600 rounded text-[10px] font-extrabold px-2 py-0.5',
    border: 'border-amber-200 focus-within:ring-2 focus-within:ring-amber-400',
    tagBg: 'bg-amber-100',
    accent: 'text-amber-600',
    chipHover: 'hover:bg-amber-50/50'
  },
  {
    id: 4,
    name: 'purple',
    bg: 'bg-white border border-slate-200 border-t-4 border-t-purple-500 shadow-sm p-4 rounded-2xl',
    headerBg: 'transparent',
    headerText: 'text-slate-800',
    badge: 'bg-purple-50 text-purple-600 rounded text-[10px] font-extrabold px-2 py-0.5',
    border: 'border-purple-200 focus-within:ring-2 focus-within:ring-purple-400',
    tagBg: 'bg-purple-100',
    accent: 'text-purple-600',
    chipHover: 'hover:bg-purple-50/50'
  },
  {
    id: 5,
    name: 'rose',
    bg: 'bg-white border border-slate-200 border-t-4 border-t-rose-500 shadow-sm p-4 rounded-2xl',
    headerBg: 'transparent',
    headerText: 'text-slate-800',
    badge: 'bg-rose-50 text-rose-600 rounded text-[10px] font-extrabold px-2 py-0.5',
    border: 'border-rose-200 focus-within:ring-2 focus-within:ring-rose-400',
    tagBg: 'bg-rose-100',
    accent: 'text-rose-600',
    chipHover: 'hover:bg-rose-50/50'
  }
];

export default function App() {
  // === Persistence State ===
  const [classes, setClasses] = useState<ClassData[]>(() => {
    const saved = localStorage.getItem('class_randomizer_classes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CLASSES;
      }
    }
    return DEFAULT_CLASSES;
  });

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    const saved = localStorage.getItem('class_randomizer_selected_id');
    return saved || 'sample-1';
  });

  // === UI & Editor States ===
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [activeClassName, setActiveClassName] = useState('');
  const [studentsInput, setStudentsInput] = useState('');
  const [groupCount, setGroupCount] = useState<number>(4);
  const [isLeaderAuto, setIsLeaderAuto] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // === Randomizer Engine States ===
  const [currentView, setCurrentView] = useState<AppView>('Setup');
  const [countdownNum, setCountdownNum] = useState(5);
  const [countdownText, setCountdownText] = useState('5');
  const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
  const [shufflingNames, setShufflingNames] = useState<string>('시작 준비 중...');

  // === Interactive Swap and Draw States ===
  const [swapSelection, setSwapSelection] = useState<{
    groupIndex: number;
    studentIndex: number;
    studentName: string;
  } | null>(null);
  
  const [luckyDrawResult, setLuckyDrawResult] = useState<string | null>(null);
  const [isDrawingGroup, setIsDrawingGroup] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // === Modal & Guide States ===
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for Web Audio synthesizer and countdown loops
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shuffleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save changes to localStorage on classes updates
  useEffect(() => {
    localStorage.setItem('class_randomizer_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('class_randomizer_selected_id', selectedClassId);
  }, [selectedClassId]);

  // Load the selected class data into inputs
  useEffect(() => {
    if (selectedClassId === 'custom') {
      setIsEditingClass(true);
      setActiveClassName('새로운 학급');
      setStudentsInput('');
    } else {
      const activeClass = classes.find(c => c.id === selectedClassId);
      if (activeClass) {
        setActiveClassName(activeClass.name);
        setStudentsInput(activeClass.students.join('\n'));
        setIsEditingClass(false);
      }
    }
    setErrorMessage(null);
  }, [selectedClassId, classes]);

  // Premium Web Audio Synthesizer for high-quality audio feedback without external assets
  const playOscillatorSound = (type: 'tick' | 'complete' | 'click' | 'success') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'complete') {
        // Celestial major chord
        const now = ctx.currentTime;
        const playTone = (freq: number, delay: number, dur: number, vol: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(vol, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + dur);
        };
        playTone(523.25, 0, 0.25, 0.12);    // C5
        playTone(659.25, 0.08, 0.25, 0.12); // E5
        playTone(783.99, 0.16, 0.25, 0.12); // G5
        playTone(1046.50, 0.24, 0.5, 0.15); // C6
      } else if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      console.warn('Audio synthesis failed or was blocked by browser autoplay settings.', e);
    }
  };

  // Sophisticated list parser designed especially for Excel spreadsheet copy-pasting
  const parseNamesList = (text: string): string[] => {
    // Split by common spreadsheet & document roster separators
    const rawTokens = text.split(/[\r\n\t,;]+/);
    const cleanedNames: string[] = [];

    for (let token of rawTokens) {
      let cleaned = token.trim();
      if (!cleaned) continue;

      // Smart Roster Cleanup:
      // Strip leading序号 (numbers) e.g., "1. 김민주", "03번 박지우", "12 이영희"
      cleaned = cleaned
        .replace(/^\d+[\s.번]*\s*/, '') // Removes numbers followed by dot, spaces, or '번'
        .replace(/\s+/g, ' ')           // Compresses multiple spaces to single
        .trim();

      // Skip row indexes that are purely numerical leftover items (like copying index column accidentally)
      if (!cleaned || /^\d+$/.test(cleaned)) {
        continue;
      }

      cleanedNames.push(cleaned);
    }
    return cleanedNames;
  };

  const parsedStudentsCount = parseNamesList(studentsInput).length;

  // Save or Update class in storage
  const handleSaveClass = () => {
    playOscillatorSound('success');
    const studentList = parseNamesList(studentsInput);
    if (!activeClassName.trim()) {
      setErrorMessage('학급 이름을 입력해 주세요.');
      return;
    }
    if (studentList.length === 0) {
      setErrorMessage('학생 이름을 최소 1명 이상 입력해 주세요.');
      return;
    }

    const updatedClasses = [...classes];
    const existingIndex = updatedClasses.findIndex(c => c.id === selectedClassId);

    if (existingIndex !== -1 && selectedClassId !== 'custom') {
      // Update existing
      updatedClasses[existingIndex] = {
        ...updatedClasses[existingIndex],
        name: activeClassName,
        students: studentList
      };
      setClasses(updatedClasses);
      setIsEditingClass(false);
    } else {
      // Create new custom class
      const newId = `custom-${Date.now()}`;
      const newClass: ClassData = {
        id: newId,
        name: activeClassName,
        students: studentList
      };
      const filteredClasses = updatedClasses.filter(c => c.id !== 'custom');
      const nextClasses = [...filteredClasses, newClass];
      setClasses(nextClasses);
      setSelectedClassId(newId);
      setIsEditingClass(false);
    }
    setErrorMessage(null);
  };

  // Add a brand-new empty class template
  const handleAddNewClassTrigger = () => {
    playOscillatorSound('click');
    const newId = `custom-new-${Date.now()}`;
    const newClass: ClassData = {
      id: newId,
      name: `새로운 학급 ${classes.filter(c => c.id.startsWith('custom')).length + 1}`,
      students: []
    };
    setClasses([...classes, newClass]);
    setSelectedClassId(newId);
    setIsEditingClass(true);
    setErrorMessage(null);
  };

  // Delete academic class from registry
  const handleDeleteClass = (classId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playOscillatorSound('click');
    
    // Confirm delete inside browser frame
    if (confirm('이 학급을 삭제하시겠습니까? 등록된 학생 리스트가 모두 지워집니다.')) {
      const filtered = classes.filter(c => c.id !== classId);
      setClasses(filtered);
      
      // Auto-fallback selection
      if (filtered.length > 0) {
        setSelectedClassId(filtered[0].id);
      } else {
        setSelectedClassId('custom');
      }
    }
  };

  // Fisher-Yates algorithmic array shuffle
  const shuffleStudents = (list: string[]): string[] => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Trigger group lottery simulation count-down
  const handleStartGroupingSequence = () => {
    playOscillatorSound('click');
    setErrorMessage(null);
    
    const studentsArray = parseNamesList(studentsInput);
    
    // Validation
    if (studentsArray.length < 2) {
      setErrorMessage('랜덤 모둠 배치를 시작하려면 최소 2명 이상의 학생이 필요합니다.');
      return;
    }
    if (studentsArray.length < groupCount) {
      setErrorMessage(`학생 수(${studentsArray.length}명)가 설정한 모둠 수(${groupCount}개)보다 적습니다. 모둠 수 이하로 나누어지지 않으므로 모둠 수를 조절해 주십시오.`);
      return;
    }

    // Initialize Countdown state
    setCountdownNum(5);
    setCountdownText('5');
    setCurrentView('Countdown');
    setLuckyDrawResult(null);

    // Dynamic text effect simulating students lotto barrel spin
    let tempShuffleIndex = 0;
    shuffleIntervalRef.current = setInterval(() => {
      const mockShuffled = shuffleStudents(studentsArray);
      const highlightedName = mockShuffled[tempShuffleIndex % mockShuffled.length];
      setShufflingNames(`${highlightedName} 학생 배치 중... 🎲`);
      tempShuffleIndex++;
    }, 120);

    // Active tick countdown
    playOscillatorSound('tick');
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdownNum(prev => {
        const nextVal = prev - 1;
        if (nextVal > 0) {
          setCountdownText(nextVal.toString());
          playOscillatorSound('tick');
        } else if (nextVal === 0) {
          setCountdownText('완료! 🎉');
          playOscillatorSound('complete');
          
          // Confetti explosion
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
          
          // Short delay to allow "완료!" message to shine
          setTimeout(() => {
            finalizeGroupPlacements(studentsArray);
          }, 900);
        }
        return nextVal;
      });
    }, 1000);
  };

  // Perform calculation of mathematical group balance
  const finalizeGroupPlacements = (studentsArray: string[]) => {
    // Clean up timers
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);

    const shuffled = shuffleStudents(studentsArray);
    
    // Create group structures
    const results: GroupResult[] = Array.from({ length: groupCount }, (_, index) => ({
      groupIndex: index,
      name: `${index + 1}모둠`,
      students: [],
    }));

    // Distribute students evenly among groups sequentially
    shuffled.forEach((student, index) => {
      const targetGroupIndex = index % groupCount;
      results[targetGroupIndex].students.push(student);
    });

    // Handle leader appointments automatically if checked
    if (isLeaderAuto) {
      results.forEach(g => {
        if (g.students.length > 0) {
          // Select 1 random leader
          const leaderIndex = Math.floor(Math.random() * g.students.length);
          g.leader = g.students[leaderIndex];
        }
      });
    }

    // Save final grouping
    setGroupResults(results);
    setCurrentView('Result');
    setSwapSelection(null);
  };

  // Clean-up active interval timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
    };
  }, []);

  // Soft/Hard Reset Action to start over
  const handleResetToSetup = () => {
    playOscillatorSound('click');
    setSwapSelection(null);
    setLuckyDrawResult(null);
    setCurrentView('Setup');
  };

  // Copy result structured text to teachers' clipboard
  const handleCopyResultsToClipboard = () => {
    playOscillatorSound('success');
    
    const timeString = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    let textResult = `📢 [${activeClassName || '학급'}] 모둠 랜덤 배치 결과 (${timeString})\n\n`;
    
    groupResults.forEach(g => {
      textResult += `⭐️ ${g.name} (${g.students.length}명)\n`;
      if (g.leader) {
        textResult += `   👑 모둠장: ${g.leader}\n`;
      }
      textResult += `   👥 무리: ${g.students.map(s => s === g.leader ? `${s}(모둠장)` : s).join(', ')}\n\n`;
    });
    
    textResult += `🤖 학급 모둠 랜덤 배치기 웹앱으로 생성됨`;

    navigator.clipboard.writeText(textResult)
      .then(() => {
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패', err);
      });
  };

  // Quick random leader re-selection per group
  const handleSelectLeaderInteractively = (groupIndex: number) => {
    playOscillatorSound('click');
    const updated = [...groupResults];
    const group = updated[groupIndex];
    if (group.students.length > 0) {
      const leaderIndex = Math.floor(Math.random() * group.students.length);
      group.leader = group.students[leaderIndex];
      setGroupResults(updated);
      
      // Little bubble confetti burst over the group card
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.5, x: 0.2 + (groupIndex * 0.2) }
      });
    }
  };

  // Let teachers manual dragless swap student positions instantly
  const handleStudentSelectForSwap = (groupIndex: number, studentIndex: number, studentName: string) => {
    playOscillatorSound('click');
    
    if (!swapSelection) {
      // First selectee
      setSwapSelection({ groupIndex, studentIndex, studentName });
    } else {
      // Second selectee - execute swap action!
      const student1 = swapSelection;
      const student2 = { groupIndex, studentIndex, studentName };
      
      // Avoid swapping oneself
      if (student1.groupIndex === student2.groupIndex && student1.studentIndex === student2.studentIndex) {
        setSwapSelection(null);
        return;
      }

      const updated = [...groupResults];
      
      // Perform Swap values inside arrays
      const s1Name = updated[student1.groupIndex].students[student1.studentIndex];
      const s2Name = updated[student2.groupIndex].students[student2.studentIndex];

      updated[student1.groupIndex].students[student1.studentIndex] = s2Name;
      updated[student2.groupIndex].students[student2.studentIndex] = s1Name;

      // Maintain leader tracking if leaders were swapped
      const s1IsLeader = updated[student1.groupIndex].leader === s1Name;
      const s2IsLeader = updated[student2.groupIndex].leader === s2Name;

      if (s1IsLeader) updated[student1.groupIndex].leader = s2Name;
      if (s2IsLeader) updated[student2.groupIndex].leader = s1Name;

      setGroupResults(updated);
      setSwapSelection(null);
      playOscillatorSound('success');
    }
  };

  // Game/Lottery module: Pick a random group to speak or answer first
  const handleLuckyDrawPresenterGroup = () => {
    if (isDrawingGroup) return;
    playOscillatorSound('tick');
    setIsDrawingGroup(true);
    setLuckyDrawResult(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * groupResults.length);
      setLuckyDrawResult(`${randomIndex + 1}모둠 🎤`);
      playOscillatorSound('tick');
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        setIsDrawingGroup(false);
        // Fireworks blast
        confetti({
          particleCount: 50,
          spread: 40,
        });
        playOscillatorSound('complete');
      }
    }, 150);
  };

  // Fill editable field with friendly default mock data
  const handleLoadSampleNames = () => {
    playOscillatorSound('click');
    const activeClass = classes.find(c => c.id === selectedClassId);
    
    const sampleNames = [
      '김철수', '박영희', '이민수', '최지우', '정다은',
      '강건우', '조하율', '신서진', '오도현', '서예지',
      '한재서', '권아름', '황태양', '안동하', '백서윤',
      '송민재', '윤수현', '임가은', '전승우', '유진아'
    ];

    setStudentsInput(sampleNames.join('\n'));
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden text-slate-800 antialiased">
      {/* Visual Header Grid Panel */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shadow-sm shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-xs text-white">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-display flex items-baseline gap-2">
            <span>GroupMaker</span>
            <span className="text-indigo-600">Pro</span>
            <span className="hidden sm:inline-block text-[11px] font-normal text-slate-400">학급 모둠 랜덤 배치기</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick class list selector directly inside the navigation header on medium screens */}
          <div className="hidden md:flex gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
            {classes.slice(0, 3).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  playOscillatorSound('click');
                  setSelectedClassId(c.id);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold tracking-tight transition-colors ${
                  selectedClassId === c.id
                    ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {c.name}
              </button>
            ))}
            {classes.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center px-1">+{classes.length - 3}</span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Quick Interactive Guide Button */}
            <button
              id="guide-btn"
              onClick={() => { playOscillatorSound('click'); setShowGuideModal(true); }}
              className="p-1.5 sm:px-3 sm:py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">도움말</span>
            </button>

            {/* Sound Feedback Toggle Switch */}
            <button
              id="sound-toggle-btn"
              onClick={() => {
                const nextSound = !soundEnabled;
                setSoundEnabled(nextSound);
                if (nextSound) {
                  setTimeout(() => playOscillatorSound('tick'), 50);
                }
              }}
              className={`p-1.5 sm:p-2 rounded-lg border transition ${
                soundEnabled 
                  ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
              title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Window */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: SETUP SCREEN */}
          {currentView === 'Setup' && (
            <motion.div
              key="setup-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              
              {/* Left Column: Academic Class Registry & Excel Clipboard Input */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Class selector Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-indigo-600" />
                      대상 학급 선택
                    </label>
                    <button
                      id="add-class-btn"
                      onClick={handleAddNewClassTrigger}
                      className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-100 transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      새 학급 추가
                    </button>
                  </div>

                  {/* Tabs grid for multiple classes registered */}
                  <div className="flex flex-wrap gap-2">
                    {classes.map((c) => (
                      <button
                        id={`class-tab-${c.id}`}
                        key={c.id}
                        onClick={() => {
                          playOscillatorSound('click');
                          setSelectedClassId(c.id);
                        }}
                        className={`px-4 py-1.5 rounded-full font-semibold text-xs border transition flex items-center justify-between gap-1.5 group relative shrink-0 ${
                          selectedClassId === c.id
                            ? 'bg-indigo-50 border-indigo-150 text-indigo-700 font-bold'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <span className="truncate max-w-[100px]">{c.name}</span>
                        
                        {/* Clear custom class but secure predefined models */}
                        {!c.id.startsWith('sample') && (
                          <button
                            onClick={(e) => handleDeleteClass(c.id, e)}
                            className={`p-0.5 rounded transition ${
                              selectedClassId === c.id 
                                ? 'text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100/50' 
                                : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                            }`}
                            title="학급 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Name Input Area supporting Excel Copy & Paste */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        학생 이름 명렬표 입력
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        엑셀에서 전공 명렬표 열을 드래그해서 그대로 붙여넣기(Ctrl+V) 하세요!
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                        인식된 학생: {parsedStudentsCount}명
                      </span>
                    </div>
                  </div>

                  {/* Active Class Name Editor */}
                  {isEditingClass ? (
                    <div className="flex items-center gap-2 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100">
                      <input
                        id="class-name-input"
                        type="text"
                        value={activeClassName}
                        onChange={(e) => setActiveClassName(e.target.value)}
                        placeholder="예: 3학년 3반"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1"
                      />
                      <button
                        id="save-class-btn"
                        onClick={handleSaveClass}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
                      >
                        학급 저장
                      </button>
                      <button
                        id="cancel-edit-btn"
                        onClick={() => {
                          playOscillatorSound('click');
                          setIsEditingClass(false);
                          // Revert
                          const activeClass = classes.find(c => c.id === selectedClassId);
                          if (activeClass) setActiveClassName(activeClass.name);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-50 p-2 px-3 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        📂 현재 수정 중인 학급: <span className="text-indigo-600 font-extrabold">{activeClassName}</span>
                      </span>
                      <button
                        id="edit-class-btn"
                        onClick={() => { playOscillatorSound('click'); setIsEditingClass(true); }}
                        className="text-[11px] text-indigo-700 hover:underline font-semibold flex items-center gap-0.5"
                      >
                        <Edit2 className="w-3 h-3" />
                        이름 변경
                      </button>
                    </div>
                  )}

                  {/* Excel Paste compatible Textarea Roster */}
                  <div className="relative">
                    <textarea
                      id="roster-textarea"
                      rows={9}
                      value={studentsInput}
                      onChange={(e) => setStudentsInput(e.target.value)}
                      placeholder="이곳에 학생 이름을 복사해서 붙여넣으세요.&#10;&#10;[복사 붙여넣기 팁]&#10;엑셀 명렬표에서 이름들을 드래그 복사(Ctrl+C)한 후 이곳에 붙여넣기(Ctrl+V) 하시면 줄 바꿈과 공백 등을 앱이 자동으로 깔끔하게 분석하여 15~20명의 학생들을 똑똑하게 그룹화합니다.&#10;&#10;예시:&#10;정윤우&#10;강다은&#10;조시우"
                      className="w-full bg-slate-50 border border-slate-200 shadow-inner rounded-xl p-3.5 text-sm font-medium text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all font-mono leading-relaxed"
                    />

                    {studentsInput.trim() === '' && (
                      <div className="absolute bottom-3 right-3">
                        <button
                          id="load-sample-btn"
                          onClick={handleLoadSampleNames}
                          className="text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1"
                          title="예시 가상 명렬표 20명을 임시 로드합니다"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                          가상 예시 명단 채우기
                        </button>
                      </div>
                    )}
                  </div>



                  {/* Save current roster progress helper */}
                  {!isEditingClass && selectedClassId !== 'custom' && (
                    <div className="flex justify-end pt-1">
                      <button
                        id="save-roster-changes-btn"
                        onClick={handleSaveClass}
                        className="text-xs bg-slate-800 text-slate-100 hover:bg-slate-900 font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        현재 명렬표 변경사항 학급에 저장
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Grouping Numbers setup & Start Grouping Button */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Advanced group preferences card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
                  <h2 className="text-sm font-bold text-slate-700 tracking-tight pb-2 border-b border-slate-100">
                    모둠 구성 설정
                  </h2>

                  {/* Modums quantity select cards (2 to 5 groups) */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      모둠 구성 설정 (최소 2 - 최대 5모둠)
                    </label>
                    <div className="flex gap-3">
                      {[2, 3, 4, 5].map((num) => (
                        <button
                          id={`group-count-select-${num}`}
                          key={num}
                          type="button"
                          onClick={() => {
                            playOscillatorSound('click');
                            setGroupCount(num);
                          }}
                          className={`flex-1 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                            groupCount === num
                              ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border shadow-2xs border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {num}모둠
                        </button>
                      ))}
                    </div>
                    
                    {/* Size guidance micro calculators */}
                    {parsedStudentsCount > 0 && (
                      <p className="text-xs text-slate-400 pt-1 flex items-center gap-1 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        배치 시 각 모둠별 학생 수: 
                        <span className="font-extrabold text-indigo-600">
                          {Math.floor(parsedStudentsCount / groupCount)}~{Math.ceil(parsedStudentsCount / groupCount)}명
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Leader automatic toggle check box */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-250 transition-all cursor-pointer select-none"
                      onClick={() => { playOscillatorSound('click'); setIsLeaderAuto(!isLeaderAuto); }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 mt-0.5">
                          <Crown className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">모둠장(조장) 자동 1명 선출</p>
                          <p className="text-[10px] text-slate-400">모둠이 결성될 때마다 무작위로 1명의 조장을 임명합니댜.</p>
                        </div>
                      </div>
                      <input
                        id="auto-leader-checkbox"
                        type="checkbox"
                        checked={isLeaderAuto}
                        onChange={(e) => {
                          e.stopPropagation();
                          playOscillatorSound('click');
                          setIsLeaderAuto(e.target.checked);
                        }}
                        className="w-4 h-4 text-indigo-600 border-slate-350 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Validation Error banner */}
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium leading-relaxed shadow-xs"
                  >
                    ⚠️ {errorMessage}
                  </motion.div>
                )}

                {/* Start Shuffle Launcher Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col gap-3">
                    <button
                      id="start-placement-btn"
                      onClick={handleStartGroupingSequence}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <Shuffle className="w-4 h-4" />
                      모둠 랜덤 배치 시작하기
                    </button>
                    
                    <button
                      id="reset-placement-btn"
                      onClick={() => {
                        playOscillatorSound('click');
                        setStudentsInput('');
                        setErrorMessage(null);
                      }}
                      className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      명렬표 전체 비우기
                    </button>
                  </div>
                  
                  <div className="text-[10px] text-white/70">
                    * 초기화는 배치 완료 화면 하단의 초기화 버튼으로 가능합니다.
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* VIEW 2: COUNTDOWN SCREEN */}
          {currentView === 'Countdown' && (
            <motion.div
              key="countdown-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-h-[460px] bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
            >
              {/* Spinning cosmic grid lines decoration in background */}
              <div className="absolute inset-0 bg-radial-gradient from-indigo-50/40 via-transparent to-transparent pointer-none" />
              
              <div className="relative z-10 space-y-8 max-w-md w-full">
                
                {/* Visual Status Indicator */}
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 animate-pulse">
                    모둠 제비뽑기 진행 중
                  </span>
                  <h2 className="text-lg font-bold text-slate-800">
                    운명의 모둠 추첨! 잠시만 기다려 주세요
                  </h2>
                </div>

                {/* Shuffling mini screen */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 inline-block text-xs font-mono font-bold text-slate-500 shadow-inner">
                  {shufflingNames}
                </div>

                {/* Big Countdown graphic text */}
                <div className="h-44 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={countdownText}
                      initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 1.4, rotate: 20 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 260, 
                        damping: 20,
                        duration: 0.3
                      }}
                      className="font-display font-extrabold text-8xl md:text-9xl text-indigo-600 drop-shadow-md select-none tracking-tight"
                    >
                      {countdownText}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Skip option under pressure */}
                <div>
                  <button
                    id="skip-countdown-btn"
                    onClick={() => {
                      playOscillatorSound('complete');
                      const studentsArray = parseNamesList(studentsInput);
                      finalizeGroupPlacements(studentsArray);
                    }}
                    className="text-xs text-slate-400 hover:text-indigo-600 hover:underline transition font-semibold"
                  >
                    카운트다운 건너뛰고 바로 보기 ➔
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW 3: GROUP RESULT SCREEN */}
          {currentView === 'Result' && (
            <motion.div
              key="result-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              
              {/* Command Action bar for results looking like Sleek Design HTML */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
                    배치 결과
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      {activeClassName} &bull; {groupCount}모둠
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    총 {parseNamesList(studentsInput).length}명의 학생을 공평하게 배정하였습니다.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Copy Button */}
                  <button
                    id="copy-results-btn"
                    onClick={handleCopyResultsToClipboard}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                      copiedSuccess 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>결과 복사하기</span>
                      </>
                    )}
                  </button>

                  {/* Reshuffle Button on the fly */}
                  <button
                    id="reshuffle-btn"
                    onClick={handleStartGroupingSequence}
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100/50 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>순서 재섞기</span>
                  </button>
                </div>
              </div>

              {/* Informative swap guide message */}
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 shrink-0 text-amber-600" />
                <p className="font-semibold text-slate-700">
                  {swapSelection ? (
                    <span className="animate-pulse">
                      선택됨: <span className="text-indigo-600 font-extrabold">[{swapSelection.studentName}]</span> 학생과 자리를 교환할 다른 학생을 아래에서 클릭하세요. (취소하려면 빈 공간 클릭)
                    </span>
                  ) : (
                    <span>
                      💡 <strong className="text-amber-900">자리 교체 꿀팁:</strong> 학생 명단의 칩을 차례대로 2개 선택하면 서로 자리를 직접 바꿀 수 있습니다!
                    </span>
                  )}
                </p>
                {swapSelection && (
                  <button
                    onClick={() => { playOscillatorSound('click'); setSwapSelection(null); }}
                    className="ml-auto text-amber-900 hover:bg-amber-100 p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Group placement grids cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                
                {groupResults.map((group, groupIdx) => {
                  
                  // Map theme options by group index
                  const theme = GROUP_COLORS[groupIdx % GROUP_COLORS.length];

                  return (
                    <motion.div
                      id={`group-card-${groupIdx}`}
                      key={group.groupIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIdx * 0.08 }}
                      className={`flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow duration-200 ${theme.bg}`}
                    >
                      {/* Card Header styling */}
                      <div>
                        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-display font-bold text-xs tracking-wider uppercase text-slate-600">
                              {group.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${theme.badge}`}>
                              {group.students.length}명
                            </span>
                          </div>

                          <button
                            onClick={() => handleSelectLeaderInteractively(group.groupIndex)}
                            className="text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 p-1 rounded-md transition"
                            title="모둠장 신규 선정"
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Student Name list body */}
                        <div className="py-3 space-y-2 flex-grow">
                          {group.students.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 py-6">
                              배정된 학생이 없습니다.
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {group.students.map((studentName, sIdx) => {
                                const isLeader = group.leader === studentName;
                                const isSelectedForSwap = swapSelection?.groupIndex === group.groupIndex && swapSelection?.studentIndex === sIdx;

                                return (
                                  <motion.button
                                    id={`student-${groupIdx}-${sIdx}`}
                                    key={sIdx}
                                    onClick={() => handleStudentSelectForSwap(group.groupIndex, sIdx, studentName)}
                                    whileHover={{ scale: 1.01 }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all group cursor-pointer ${
                                      isSelectedForSwap
                                        ? 'bg-indigo-600 text-white shadow-xs border border-indigo-700 ring-4 ring-indigo-200 animate-pulse'
                                        : isLeader
                                          ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                                          : `bg-slate-50 hover:bg-slate-100/80 border border-slate-100 text-slate-700 ${theme.chipHover}`
                                    }`}
                                  >
                                    <div className="flex items-center space-x-1.5 truncate">
                                      <span className="text-slate-400 font-mono text-[10px] w-5">
                                        {sIdx < 9 ? `0${sIdx+1}` : sIdx+1}
                                      </span>
                                      <span className="truncate font-semibold text-slate-800">{studentName}</span>
                                    </div>

                                    {/* Crown visual asset for appointed leader */}
                                    {isLeader && (
                                      <span className="bg-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shadow-2xs animate-bounce">
                                        대표
                                      </span>
                                    )}
                                    
                                    {/* Swap hint icon */}
                                    {!isLeader && (
                                      <ArrowLeftRight className="w-3 h-3 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0" />
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {group.leader ? '모둠장 지정됨 👑' : '모둠장 없음'}
                        </span>
                        
                        <button
                          onClick={() => handleSelectLeaderInteractively(group.groupIndex)}
                          className={`text-[10px] font-bold ${theme.accent} hover:underline`}
                        >
                          {group.leader ? '대표 바꾸기' : '대표 지정'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

              </div>

              {/* Extra Feature: Presentation Team Lottery Picker */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-indigo-50 pb-4">
                  <div className="flex items-center space-x-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-100">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        발표 또는 과제 제출 순서 추첨기
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded-full border border-amber-100">
                          수업용 게임
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        어느 모둠이 가장 먼저 발표할지 랜덤으로 신속하게 추첨해보세요.
                      </p>
                    </div>
                  </div>

                  <button
                    id="lucky-draw-btn"
                    onClick={handleLuckyDrawPresenterGroup}
                    disabled={isDrawingGroup}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-bold rounded-xl shadow-md transition duration-150 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    {isDrawingGroup ? '돌려보는 중...' : '발표 모둠 추첨하기 🎲'}
                  </button>
                </div>

                {/* Display Lucky draw announcement screen */}
                <AnimatePresence mode="wait">
                  {luckyDrawResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col items-center text-center max-w-sm mx-auto"
                    >
                      <span className="text-[10px] font-bold text-amber-600 bg-white border border-amber-150 px-2.5 py-0.5 rounded-full shadow-2xs mb-2">
                        당첨 발표 모둠
                      </span>
                      <p className="text-3xl font-extrabold text-amber-800 font-display animate-bounce">
                        🎉 {luckyDrawResult}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        발표 준비해 주세요!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Back to Setup Button (초기화) */}
              <div className="flex justify-center pt-4">
                <button
                  id="reset-placement-btn"
                  onClick={handleResetToSetup}
                  className="w-full max-w-sm py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-4 h-4 text-slate-405" />
                  배치 초기화 및 처음으로 돌아가기
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Modern Dialog Help Instructions Overlay */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuideModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Dialog container content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl max-w-md w-full relative z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  학급 모둠 랜덤 배치기 가이드
                </h3>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800">📋 엑셀 붙여넣기 100% 지원</p>
                  <p>
                    엑셀 파일의 명렬표 열 영역을 드래그해서 전체 복사한 후, 텍스트 상자에 간편하게 붙여넣기하세요! 학적 번호나 기호(예: "1. 김민수", "02번 이영희")가 섞여 있어도 지능적으로 순수 이름만 추출하여 깔끔하게 배정합니다.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800">🏫 여러 반 학급 저장 기능</p>
                  <p>
                    상단의 <strong>‘새 학급 추가’</strong> 혹은 <strong>‘이름 변경’</strong> 기능을 사용하여 복수의 교실 명단을 이름별로 분류하여 저장해둘 수 있습니다. 브라우저 저장공간(localStorage)에 안전하게 유지되므로 안심하십시오.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800">👑 모둠장(조장) 관리 기능</p>
                  <p>
                    배치 완료할 때 자동으로 모둠장을 1명씩 뽑아주거나, 결과를 보면서 개별 모둠 카드의 '대표 뽑기' 버튼을 클릭해 실시간으로 대표를 랜덤이나 원하는 인물로 정할 수 있습니다.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800">🔄 자유로운 학생 드래그리스 자리 이동</p>
                  <p>
                    배치 결과 화면에서 <strong>서로 자리를 바꿀 학생 칩 2개를 차례대로 연속 터치/클릭</strong>만 하면 두 학생의 모둠이 즉시 교환됩니다. 수업 조율 시 매우 유용하게 사용할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => { playOscillatorSound('click'); setShowGuideModal(false); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  확인했습니다
                </button>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* Sleek Aesthetic Footer branding */}
      <footer className="h-10 bg-slate-100 border-t border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest hidden sm:block">
          &copy; {new Date().getFullYear()} GroupMaker Pro &bull; READY FOR RANDOMIZATION
        </p>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest sm:hidden">
          &copy; {new Date().getFullYear()} GroupMaker Pro
        </p>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-500 font-bold tracking-tighter">SYSTEM: OPTIMAL</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </footer>
    </div>
  );
}
