
import React, { useState, useEffect, useRef } from 'react';
import { Employee } from '../types';
import confetti from 'canvas-confetti';

interface LuckyDrawProps {
  employees: Employee[];
  onAddWinner: (employee: Employee) => void;
  winners: Employee[];
  onClearWinners: () => void;
}

const LuckyDraw: React.FC<LuckyDrawProps> = ({ employees, onAddWinner, winners, onClearWinners }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const [displayedEmployee, setDisplayedEmployee] = useState<Employee | null>(null);
  const [lastWinner, setLastWinner] = useState<Employee | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 初始化 AudioContext
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // 播放滾動音效 (Tick)
  const playTick = () => {
    if (isMuted) return;
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  // 播放中獎音效 (Fanfare)
  const playWinSound = () => {
    if (isMuted) return;
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // 慶祝琶音: C4, E4, G4, C5
    playNote(261.63, now, 0.5);
    playNote(329.63, now + 0.1, 0.5);
    playNote(392.00, now + 0.2, 0.5);
    playNote(523.25, now + 0.3, 1.0);
    // 最後大和弦
    playNote(392.00 * 2, now + 0.4, 1.5);
  };

  const availableEmployees = allowRepeat 
    ? employees 
    : employees.filter(e => !winners.some(w => w.id === e.id));

  useEffect(() => {
    if (!isSpinning && !showWinnerModal) {
      setDisplayedEmployee(availableEmployees[0] || null);
    }
  }, [employees, winners, isSpinning, showWinnerModal, allowRepeat]);

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ['#6366f1', '#f59e0b', '#10b981'];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const startDraw = () => {
    if (availableEmployees.length === 0) return;
    
    // 確保 AudioContext 在互動後啟動
    getAudioCtx().resume();

    const snapshot = [...availableEmployees];
    setIsSpinning(true);
    setShowWinnerModal(false);
    
    let speed = 50;
    let count = 0;
    const totalSteps = 50 + Math.floor(Math.random() * 30);
    let localIndex = 0;

    const step = () => {
      localIndex = (localIndex + 1) % snapshot.length;
      const currentPerson = snapshot[localIndex];
      setDisplayedEmployee(currentPerson);
      
      // 播放每一跳的聲音
      playTick();
      
      count++;

      if (count < totalSteps) {
        if (count > totalSteps - 15) speed += 35;
        else if (count > totalSteps - 30) speed += 10;
        
        timerRef.current = window.setTimeout(step, speed);
      } else {
        const winner = snapshot[localIndex];
        setLastWinner(winner);
        setDisplayedEmployee(winner);
        
        setIsSpinning(false);
        setShowWinnerModal(true);
        
        // 播放大獎音效與噴花
        playWinSound();
        triggerConfetti();
        
        onAddWinner(winner);
      }
    };

    step();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-5xl mx-auto relative">
      
      {/* 中獎大彈窗 (Modal) */}
      {showWinnerModal && lastWinner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center transform animate-in zoom-in slide-in-from-bottom-10 duration-500 border-4 border-yellow-400">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-500 mb-2">恭喜得獎者！</h3>
            <div className="text-5xl font-black text-indigo-600 mb-8 drop-shadow-sm">{lastWinner.name}</div>
            <button 
              onClick={() => setShowWinnerModal(false)}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
            >
              太棒了！
            </button>
          </div>
        </div>
      )}

      <div className="w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col items-center p-12 relative">
        <div className="absolute top-8 left-12 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isSpinning ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isSpinning ? '正在抽籤' : '準備就緒'}</span>
            </div>
            {/* 靜音切換按鈕 */}
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className={`p-1.5 rounded-lg transition-colors ${isMuted ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:text-indigo-500'}`}
              title={isMuted ? '取消靜音' : '靜音'}
            >
              {isMuted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M12 5l-4.707 4.707H4v6h3.293L12 20V5z" /></svg>
              )}
            </button>
        </div>

        <h2 className="text-4xl font-black text-slate-800 mb-2 mt-4">幸運大抽籤</h2>
        <p className="text-slate-500 mb-12 font-medium">候選人數：<span className="text-indigo-600 font-bold px-2 py-1 bg-indigo-50 rounded-lg ml-1">{availableEmployees.length}</span></p>

        {/* 抽籤跳動顯示區 */}
        <div className="relative w-full h-64 bg-slate-900 rounded-[2.5rem] flex items-center justify-center overflow-hidden mb-12 border-[12px] border-slate-800 shadow-2xl">
           <div className={`text-6xl md:text-8xl font-black tracking-tight transition-all duration-75 ${isSpinning ? 'text-indigo-400 blur-[2px] scale-95 opacity-80' : 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]'}`}>
            {displayedEmployee ? (
              displayedEmployee.name
            ) : (
              <span className="text-2xl text-slate-500 font-normal">名單已用盡</span>
            )}
          </div>
          
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            <div className="w-full h-1 bg-white animate-[scan_2s_linear_infinite]"></div>
          </div>
          <style>{`
            @keyframes scan {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(600%); }
            }
          `}</style>

          <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-slate-600"></div>
          <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-slate-600"></div>
          <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-slate-600"></div>
          <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-slate-600"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-10 items-center w-full justify-center">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={allowRepeat} 
                onChange={() => setAllowRepeat(!allowRepeat)} 
                disabled={isSpinning}
              />
              <div className={`block w-14 h-8 rounded-full transition-colors shadow-inner ${allowRepeat ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${allowRepeat ? 'translate-x-6' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm font-bold text-slate-600 select-none group-hover:text-indigo-600 transition-colors">允許重複抽中</span>
          </label>

          <button
            onClick={startDraw}
            disabled={isSpinning || availableEmployees.length === 0}
            className={`px-20 py-5 rounded-[1.5rem] font-black text-2xl shadow-2xl transform transition-all active:scale-90 ${
              isSpinning || availableEmployees.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white hover:shadow-indigo-200 hover:-translate-y-1'
            }`}
          >
            {isSpinning ? '正在抽獎...' : '開始抽籤'}
          </button>
        </div>
      </div>

      <div className="w-full mt-16 bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
          <h3 className="text-2xl font-black text-slate-800 flex items-center">
            <span className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-white mr-3 shadow-lg shadow-yellow-100">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </span>
            得獎名單 ({winners.length})
          </h3>
          {winners.length > 0 && (
            <button 
                onClick={onClearWinners}
                className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
            >
                清空紀錄
            </button>
          )}
        </div>
        
        {winners.length === 0 ? (
          <div className="text-center py-16 text-slate-300 border-4 border-dashed border-slate-50 rounded-[2rem]">
            <p className="text-lg font-medium">還沒有人得獎，準備好開獎了嗎？</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {winners.map((winner, idx) => (
              <div 
                key={`${winner.id}-${idx}`} 
                className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-indigo-100 hover:scale-[1.05] transition-all duration-300 animate-in zoom-in"
              >
                <div className="text-[10px] text-indigo-300 font-bold mb-2">得獎序號 {winners.length - idx}</div>
                <span className="text-indigo-900 font-black text-xl">{winner.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyDraw;
