
import React, { useState, useMemo } from 'react';
import { Employee, ValidationState } from '../types';
import { 
  Users, Map as MapIcon, ShieldCheck, Printer, MapPin, Building2, Search, FileCheck, Landmark
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

          /* Micro Header - Optimized Height and Colors */
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 16px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-bottom: 0.5pt solid #94a3b8;
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
            height: 14px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-top: 0.5pt solid #e2e8f0;
            font-size: 5pt;
            color: #94a3b8;
            background: white;
            z-index: 1000;
          }

          .print-footer::after {
            counter-increment: page;
            content: "Page " counter(page);
          }

          .content-wrapper {
            margin-top: 20px;
            margin-bottom: 18px;
          }

          /* Table Optimization for 30-40 Rows */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed;
            font-size: 6.5pt !important;
          }
          thead { display: table-header-group !important; }
          th {
            background-color: #475569 !important; /* Lighter slate for print */
            color: white !important;
            border: 0.5pt solid #cbd5e1 !important;
            padding: 1px 3px !important;
            text-align: left !important;
            font-weight: 700;
            height: 12px;
          }
          td {
            border: 0.5pt solid #e2e8f0 !important;
            padding: 1px 3px !important;
            word-wrap: break-word;
            line-height: 1.0;
            height: 14px; /* Row height to comfortably fit 30+ records */
          }
          tr { page-break-inside: avoid !important; }
          
          /* Compact Info Bar */
          .kpi-row {
            display: flex !important;
            flex-direction: row !important;
            gap: 10px !important;
            margin-bottom: 3px !important;
            background: #f1f5f9 !important;
            padding: 2px 5px !important;
            border-radius: 2px;
            border: 0.5pt solid #e2e8f0;
          }
          .kpi-item {
            display: flex !important;
            align-items: center !important;
            gap: 2px !important;
            font-size: 6pt !important;
            font-weight: 700;
            color: #334155;
          }
          .kpi-label { color: #64748b; text-transform: uppercase; font-size: 5pt; }

          h2 { font-size: 7pt !important; margin-bottom: 1px !important; color: #334155 !important; }
          .font-mono { font-size: 6pt !important; }
        }

        .print-header, .print-footer { display: none; }
        #pdf-content { direction: ltr; }
      `}</style>

      {/* Screen Interface Controls */}
      <div className="no-print bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-900 text-white rounded-xl shadow-lg">
            <Landmark size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Official Report Generator</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Regulatory Standards v2.4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Filter by ID/Name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-indigo-950 hover:bg-black text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-xl transition-all"
          >
            <Printer size={18} /> Export Official PDF
          </button>
        </div>
      </div>

      {/* Region Selector (Screen Only) */}
      <div className="no-print flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {validation.validationTable.map(reg => (
          <button
            key={reg.name}
            onClick={() => setSelectedRegion(reg.name)}
            className={`px-4 py-2 rounded-lg text-xs font-black whitespace-nowrap border-2 transition-all ${
              selectedRegion === reg.name 
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-md' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'
            }`}
          >
            {reg.name}
          </button>
        ))}
      </div>

      {/* THE PRINTABLE PDF CONTENT */}
      <div id="pdf-content" className="bg-white p-4 md:p-8 rounded-[32px] border border-slate-100 shadow-sm print:p-0 print:border-none print:shadow-none">
        
        {/* Micro Fixed Header for Print */}
        <div className="print-header">
          <div>
            <h1 className="text-[5.5pt] font-bold text-slate-600 m-0 uppercase leading-none">Manpower Ledger Audit</h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[5pt] font-medium text-slate-400 m-0">Region: <span className="text-slate-800 font-bold">{selectedRegion}</span></p>
            <p className="text-[5pt] font-bold text-slate-600 m-0">REF: {reportRef}</p>
          </div>
        </div>

        <div className="print-footer">
          <p className="m-0 font-medium">Regulatory Data Ledger • Automated Compliance Review</p>
          <p className="m-0 opacity-60">Date: {reportDate}</p>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          
          {/* Section I: Summary Bar */}
          <div className="kpi-row">
            <div className="kpi-item">
              <span className="kpi-label">Workforce:</span>
              <span>{stats.total} IDs</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Locations:</span>
              <span>{stats.locations}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Supervisors:</span>
              <span>{stats.supervisors}</span>
            </div>
          </div>

          {/* Section II: Ledger Table */}
          <section className="space-y-0.5">
            <h2 className="text-[7pt] font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1">
              <div className="w-0.5 h-2 bg-slate-400 rounded-full"></div>
              Employee Distribution Records
            </h2>
            
            <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm print:rounded-none print:border-slate-300">
              <table className="w-full">
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Civil ID</th>
                    <th style={{ width: '30%' }}>Name (English / Arabic)</th>
                    <th style={{ width: '10%' }}>Emp #</th>
                    <th style={{ width: '18%' }}>Location</th>
                    <th style={{ width: '18%' }}>Position</th>
                    <th style={{ width: '12%' }}>Company</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? filteredData.map((emp, i) => (
                    <tr key={i} className="print:bg-white">
                      <td className="font-mono font-bold text-slate-700">{emp["ID#"]}</td>
                      <td>
                        <div className="font-bold text-slate-800 leading-none">{emp["NAME (ENG)"]}</div>
                        <div className="text-[4.5pt] text-slate-400 leading-none mt-0.5">{emp["NAME (AR)"]}</div>
                      </td>
                      <td className="font-mono text-slate-500">{emp["EMP#"]}</td>
                      <td className="font-medium text-slate-600">
                        {emp["LOCATION"] || "General"}
                      </td>
                      <td>
                        <span className={`text-[5.5pt] font-bold px-1 py-0 rounded border ${
                          emp.POSITION.toLowerCase().includes('supervisor') 
                          ? 'bg-slate-100 text-slate-800 border-slate-300' 
                          : 'bg-white text-slate-500 border-slate-100'
                        }`}>
                          {emp["POSITION"]}
                        </span>
                      </td>
                      <td className="text-slate-500 font-bold uppercase text-[5.5pt]">{emp["COMPANY"]}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-2 text-slate-400 font-bold italic text-[6pt]">No records found for this region.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Verification (Print Only) */}
          <div className="hidden print:block mt-1">
            <p className="text-[4.5pt] font-medium text-slate-300 uppercase text-center tracking-widest">
              OFFICIAL SYSTEM AUDIT LOG • {selectedRegion} • {reportRef} • CONFIDENTIAL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
