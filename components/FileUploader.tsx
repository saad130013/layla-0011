
import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Employee } from '../types';

interface Props {
  onDataLoaded: (data: Employee[]) => void;
}

const FileUploader: React.FC<Props> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws) as any[];

          // Full column validation from the provided image
          const requiredColumns = [
            "NAME (ENG)", "NAME (AR)", "G", "NATIONALITY", 
            "ID#", "EMP#", "COMPANY", "POSITION", 
            "MRN", "LOCATION", "SourceSheet"
          ];

          if (data.length > 0) {
            const firstRow = data[0];
            const missing = requiredColumns.filter(col => !(col in firstRow));
            if (missing.length > 0) {
              setError(`الملف يفتقر إلى الأعمدة الإلزامية التالية: ${missing.join(', ')}`);
              setLoading(false);
              return;
            }
          } else {
            setError("الملف فارغ أو لا يحتوي على بيانات صالحة.");
            setLoading(false);
            return;
          }

          onDataLoaded(data as Employee[]);
        } catch (err) {
          setError("حدث خطأ أثناء قراءة محتوى الملف. يرجى التأكد من أنه ملف Excel صالح.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setError("تعذر معالجة الملف.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-12">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-indigo-100">
          <Upload size={40} />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">مركز رفع البيانات الشامل</h2>
        <p className="text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed font-medium">
          يرجى رفع ملف Excel الذي يحتوي على الأعمدة الرقابية الـ 11 المعتمدة (ID#, EMP#, MRN, Nationality, etc).
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-2xl mx-auto">
          {["ID#", "EMP#", "MRN", "COMPANY", "NATIONALITY"].map(label => (
            <span key={label} className="bg-slate-100 text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-black border border-slate-200 shadow-sm">
              {label}
            </span>
          ))}
          <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black border border-indigo-700 shadow-sm">
            SourceSheet
          </span>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl flex items-start gap-4 text-right">
            <AlertCircle size={24} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm mb-1">خطأ في بنية الملف:</p>
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls, .csv"
          className="hidden" 
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="bg-indigo-900 hover:bg-black text-white px-12 py-5 rounded-[24px] font-black text-xl transition-all shadow-2xl hover:shadow-indigo-200 flex items-center gap-4 mx-auto disabled:opacity-50 active:scale-95"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <FileSpreadsheet size={24} />
          )}
          {loading ? 'جاري معالجة البيانات...' : 'اختيار ملف الإكسل'}
        </button>
        
        <p className="mt-8 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
          Standardized Regulatory Data Processor v2.0
        </p>
      </div>
    </div>
  );
};

export default FileUploader;
