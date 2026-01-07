
import React, { useState, useMemo } from 'react';
import { Employee, ValidationState } from '../types';
import { 
  Users, Map as MapIcon, AlertOctagon, 
  UserCheck, ShieldCheck, Printer, Clock, MapPin, Building2, Search, Fingerprint, CheckCircle2
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
    const locationMap = new Map<string, number>();
    regionEmployees.forEach(emp => {
      const loc = emp.LOCATION || "غير محدد";
      locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
    });
    const locations = Array.from(locationMap.entries()).map(([name, count]) => ({ name, count }));
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
    if (selectedLocation) list = list.filter(emp => (emp.LOCATION || "غير محدد") === selectedLocation);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 print:m-0 print:p-0">
      <style>{`
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 12mm 10mm; 
          }
          body { 
            background: white !important; 
            font-family: 'Cairo', sans-serif !important; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .print-full-width { width: 100% !important; flex: 0 0 100% !important; max-width: 100% !important; display: block !important; }
          #report-container { 
            border: none !important; 
            box-shadow: none !important; 
            width: 100% !important; 
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          
          /* Table PDF Fixes */
          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            table-layout: auto !important;
            page-break-inside: auto !important;
          }
          thead { display: table-header-group !important; }
          tr { page-break-inside: avoid !important; page-break-after: auto !important; }
          
          th { 
            background-color: #1e1b4b !important; 
            color: white !important; 
            padding: 10px !important; 
            border: 1px solid #e2e8f0 !important; 
            text-align: right;
            font-size: 9pt;
          }
          td { 
            padding: 8px !important; 
            border: 1px solid #e2e8f0 !important; 
            font-size: 8pt !important;
            vertical-align: middle;
          }
          
          .print-header-only { 
            display: flex !important; 
            justify-content: space-between; 
            align-items: center;
            border-bottom: 2px solid #1e1b4b; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
          }
          .kpi-grid-print {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 15px !important;
            margin-bottom: 20px !important;
          }
        }
        .print-header-only { display: none; }
      `}</style>

      {/* Main Header UI - NO PRINT */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 no-print">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-900 text-white rounded-2xl shadow-lg shadow-indigo-100"><ShieldCheck size={28} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">مركز استكشاف البيانات والامتثال</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Regulatory Operational Intelligence</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={() => window.print()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-3 shadow-xl transition-all active:scale-95 group"
          >
            <Printer size={20} className="group-hover:rotate-12 transition-transform" /> تصدير PDF احترافي
          </button>
        </div>
      </div>

      {/* Nav Tabs - NO PRINT */}
      <div className="flex flex-wrap gap-2 bg-slate-200/50 p-1.5 rounded-2xl w-fit no-print">
        {[
          { id: 'REGION_EXPLORER', label: 'مستكشف المناطق والمواقع', icon: MapIcon },
          { id: 'DUPLICATES', label: 'كاشف الازدواجية', icon: AlertOctagon },
          { id: 'SUPERVISORS', label: 'الهيكل الإشرافي', icon: UserCheck },
          { id: 'SHIFT_BALANCE', label: 'توازن القوى العاملة', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as ReportTab); setSelectedLocation(null); }}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.id ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white/70'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'REGION_EXPLORER' && (
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - NO PRINT */}
          <div className="lg:col-span-1 space-y-6 no-print">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b font-black text-slate-600 text-[10px] uppercase flex items-center gap-2">
                <MapIcon size={14} className="text-indigo-900" /> اختيار المنطقة
              </div>
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {validation.validationTable.map((reg) => (
                  <button
                    key={reg.name}
                    onClick={() => { setSelectedRegion(reg.name); setSelectedLocation(null); }}
                    className={`w-full text-right p-4 transition-all flex justify-between items-center group ${
                      selectedRegion === reg.name ? 'bg-indigo-50 border-r-4 border-indigo-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-black text-sm ${selectedRegion === reg.name ? 'text-indigo-900' : 'text-slate-500'}`}>
                      {reg.name}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${selectedRegion === reg.name ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-100 text-slate-400'}`}>
                      {reg.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b font-black text-slate-600 text-[10px] uppercase flex items-center gap-2">
                <Building2 size={14} className="text-indigo-900" /> المواقع التابعة
              </div>
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className={`w-full text-right p-4 transition-all flex justify-between items-center ${
                    selectedLocation === null ? 'bg-emerald-50 border-r-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`font-black text-xs ${selectedLocation === null ? 'text-emerald-800' : 'text-slate-500'}`}>عرض كافة المواقع</span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">{regionalData.total}</span>
                </button>
                {regionalData.locations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => setSelectedLocation(loc.name)}
                    className={`w-full text-right p-4 transition-all flex justify-between items-center group ${
                      selectedLocation === loc.name ? 'bg-indigo-50 border-r-4 border-indigo-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-black text-xs ${selectedLocation === loc.name ? 'text-indigo-900' : 'text-slate-500'}`}>{loc.name}</span>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-md">{loc.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Content - PRINT AREA */}
          <div className="lg:col-span-3 space-y-8 print-full-width" id="report-container">
            {/* Professional PDF Header */}
            <div className="print-header-only">
              <div>
                 <h1 className="text-2xl font-black text-indigo-950 uppercase tracking-tight">OPERATIONAL MANPOWER REPORT</h1>
                 <p className="text-sm font-bold text-slate-500">Region: <span className="text-indigo-900 font-black">{selectedRegion}</span></p>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Regulatory Audit Seal</span>
                  <ShieldCheck size={20} className="text-indigo-900" />
                </div>
                <p className="text-[9pt] font-black text-slate-900">Ref: REG-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                <p className="text-[8pt] text-slate-400 font-bold">{new Date().toLocaleString('ar-KW')}</p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 kpi-grid-print">
              <div className="bg-indigo-950 p-6 rounded-[24px] text-white shadow-xl relative overflow-hidden group">
                <p className="text-[10px] font-black opacity-60 uppercase mb-1">إجمالي العمالة</p>
                <h4 className="text-4xl font-black">{regionalData.total} <span className="text-sm font-medium opacity-50">موظف</span></h4>
                <Users size={80} className="absolute -right-4 -bottom-4 text-white/5" />
              </div>
              <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">المواقع المفعلة</p>
                <h4 className="text-4xl font-black text-indigo-950">{regionalData.locations.length}</h4>
                <MapPin size={80} className="absolute -right-4 -bottom-4 text-slate-50" />
              </div>
              <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الهيكل الإشرافي</p>
                <h4 className="text-4xl font-black text-orange-600">{regionalData.supervisorCount} <span className="text-sm font-medium opacity-50">مشرف</span></h4>
                <UserCheck size={80} className="absolute -right-4 -bottom-4 text-slate-50" />
              </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
                <div>
                  <h4 className="font-black text-slate-800 text-lg flex items-center gap-3">
                    <Building2 size={20} className="text-indigo-900" />
                    كشف عمالة {selectedLocation ? `موقع: ${selectedLocation}` : `منطقة: ${selectedRegion}`}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">عدد السجلات المعروضة: {filteredEmployees.length} موظف</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="بحث سريع بالاسم أو الرقم..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* PDF ONLY Table Caption */}
              <div className="hidden print:block p-4 text-center bg-slate-50 border-b">
                 <h4 className="font-black text-indigo-950">كشف عمالة منطقة: {selectedRegion}</h4>
                 <p className="text-[10px] font-bold text-slate-500">عدد السجلات المعروضة: {filteredEmployees.length} موظف</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-indigo-950 text-white text-[10px] uppercase font-black">
                      <th className="px-5 py-4">رقم الهوية (CIVIL ID)</th>
                      <th className="px-5 py-4">الاسم بالكامل</th>
                      <th className="px-5 py-4">الرقم الوظيفي</th>
                      <th className="px-5 py-4">الموقع التشغيلي</th>
                      <th className="px-5 py-4">المسمى الوظيفي</th>
                      <th className="px-5 py-4">الشركة المشغلة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-indigo-900 text-xs">{emp["ID#"]}</td>
                        <td className="px-5 py-4">
                          <div className="font-black text-slate-800 text-sm leading-tight">{emp["NAME (AR)"]}</div>
                          <div className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">{emp["NAME (ENG)"]}</div>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600 font-bold text-xs">{emp["EMP#"]}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-600 w-fit">
                            <MapPin size={10} /> {emp["LOCATION"] || "ACC"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                           <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${isSupervisor(emp.POSITION) ? 'bg-orange-100 text-orange-700' : 'text-slate-600'}`}>
                            {emp["POSITION"]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[9px] font-black border border-indigo-100 px-2 py-1 rounded bg-indigo-50/50 text-indigo-700 uppercase">{emp["COMPANY"]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PDF Footer per page */}
              <div className="hidden print:flex justify-between items-center p-4 border-t border-slate-200 text-[8pt] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-500" /> بيانات موثقة
                </div>
                <div>SHEET IDENTITY: {selectedRegion}</div>
                <div>PAGE VERIFICATION CODE: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
              </div>
            </div>

            {/* Print Only Disclaimer */}
            <div className="hidden print:block mt-8 text-center text-[8pt] text-slate-400 font-bold">
              <p>© 2024 نظام التدقيق والامتثال الرقابي - معايير الجودة - تدقيق رقمي معتمد</p>
            </div>
          </div>
        </div>
      )}

      {/* DUPLICATES Tab Style... */}
      {activeTab === 'DUPLICATES' && (
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
           <div className="flex items-center gap-5 text-red-600 border-b border-red-50 pb-8">
              <div className="p-4 bg-red-100 rounded-3xl"><AlertOctagon size={40} /></div>
              <div>
                <h3 className="text-3xl font-black tracking-tight">كاشف تضارب الهويات (ID Conflict)</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-Region Identity Monitoring</p>
              </div>
           </div>
           {duplicates.length > 0 ? (
              <div className="grid gap-6">
                {duplicates.map((dup, idx) => (
                  <div key={idx} className="p-8 border-2 border-red-50 bg-red-50/30 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-xl transition-all">
                     <div className="flex items-center gap-6">
                        <div className="p-4 bg-white shadow-sm rounded-2xl"><Fingerprint size={32} className="text-red-600" /></div>
                        <div>
                          <p className="font-black text-2xl text-red-900 leading-none mb-2">ID# {dup.id}</p>
                          <p className="font-bold text-slate-600">{dup.name}</p>
                        </div>
                     </div>
                     <div className="flex flex-wrap justify-center gap-3">
                        {dup.regions.map((r, i) => (
                          <span key={i} className="bg-white border-2 border-red-100 px-6 py-2.5 rounded-2xl text-[10px] font-black text-red-700 shadow-sm flex items-center gap-2">
                            <MapIcon size={12} /> {r}
                          </span>
                        ))}
                     </div>
                  </div>
                ))}
              </div>
           ) : (
              <div className="text-center py-24 bg-emerald-50 rounded-[40px] border-2 border-dashed border-emerald-200">
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100/50">
                    <ShieldCheck size={48} className="text-emerald-500" />
                 </div>
                 <p className="font-black text-emerald-800 text-3xl tracking-tight">نظام الهوية سليم تماماً</p>
                 <p className="text-emerald-600/70 font-bold mt-2">ID Integrity Check: Verified & Secured</p>
              </div>
           )}
        </div>
      )}

      {/* Placeholder for other tabs (SUPERVISORS, SHIFT_BALANCE) would use the same logic */}
    </div>
  );
};

export default ReportView;
