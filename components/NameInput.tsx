
import React, { useState, useEffect, useMemo } from 'react';
import { Employee } from '../types';

interface NameInputProps {
  onUpdate: (employees: Employee[]) => void;
  currentEmployees: Employee[];
}

// Fix: Explicitly type MOCK_NAMES as string[] to avoid unknown[] inference
const MOCK_NAMES: string[] = [
  "王小明", "李大華", "陳美麗", "張三", "李四", 
  "趙六", "孫悟空", "周杰倫", "林俊傑", "蔡依林", 
  "郭台銘", "張忠謀", "馬斯克", "比爾蓋茲", "賈伯斯",
  "娜美", "路飛", "索隆", "香吉士", "羅賓"
];

const NameInput: React.FC<NameInputProps> = ({ onUpdate, currentEmployees }) => {
  const [inputText, setInputText] = useState(currentEmployees.map(e => e.name).join('\n'));

  // 偵測重複姓名
  const duplicateInfo = useMemo(() => {
    const names = inputText.split(/[\n,]/).map(n => n.trim()).filter(n => n !== '');
    const counts: Record<string, number> = {};
    names.forEach(name => {
      counts[name] = (counts[name] || 0) + 1;
    });
    const duplicates = Object.keys(counts).filter(name => counts[name] > 1);
    return { names, duplicates };
  }, [inputText]);

  useEffect(() => {
    if (currentEmployees.length === 0 && inputText !== '') {
      setInputText('');
    }
  }, [currentEmployees]);

  const parseNames = (namesArray: string[]): Employee[] => {
    return namesArray.map((name, index) => ({
      id: `emp-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    const names = text.split(/[\n,]/).map(n => n.trim()).filter(n => n !== '');
    onUpdate(parseNames(names));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const names = content.split(/[\n,]/)
        .map(n => n.trim())
        .filter(n => n !== '' && !/Name|姓名/gi.test(n));
      setInputText(names.join('\n'));
      onUpdate(parseNames(names));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadMockData = () => {
    setInputText(MOCK_NAMES.join('\n'));
    // Fix: Explicitly call parseNames with string[]
    onUpdate(parseNames(MOCK_NAMES));
  };

  const removeDuplicates = () => {
    // Fix: Use Array.from with explicit generic type to ensure uniqueNames is string[] and avoid unknown[] inference
    const uniqueNames: string[] = Array.from(new Set<string>(duplicateInfo.names));
    setInputText(uniqueNames.join('\n'));
    onUpdate(parseNames(uniqueNames));
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-4xl mx-auto mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">名單管理</h2>
          <p className="text-slate-500 text-sm mt-1">上傳 CSV/TXT 文件或直接貼上姓名</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button 
            onClick={loadMockData}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-semibold"
          >
            載入範例名單
          </button>
          <label className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors shadow-sm text-sm font-semibold">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            檔案上傳
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <textarea
        value={inputText}
        onChange={handleTextChange}
        placeholder="請輸入姓名，例如：&#10;王小明&#10;李大華, 陳美麗&#10;張三"
        className="w-full h-80 p-6 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 leading-relaxed shadow-inner"
      />

      {duplicateInfo.duplicates.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center text-amber-800 text-sm">
            <svg className="w-5 h-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            偵測到重複姓名：<span className="font-bold ml-1">{duplicateInfo.duplicates.join(', ')}</span>
          </div>
          <button 
            onClick={removeDuplicates}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm whitespace-nowrap"
          >
            一鍵移除重複
          </button>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-slate-500">有效人數：<strong className="text-indigo-600 text-lg">{currentEmployees.length}</strong> 人</span>
        <button 
          onClick={() => { setInputText(''); onUpdate([]); }}
          className="px-4 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold"
        >
          清除全部
        </button>
      </div>
    </div>
  );
};

export default NameInput;
