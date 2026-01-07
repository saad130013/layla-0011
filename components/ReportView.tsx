
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
            margin: 8mm 6mm 8mm 6mm;
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
            font-family: 'Segoe UI', sans-serif !important;
            width: 100% !important;
          }

          /* Ultra Compact Header */
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 32px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #1e1b4b;
            padding-bottom: 2px;
            background: white;
            z-index: 1000;
          }

          /* Compact Footer */
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            font-size: 6pt;
            color: #64748b;
            background: white;
            z-index: 1000;
          }

          .print-footer::after {
            counter-increment: page;
            content: "Page " counter(page);
          }

          .content-wrapper {
            margin-top: 40px;
            margin-bottom: 25px;
          }

          /* Table Optimization for 25+ Rows */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed;
            font-size: 7pt !important; /* Slightly smaller for more rows */
          }
          thead { display: table-header-group !important; }
          th {
            background-color: #1e1b4b !important;
            color: white !important;
            border: 1px solid #cbd5e1 !important;
            padding: 2px 4px !important;
            text-align: left !important;
            font-weight: 800;
          }
          td {
            border: 1px solid #e2e8f0 !important;
            padding: 1px 4px !important; /* Minimum padding to fit 25 names */
            word-wrap: break-word;
            line-height: 1.0;
            height: 18px; /* Fixed height to control row count per page */
          }
          tr { page-break-inside: avoid !important; }
          
          /* Inline Info Bar instead of Cards */
          .kpi-row {
            display: flex !important;
            flex-direction: row !important;
            gap: 15px !important;
            margin-bottom: 8px !important;
            background: #f8fafc !important;
            padding: 4px 8px !important;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
          }
          .kpi-item {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            font-size: 7pt !important;
            font-weight: 800;
            color: #1e1b4b;
          }
          .kpi-label { color: #64748b; text-transform: uppercase; font-size: 6pt; }

          h2 { font-size: 9pt !important; margin-bottom: 4px !important; }
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
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Regulatory Standards v2.2</p>
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
        
        {/* Fixed Elements for Print */}
        <div className="print-header">
          <div>
            <h1 className="text-xs font-black text-indigo-950 m-0 uppercase">Operational Manpower Ledger</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[7pt] font-bold text-slate-500 m-0">Region: <span className="text-indigo-800 font-black">{selectedRegion}</span></p>
            <p className="text-[7pt] font-black text-indigo-950 m-0">REF: {reportRef}</p>
            <ShieldCheck size={10} className="text-indigo-900" />
          </div>
        </div>

        <div className="print-footer">
          <p className="m-0 font-bold">Regulatory Compliance Data • Official Audit Document</p>
          <p className="m-0 opacity-50">Generated on {reportDate}</p>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          
          {/* Section I: Operational Summary Bar */}
          <div className="kpi-row">
            <div className="kpi-item">
              <span className="kpi-label">Total Workforce:</span>
              <span>{stats.total} Staff</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Active Locations:</span>
              <span>{stats.locations}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Supervisors:</span>
              <span>{stats.supervisors}</span>
            </div>
          </div>

          {/* Section II: Ledger Table */}
          <section className="space-y-1">
            <h2 className="text-[8pt] font-black text-indigo-950 uppercase tracking-tight flex items-center gap-1">
              <div className="w-0.5 h-2.5 bg-indigo-900 rounded-full"></div>
              Distribution Ledger
            </h2>
            
            <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm print:rounded-none print:border-slate-300">
              <table className="w-full">
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Civil ID</th>
                    <th style={{ width: '30%' }}>Full Name (EN/AR)</th>
                    <th style={{ width: '10%' }}>Emp #</th>
                    <th style={{ width: '18%' }}>Location</th>
                    <th style={{ width: '18%' }}>Position</th>
                    <th style={{ width: '12%' }}>Company</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? filteredData.map((emp, i) => (
                    <tr key={i} className="print:bg-white">
                      <td className="font-mono font-bold text-indigo-900">{emp["ID#"]}</td>
                      <td>
                        <div className="font-black text-indigo-950">{emp["NAME (ENG)"]}</div>
                        <div className="text-[5.5pt] text-slate-400 font-bold">{emp["NAME (AR)"]}</div>
                      </td>
                      <td className="font-mono text-slate-500">{emp["EMP#"]}</td>
                      <td className="font-bold text-slate-700">
                        <div className="flex items-center gap-1">
                          <Building2 size={8} className="text-slate-300"/>
                          {emp["LOCATION"] || "General Area"}
                        </div>
                      </td>
                      <td>
                        <span className={`text-[6pt] font-black px-1 py-0 rounded border ${
                          emp.POSITION.toLowerCase().includes('supervisor') 
                          ? 'bg-orange-50 text-orange-700 border-orange-100' 
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {emp["POSITION"]}
                        </span>
                      </td>
                      <td className="text-indigo-800 font-bold uppercase text-[6pt]">{emp["COMPANY"]}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-slate-400 font-bold italic">No records.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Verification (Print Only) */}
          <div className="hidden print:block mt-2">
            <p className="text-[5.5pt] font-black text-slate-400 uppercase tracking-tighter text-center">
              SYSTEM VERIFIED DATA • MATCHED AGAINST OPERATIONAL REFERENCE {selectedRegion} • {reportRef}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
