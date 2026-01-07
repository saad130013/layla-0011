
import React from 'react';
import { ValidationState } from '../types';
import { ShieldCheck, Table as TableIcon, CheckCircle2, AlertTriangle, ArrowLeft, Fingerprint } from 'lucide-react';

interface Props {
  validation: ValidationState;
  onProceed: () => void;
}

const ValidationSummary: React.FC<Props> = ({ validation, onProceed }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-900 text-white rounded-2xl shadow-lg">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">التحقق المرجعي والرقابة التشغيلية</h2>
          <p className="text-slate-500 italic text-sm">Official Operational Reference Check</p>
        </div>
      </div>

      {/* STEP 1: Total Regions */}
      <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg opacity-80 mb-1">الخطوة 1: استخراج عدد المناطق الفعلي</h3>
          <p className="text-3xl font-bold">
            عدد المناطق التشغيلية في النظام = <span className="text-yellow-400">{validation.totalRegions}</span> منطقة
          </p>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center gap-3 relative z-10 border border-white/20">
          <CheckCircle2 className="text-green-400" size={24} />
          <span className="text-sm font-semibold">مرجع رسمي: SourceSheet</span>
        </div>
        <Fingerprint className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-12" />
      </div>

      <div className="grid lg:grid-cols-1 gap-8">
        {/* STEP 2 & 3: Consolidated Reference & Validation Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <TableIcon size={18} className="text-indigo-600" />
              الجدول المرجعي ومطابقة أعداد العمالة
            </h3>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold uppercase">Official Validation Table</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">رقم المرجع</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">اسم المنطقة التشغيلية</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-center">عدد الموظفين المعتمد</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-center">حالة المطابقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validation.validationTable.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-400 font-mono">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800">{row.name}</td>
                    <td className="px-6 py-4 text-sm font-black text-indigo-700 text-center bg-indigo-50/30">{row.count} موظف</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {validation.errors.length > 0 ? (
        <div className="mt-8 p-8 bg-red-50 border-2 border-red-200 rounded-[32px] flex flex-col gap-5 shadow-xl">
          <div className="flex items-center gap-4 text-red-700 font-black text-xl">
            <AlertTriangle size={32} className="shrink-0" />
            ⚠️ تحذير: تم رصد قيم غير مرتبطة بأي منطقة معتمدة
          </div>
          <p className="text-sm font-bold text-red-600">
            يرجى مراجعة البيانات حيث توجد سجلات تفتقر لاسم منطقة تشغيلية (SourceSheet).
          </p>
        </div>
      ) : (
        <div className="mt-12 text-center pb-12">
          <button
            onClick={onProceed}
            className="bg-indigo-900 hover:bg-black text-white px-16 py-5 rounded-3xl font-black text-xl transition-all shadow-2xl flex items-center gap-4 mx-auto active:scale-95 group"
          >
            اعتماد المرجع والبدء بالتحليل
            <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ValidationSummary;
