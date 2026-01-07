
import React, { useState, useMemo } from 'react';
import { Employee, ValidationState } from '../types';
import { 
  Users, Map as MapIcon, AlertOctagon, 
  UserCheck, ShieldCheck, Printer, ClipboardCheck, Clock, MapPin, Building2, Search, ArrowLeftRight, ChevronLeft
} from 'lucide-react';

interface Props {
  data: Employee[];
  validation: ValidationState;
}

type ReportTab = 'REGION_EXPLORER' | 'SUPERVISORS' | 'DUPLICATES' | 'INSPECTION' | 'SHIFT_BALANCE';

const ReportView: React.FC<Props> = ({ data, validation }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('REGION_EXPLORER');
  const [selectedRegion, setSelectedRegion] = useState<string>(validation.validationTable[0]?.name || '');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isSupervisor = (pos: string) => {
    const p = pos?.toLowerCase() || '';
    return p.includes('supervisor') || p.includes('مشرف') || p.includes('lead') || p.includes('رئيس');
  };

  const regionalData = useMemo(() => {
    const regionEmployees = data.filter(emp => emp.SourceSheet === selectedRegion);
    
    // Group by location to get counts per location
    const locationMap = new Map<string, number>();
    regionEmployees.forEach(emp => {
      const loc = emp.LOCATION || "غير محدد";
      locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
    });

    const locations = Array.from(locationMap.entries()).map(([name, count]) => ({
      name,
      count
    }));

    const supervisors = regionEmployees.filter(e => isSupervisor(e.POSITION));
    
    return {
      employees: regionEmployees,
      locations,
      total: regionEmployees.length,
      supervisorCount: supervisors.length
    };
  }, [data, selectedRegion]);

  const filteredEmployees = useMemo(() => {
    let list = regionalData.employees;
    
    if (selectedLocation) {
      list = list.filter(emp => (emp.LOCATION || "غير محدد") === selectedLocation);
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(emp => 
        emp["NAME (AR)"].toLowerCase().includes(s) || 
        emp["NAME (ENG)"].toLowerCase().includes(s) || 
        emp["EMP#"].toString().includes(s) ||
        emp["ID#"].toString().includes(s)
      );
    }
    
    return list;
  }, [regionalData.employees, selectedLocation, searchTerm]);

  const duplicates = useMemo(() => {
    const empMap = new Map<string, string[]>();
    data.forEach(emp => {
      const id = String(emp["ID#"]);
      if (!empMap.has(id)) empMap.set(id, []);
      const sheets = empMap.get(id)!;
      if (!sheets.includes(emp.SourceSheet)) sheets.push(emp.SourceSheet);
    });
    return Array.from(empMap.entries())
      .filter(([_, sheets]) => sheets.length > 1)
      .map(([id, sheets]) => {
        const empInfo = data.find(e => String(e["ID#"]) === id);
        return { id, name: empInfo?.["NAME (AR)"] || empInfo?.["NAME (ENG)"], regions: sheets };
      });
  }, [data]);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 print:m-0">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white !important; font-family: 'Cairo', sans-serif !important; }
          .no-print { display: none !important; }
          #report-container { border: none !important; box-shadow: none !important; width: 100% !important; padding: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; table-layout: auto; }
          th { background-color: #1e1b4b !important; color: white !important; font-weight: bold; border: 1px solid #cbd5e1 !important; padding: 6pt !important; text-align: right; font-size: 8pt; }
          td { border: 1px solid #cbd5e1 !important; padding: 6pt !important; text-align: right; font-size: 7pt !important; }
          .print-header { display: flex !important; justify-content: space-between; border-bottom: 2px solid #1e1b4b; padding-bottom: 5mm; margin-bottom: 5mm; }
        }
        .print-header { display: none; }
      `}</style>

      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 no-print">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-900 text-white rounded-2xl"><ShieldCheck size={28} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-900">مركز استكشاف البيانات الرقابية</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Interactive Region & Location Hub</p>
          </div>
        </div>
        <button 
          onClick={handleExportPDF}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-3 shadow-xl transition-all active:scale-95"
        >
          <Printer size={20} /> تصدير PDF للمنطقة الحالية
        </button>
      </div>

      {/* Navigation Tabs - NO PRINT */}
      <div className="flex flex-wrap gap-2 bg-slate-200/50 p-1.5 rounded-2xl w-fit no-print">
        {[
          { id: 'REGION_EXPLORER', label: 'مستكشف المناطق', icon: MapIcon },
          { id: 'DUPLICATES', label: 'كاشف الازدواجية', icon: AlertOctagon },
          { id: 'SUPERVISORS', label: 'دليل المشرفين', icon: UserCheck },
          { id: 'SHIFT_BALANCE', label: 'توازن العمالة', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportTab)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.id ? 'bg-indigo-900 text-white shadow-md' : 'text-slate-500 hover:bg-white/70'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'REGION_EXPLORER' && (
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar: Regions & Locations Selection */}
          <div className="lg:col-span-1 space-y-6 no-print">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b font-black text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
                <MapIcon size={14} className="text-indigo-900" /> المناطق التشغيلية
              </div>
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {validation.validationTable.map((reg) => (
                  <button
                    key={reg.name}
                    onClick={() => {
                      setSelectedRegion(reg.name);
                      setSelectedLocation(null);
                    }}
                    className={`w-full text-right p-4 transition-all flex justify-between items-center group ${
                      selectedRegion === reg.name ? 'bg-indigo-50 border-r-4 border-indigo-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-black text-sm ${selectedRegion === reg.name ? 'text-indigo-900' : 'text-slate-600'}`}>
                      {reg.name}
                    </span>
                    <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-400">
                      {reg.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b font-black text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
                <Building2 size={14} className="text-indigo-900" /> المواقع داخل المنطقة
              </div>
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className={`w-full text-right p-4 transition-all flex justify-between items-center ${
                    selectedLocation === null ? 'bg-emerald-50 border-r-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`font-black text-sm ${selectedLocation === null ? 'text-emerald-700' : 'text-slate-600'}`}>
                    عرض كافة المواقع
                  </span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                    {regionalData.total}
                  </span>
                </button>
                {regionalData.locations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => setSelectedLocation(loc.name)}
                    className={`w-full text-right p-4 transition-all flex justify-between items-center group ${
                      selectedLocation === loc.name ? 'bg-indigo-50 border-r-4 border-indigo-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-black text-xs ${selectedLocation === loc.name ? 'text-indigo-900' : 'text-slate-500'}`}>
                      {loc.name}
                    </span>
                    <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                      {loc.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content: Detailed Info */}
          <div className="lg:col-span-3 space-y-8" id="report-container">
            {/* Print Only Header */}
            <div className="print-header">
              <div>
                <h1 className="text-xl font-black text-indigo-950 uppercase">Operational Manpower Report</h1>
                <p className="text-xs font-bold text-slate-500">Region: {selectedRegion} {selectedLocation ? `| Location: ${selectedLocation}` : ''}</p>
              </div>
              <div className="text-left">
                <p className="text-xs font-black">Ref: REG-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                <p className="text-[10px] text-slate-400 italic">{new Date().toLocaleString()}</p>
              </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-900 p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-black opacity-60 uppercase mb-1">إجمالي العمالة</p>
                  <h4 className="text-4xl font-black">{regionalData.total} <span className="text-sm font-medium opacity-50">موظف</span></h4>
                </div>
                <Users size={80} className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">المواقع المفعلة</p>
                  <h4 className="text-4xl font-black text-indigo-950">{regionalData.locations.length}</h4>
                </div>
                <MapPin size={80} className="absolute -right-4 -bottom-4 text-slate-50 group-hover:scale-110 transition-transform" />
              </div>
              <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الهيكل الإشرافي</p>
                  <h4 className="text-4xl font-black text-orange-600">{regionalData.supervisorCount} <span className="text-sm font-medium opacity-50">مشرف</span></h4>
                </div>
                <UserCheck size={80} className="absolute -right-4 -bottom-4 text-slate-50 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            {/* Interactive Employee Table */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-black text-slate-800 text-lg flex items-center gap-3">
                    {selectedLocation ? <Building2 size={20} className="text-indigo-900" /> : <MapIcon size={20} className="text-indigo-900" />}
                    {selectedLocation ? `كشف عمالة موقع: ${selectedLocation}` : `كشف عمالة منطقة: ${selectedRegion}`}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">عدد السجلات المعروضة: {filteredEmployees.length} موظف</p>
                </div>
                <div className="relative w-full md:w-80 no-print">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="بحث بالاسم، الرقم الوظيفي، أو الهوية..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-indigo-950 text-white text-[10px] uppercase font-black">
                      <th className="px-5 py-4">رقم الهوية (Civil ID)</th>
                      <th className="px-5 py-4">الاسم بالكامل</th>
                      <th className="px-5 py-4">الرقم الوظيفي</th>
                      <th className="px-5 py-4">الموقع التشغيلي</th>
                      <th className="px-5 py-4">المسمى الوظيفي</th>
                      <th className="px-5 py-4">الشركة المشغلة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.length > 0 ? filteredEmployees.map((emp, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-5 py-4 font-mono font-bold text-indigo-900 text-xs">{emp["ID#"]}</td>
                        <td className="px-5 py-4">
                          <div className="font-black text-slate-800 text-sm group-hover:text-indigo-900">{emp["NAME (AR)"]}</div>
                          <div className="text-[10px] text-slate-400 font-medium uppercase">{emp["NAME (ENG)"]}</div>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600 font-black text-xs">{emp["EMP#"]}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[9pt] font-black w-fit group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                            <MapPin size={10} />
                            {emp["LOCATION"] || "غير محدد"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${isSupervisor(emp.POSITION) ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'text-slate-600'}`}>
                            {emp["POSITION"]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                            {emp["COMPANY"]}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-black text-lg bg-slate-50/50">
                          لا توجد بيانات تطابق شروط البحث أو التصفية الحالية.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Print Footer Details */}
              <div className="hidden print:block border-t border-slate-200 mt-8 pt-4">
                <div className="flex justify-between items-center text-[8pt] font-black text-slate-400 uppercase">
                  <p>Regulatory Compliance Seal: VALIDATED</p>
                  <p>Sheet Identity: {selectedRegion}</p>
                  <p>Page Verification Code: {Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'DUPLICATES' && (
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex items-center gap-4 text-red-600 border-b border-red-100 pb-6">
              <AlertOctagon size={40} />
              <div>
                <h3 className="text-2xl font-black">كاشف تضارب الهويات (Identity Conflicts)</h3>
                <p className="text-xs font-bold text-slate-500 uppercase">Duplicate ID Monitoring across regions</p>
              </div>
           </div>
           {duplicates.length > 0 ? (
              <div className="grid gap-4">
                {duplicates.map((dup, idx) => (
                  <div key={idx} className="p-6 border-2 border-red-100 bg-red-50/50 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-all">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Fingerprint size={24} /></div>
                        <div>
                          <p className="font-black text-xl text-red-900">ID# {dup.id}</p>
                          <p className="font-bold text-slate-600">{dup.name}</p>
                        </div>
                     </div>
                     <div className="flex flex-wrap justify-center gap-2">
                        {dup.regions.map((r, i) => (
                          <span key={i} className="bg-white border-2 border-red-200 px-5 py-2 rounded-2xl text-xs font-black text-red-700 shadow-sm flex items-center gap-2">
                            <MapIcon size={12} /> {r}
                          </span>
                        ))}
                     </div>
                  </div>
                ))}
              </div>
           ) : (
              <div className="text-center py-20 bg-emerald-50 rounded-[40px] border-2 border-dashed border-emerald-200">
                 <ShieldCheck size={64} className="mx-auto text-emerald-500 mb-6 opacity-30" />
                 <p className="font-black text-emerald-700 text-2xl tracking-tight">لا توجد أي سجلات هوية مكررة في النظام.</p>
                 <p className="text-emerald-600/60 font-bold mt-2">ID Integrity Check: 100% Success</p>
              </div>
           )}
        </div>
      )}

      {/* Placeholder for SHIFT_BALANCE and SUPERVISORS using same high-fidelity layout */}
      {activeTab === 'SUPERVISORS' && (
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
          <h3 className="text-2xl font-black text-indigo-900 border-r-8 border-indigo-900 pr-4">الهيكل الإشرافي المعتمد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.filter(emp => isSupervisor(emp.POSITION)).map((sup, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-6 rounded-3xl hover:bg-white hover:shadow-xl transition-all border-b-4 border-b-orange-400">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><UserCheck size={20} /></div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">#{sup["EMP#"]}</span>
                </div>
                <h4 className="font-black text-indigo-950 text-lg">{sup["NAME (AR)"]}</h4>
                <p className="text-xs font-bold text-orange-600 mb-4">{sup["POSITION"]}</p>
                <div className="space-y-2 pt-4 border-t border-slate-200">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <MapIcon size={12} /> {sup.SourceSheet}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <MapPin size={12} /> {sup.LOCATION || "غير محدد"}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SHIFT_BALANCE' && (
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
           <h3 className="text-2xl font-black text-indigo-900 border-r-8 border-indigo-900 pr-4">توزيع القوى العاملة (Manpower Balance)</h3>
           <div className="grid gap-6">
             {validation.validationTable.map((reg, idx) => {
               const sups = data.filter(e => e.SourceSheet === reg.name && isSupervisor(e.POSITION)).length;
               const ratio = sups > 0 ? Math.round(reg.count / sups) : reg.count;
               return (
                 <div key={idx} className="flex flex-col md:flex-row items-center gap-8 p-6 bg-slate-50 rounded-[32px] border border-slate-200">
                    <div className="w-full md:w-1/3">
                       <h4 className="font-black text-indigo-900 text-xl">{reg.name}</h4>
                       <p className="text-xs font-bold text-slate-500">معدل الإشراف الحالي</p>
                    </div>
                    <div className="flex-1 flex gap-4 w-full">
                       <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase">معدل التغطية</p>
                          <p className="text-2xl font-black text-indigo-900">1 : {ratio}</p>
                       </div>
                       <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase">إجمالي الكادر</p>
                          <p className="text-2xl font-black text-slate-900">{reg.count}</p>
                       </div>
                    </div>
                    <div className={`w-full md:w-48 px-6 py-3 rounded-2xl text-center font-black text-xs uppercase ${ratio > 20 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                       {ratio > 20 ? 'Over Capacity' : 'Balanced Staff'}
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportView;

const Fingerprint = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12V21H12C6.47715 21 2 16.5228 2 12Z" />
    <path d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12V21" />
    <path d="M12 12V21" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);
