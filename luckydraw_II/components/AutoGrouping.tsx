
import React, { useState } from 'react';
import { Employee, Group } from '../types';
import { generateTeamNames } from '../services/geminiService';

interface AutoGroupingProps {
  employees: Employee[];
}

const TEAM_COLORS = [
  'border-blue-500 bg-blue-50',
  'border-emerald-500 bg-emerald-50',
  'border-amber-500 bg-amber-50',
  'border-rose-500 bg-rose-50',
  'border-purple-500 bg-purple-50',
  'border-indigo-500 bg-indigo-50',
  'border-orange-500 bg-orange-50',
  'border-cyan-500 bg-cyan-50',
  'border-fuchsia-500 bg-fuchsia-50',
  'border-lime-500 bg-lime-50',
];

const AutoGrouping: React.FC<AutoGroupingProps> = ({ employees }) => {
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState('創意職場');

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const handleGroup = async () => {
    if (employees.length === 0) return;
    setIsGenerating(true);

    // Fix: Explicitly type shuffled to Employee[] to avoid unknown[] inference issues
    const shuffled: Employee[] = shuffleArray<Employee>(employees);
    const numGroups = Math.ceil(employees.length / groupSize);
    
    // Get creative names from Gemini
    const teamNames = await generateTeamNames(numGroups, theme);

    const newGroups: Group[] = [];
    for (let i = 0; i < numGroups; i++) {
      newGroups.push({
        id: `group-${i}-${Date.now()}`,
        name: teamNames[i] || `第 ${i + 1} 組`,
        members: shuffled.slice(i * groupSize, (i + 1) * groupSize)
      });
    }

    setGroups(newGroups);
    setIsGenerating(false);
  };

  const downloadCsv = () => {
    if (groups.length === 0) return;

    // CSV Header
    let csvContent = "小組名稱,成員姓名\n";

    // CSV Body
    groups.forEach(group => {
      group.members.forEach(member => {
        csvContent += `${group.name},${member.name}\n`;
      });
    });

    // Handle UTF-8 BOM for Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `分組結果_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-end gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">自動分配與分組</h2>
            <p className="text-slate-500 mb-6 font-medium">智能分配名單成員，AI 生成充滿活力的團隊名稱。</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">每組目標人數</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={employees.length}
                    value={groupSize}
                    onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold text-indigo-600"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">人/組</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">分組主題 (由 AI 命名)</label>
                <input
                  type="text"
                  placeholder="例如：復仇者聯盟、森林、世界之都..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleGroup}
            disabled={isGenerating || employees.length === 0}
            className={`px-12 py-4 rounded-2xl font-black text-lg shadow-xl whitespace-nowrap transform transition-all active:scale-95 ${
              isGenerating || employees.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-indigo-200 hover:-translate-y-1'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在運算分組...
              </span>
            ) : '確認分組'}
          </button>
        </div>
      </div>

      {groups.length > 0 && (
        <>
          <div className="flex justify-end mb-6">
            <button 
              onClick={downloadCsv}
              className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              下載分組結果 (CSV)
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group, gIdx) => (
              <div 
                key={group.id} 
                className={`bg-white rounded-2xl shadow-lg border-t-8 p-6 flex flex-col hover:scale-[1.02] transition-all duration-300 ${TEAM_COLORS[gIdx % TEAM_COLORS.length]}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight">{group.name}</h3>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Group {gIdx + 1}</div>
                  </div>
                  <span className="bg-white/80 backdrop-blur-sm text-indigo-600 font-black px-3 py-1 rounded-full text-xs shadow-sm border border-indigo-100">
                    {group.members.length} 人
                  </span>
                </div>
                
                <div className="space-y-2">
                  {group.members.map((member, mIdx) => (
                    <div 
                      key={member.id} 
                      className="flex items-center bg-white/60 px-3 py-2 rounded-xl text-sm text-slate-700 font-bold shadow-sm border border-white/40 animate-in slide-in-from-left duration-300"
                      style={{ animationDelay: `${mIdx * 50}ms` }}
                    >
                      <div className="w-5 h-5 bg-indigo-100 rounded-full mr-3 flex items-center justify-center text-[10px] text-indigo-600">
                        {mIdx + 1}
                      </div>
                      {member.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {groups.length === 0 && employees.length > 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-slate-400 text-xl font-medium">請在上方設定分組條件後開始</p>
        </div>
      )}
    </div>
  );
};

export default AutoGrouping;
