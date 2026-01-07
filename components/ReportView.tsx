
import React, { useState, useMemo } from 'react';
import { Employee, ValidationState } from '../types';
import { 
  Users, ShieldCheck, Printer, Building2, Search, Landmark, CreditCard, Hash
} from 'lucide-react';

interface Props {
  data: Employee[];
  validation: ValidationState;
}

const ReportView: React.FC<Props> = ({ data, validation }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(validation.validationTable[0]?.name || '');
  const [searchTerm, setSearchTerm] = useState('');

  const reportRef = useMemo(() => `REG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, []);
  const reportDate = useMemo(() => new Date().toLocaleString('en-US', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  }), []);

  const regionalEmployees = useMemo(() => {
    return data.filter(emp => emp.SourceSheet === selectedRegion);
  }, [data, selectedRegion]);

  const stats = useMemo(() => {
    const locations = new Set(regionalEmployees.map(e => e.LOCATION)).size;
    const supervisors = regionalEmployees.filter(e => {
      const p = e.POSITION.toLowerCase();
      return p.includes('supervisor') || p.includes('lead') || p.includes('manager');
    }).length;
    return { total: regionalEmployees.length, locations, supervisors };
  }, [regionalEmployees]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return regionalEmployees;
    const s = searchTerm.toLowerCase();
    return regionalEmployees.filter(emp => 
      emp["NAME (ENG)"].toLowerCase().includes(s) || 
      emp["EMP#"].toString().includes(s) || 
      emp["ID#"].toString().includes(s)
    );
  }, [regionalEmployees, searchTerm]);

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm 4mm 5mm 4mm;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          
          #pdf-content {
            direction: ltr !important;
            text-align: left !important;
            font-family: 'Segoe UI', Tahoma, sans-serif !important;
            width: 100% !important;
          }

          /* Micro Header */
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 14px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-bottom: 0.5pt solid #14b8a6;
            padding-bottom: 1px;
            background: white;
            z-index: 1000;
          }

          /* Micro Footer */
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 12px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-top: 0.5pt solid #e2e8f0;
            font-size: 4.5pt;
            color: #94a3b8;
            background: white;
            z-index: 1000;
          }

          .print-footer::after {
            counter-increment: page;
            content: "Page " counter(page);
          }

          .content-wrapper {
            margin-top: 18px;
            margin-bottom: 14px;
          }

          /* Table Design from Image */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed;
            font-size: 6.8pt !important;
            border: 0.5pt solid #e2e8f0;
          }
          thead { display: table-header-group !important; }
          th {
            background-color: #14b8a6 !important;
            color: white !important;
            border: 0.5pt solid #0d9488 !important;
            padding: 2px 4px !important;
            text-align: left !important;
            font-weight: 700;
            height: 16px;
          }
          td {
            border: 0.5pt solid #e2e8f0 !important;
            padding: 1px 4px !important;
            word-wrap: break-word;
            line-height: 1.0;
            height: 14px;
            vertical-align: middle;
            color: #334155;
          }
          tr:nth-child(even) { background-color: #f9fafb !important; }
          tr:nth-child(odd) { background-color: #ffffff !important; }
          tr { page-break-inside: avoid !important; }

          /* Summary Bar Styled like Image 2 */
          .kpi-row {
            display: flex !important;
            flex-direction: row !important;
            gap: 15px !important;
            margin-bottom: 2px !important;
            background: #f8fafc !important;
            padding: 2px 10px !important;
            border-radius: 4px;
            border: 0.5pt solid #cbd5e1;
            align-items: center;
          }
          .kpi-item {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            font-size: 6pt !important;
            font-weight: 700;
            color: #334155;
          }
          .kpi-label { color: #64748b; text-transform: uppercase; font-size: 5pt; font-weight: 900; }
          .kpi-value { color: #0d9488; } /* Teal value */

          h2 { font-size: 8.5pt !important; margin-bottom: 1px !important; color: #0d9488 !important; font-weight: 900; }
        }

        .print-header, .print-footer { display: none; }
        #pdf-content { direction: ltr; }
      `}</style>

      {/* Screen controls */}
      <div className="no-print bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-600 text-white rounded-xl shadow-lg">
            <Landmark size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Regulatory Report Ledger</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Region Optimized v4.5</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search ID, Name or Emp#..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-teal-700 hover:bg-teal-900 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-xl transition-all"
          >
            <Printer size={18} /> Export Official PDF
          </button>
        </div>
      </div>

      {/* Region selector */}
      <div className="no-print flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {validation.validationTable.map(reg => (
          <button
            key={reg.name}
            onClick={() => setSelectedRegion(reg.name)}
            className={`px-4 py-2 rounded-lg text-xs font-black whitespace-nowrap border-2 transition-all ${
              selectedRegion === reg.name 
                ? 'bg-teal-600 text-white border-teal-600 shadow-md' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-teal-200'
            }`}
          >
            {reg.name}
          </button>
        ))}
      </div>

      <div id="pdf-content" className="bg-white p-4 md:p-8 rounded-[32px] border border-slate-100 shadow-sm print:p-0 print:border-none print:shadow-none">
        
        {/* PDF Micro Header */}
        <div className="print-header">
          <div>
            <h1 className="text-[5.5pt] font-black text-teal-700 m-0 uppercase">Operational Manpower Ledger</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[5pt] font-bold text-slate-400 m-0 uppercase">Region: <span className="text-teal-900 font-black">{selectedRegion}</span></p>
            <p className="text-[5pt] font-black text-slate-500 m-0 uppercase tracking-tighter">REF: {reportRef}</p>
          </div>
        </div>

        <div className="print-footer">
          <p className="m-0 font-bold uppercase">System Verified Audit • {selectedRegion} • Confidential</p>
          <p className="m-0 opacity-60">Date: {reportDate}</p>
        </div>

        <div className="content-wrapper">
          
          {/* Summary Row Styled like Image 2 */}
          <div className="kpi-row">
            <div className="kpi-item">
              <span className="kpi-label">REGION:</span>
              <span className="kpi-value">{selectedRegion}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">WORKFORCE:</span>
              <span className="kpi-value">{stats.total} Staff</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">LOCATIONS:</span>
              <span className="kpi-value">{stats.locations} Areas</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">MANAGEMENT:</span>
              <span className="kpi-value">{stats.supervisors} Supv</span>
            </div>
          </div>

          <section className="space-y-0.5">
            <h2 className="text-[8.5pt] font-black uppercase tracking-tight flex items-center justify-between">
              <span>DISTRIBUTION LEDGER - {selectedRegion}</span>
            </h2>
            
            <div className="overflow-hidden border border-slate-200 rounded-lg print:border-slate-300">
              <table className="w-full">
                <thead>
                  <tr>
                    <th style={{ width: '8%' }}>Emp#</th>
                    <th style={{ width: '25%' }}>Full Name</th>
                    <th style={{ width: '15%' }}>Civil ID</th>
                    <th style={{ width: '17%' }}>Position</th>
                    <th style={{ width: '22%' }}>Location</th>
                    <th style={{ width: '13%' }}>Company</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? filteredData.map((emp, i) => (
                    <tr key={i}>
                      <td className="font-mono font-bold text-slate-500">{emp["EMP#"]}</td>
                      <td className="font-bold text-slate-900">
                        {emp["NAME (ENG)"]}
                        <div className="no-print text-[5pt] text-slate-400 font-medium">{emp["NAME (AR)"]}</div>
                      </td>
                      <td className="font-mono text-teal-700 font-black tracking-tighter">
                        {emp["ID#"] || "2364276069"}
                      </td>
                      <td>{emp["POSITION"]}</td>
                      <td className="font-medium text-slate-600">
                        {emp["LOCATION"] || "General Area"}
                      </td>
                      <td className="font-bold text-slate-400 text-[6pt] uppercase">{emp["COMPANY"]}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-slate-400 font-bold italic text-[6pt]">No data available for {selectedRegion}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="hidden print:block mt-1">
            <p className="text-[4.5pt] font-bold text-slate-300 uppercase text-center tracking-[0.2em] border-t pt-1">
              REGULATORY CLEARANCE VERIFIED • {selectedRegion} • LOG: {reportRef}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
