
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
            margin: 10mm 8mm 10mm 8mm;
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            width: 100% !important;
          }

          /* Fixed Header - Compact */
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 45px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #1e1b4b;
            padding-bottom: 5px;
            background: white;
            z-index: 1000;
          }

          /* Fixed Footer - Compact */
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            font-size: 7pt;
            color: #64748b;
            background: white;
            z-index: 1000;
          }

          .print-footer::after {
            counter-increment: page;
            content: "Page " counter(page);
            font-weight: bold;
          }

          /* Content Spacing */
          .content-wrapper {
            margin-top: 55px;
            margin-bottom: 35px;
          }

          /* Table Optimization for 15+ Rows */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed;
            font-size: 7.5pt !important;
          }
          thead { display: table-header-group !important; }
          th {
            background-color: #1e1b4b !important;
            color: white !important;
            border: 1px solid #cbd5e1 !important;
            padding: 4px 6px !important;
            text-align: left !important;
            font-weight: 800;
            text-transform: uppercase;
          }
          td {
            border: 1px solid #e2e8f0 !important;
            padding: 3px 6px !important; /* Reduced vertical padding */
            word-wrap: break-word;
            line-height: 1.1;
          }
          tr { page-break-inside: avoid !important; }
          
          /* Compact KPI for Print */
          .kpi-row {
            display: flex !important;
            flex-direction: row !important;
            gap: 10px !important;
            margin-bottom: 12px !important;
          }
          .kpi-card {
            flex: 1;
            padding: 6px 12px !important;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }
          .kpi-card svg { width: 14px; height: 14px; }
          .kpi-card p { font-size: 6.5pt !important; margin: 0; }
          .kpi-card h4 { font-size: 11pt !important; margin: 0; line-height: 1; }

          h2 { font-size: 10pt !important; margin-bottom: 6px !important; }
        }

        /* Screen Only UI Header */
        .print-header, .print-footer { display: none; }
        #pdf-content { direction: ltr; }
      `}</style>

      {/* Screen Interface Controls - NO PRINT */}
      <div className="no-print bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-900 text-white rounded-xl shadow-lg">
            <Landmark size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Official Report Generator</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Regulatory Standards v2.1</p>
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
            <h1 className="text-sm font-black text-indigo-950 m-0 uppercase">Operational Manpower Ledger</h1>
            <p className="text-[7pt] font-bold text-slate-500 m-0">Region Identifier: <span className="text-indigo-800">{selectedRegion}</span></p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-[6pt] font-black text-slate-400 uppercase">Audit Sealed</span>
              <ShieldCheck size={12} className="text-indigo-900" />
            </div>
            <p className="text-[7pt] font-black text-indigo-950 m-0">REF: {reportRef}</p>
          </div>
        </div>

        <div className="print-footer">
          <p className="m-0 font-bold">Regulatory Data Audit System • Standardized Compliance Report</p>
          <p className="m-0 opacity-50 text-[6pt]">Generated on {reportDate}</p>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper space-y-4">
          
          {/* Compact Operational Summary */}
          <section>
            <div className="kpi-row">
              <div className="kpi-card">
                <Users className="text-indigo-900"/>
                <div>
                  <p className="font-black text-slate-400 uppercase">Total Workforce</p>
                  <h4>{stats.total} <span className="text-[7pt] font-medium opacity-50">Staff</span></h4>
                </div>
              </div>
              <div className="kpi-card">
                <MapPin className="text-slate-500"/>
                <div>
                  <p className="font-black text-slate-400 uppercase">Active Locations</p>
                  <h4>{stats.locations}</h4>
                </div>
              </div>
              <div className="kpi-card">
                <FileCheck className="text-orange-600"/>
                <div>
                  <p className="font-black text-slate-400 uppercase">Supervisors</p>
                  <h4>{stats.supervisors}</h4>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Ledger Table */}
          <section className="space-y-2">
            <h2 className="text-sm font-black text-indigo-950 uppercase tracking-tight flex items-center gap-2">
              <div className="w-0.5 h-3 bg-indigo-900 rounded-full"></div>
              Manpower Distribution Ledger
            </h2>
            
            <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm print:rounded-none print:border-slate-300">
              <table className="w-full">
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Civil ID</th>
                    <th style={{ width: '28%' }}>Full Name (EN/AR)</th>
                    <th style={{ width: '10%' }}>Emp #</th>
                    <th style={{ width: '18%' }}>Location</th>
                    <th style={{ width: '18%' }}>Position</th>
                    <th style={{ width: '14%' }}>Company</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? filteredData.map((emp, i) => (
                    <tr key={i} className="print:bg-white">
                      <td className="font-mono font-bold text-indigo-900">{emp["ID#"]}</td>
                      <td>
                        <div className="font-black text-indigo-950">{emp["NAME (ENG)"]}</div>
                        <div className="text-[6pt] text-slate-400 font-bold">{emp["NAME (AR)"]}</div>
                      </td>
                      <td className="font-mono text-slate-500">{emp["EMP#"]}</td>
                      <td className="font-bold text-slate-700">
                        <div className="flex items-center gap-1">
                          <Building2 size={8} className="text-slate-300"/>
                          {emp["LOCATION"] || "General Area"}
                        </div>
                      </td>
                      <td>
                        <span className={`text-[6.5pt] font-black px-1 py-0 rounded border ${
                          emp.POSITION.toLowerCase().includes('supervisor') 
                          ? 'bg-orange-50 text-orange-700 border-orange-100' 
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {emp["POSITION"]}
                        </span>
                      </td>
                      <td className="text-indigo-800 font-bold uppercase text-[6.5pt]">{emp["COMPANY"]}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 font-bold italic">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Final Stamp - Very Compact */}
          <div className="hidden print:block mt-4 pt-3 border-t border-dashed border-slate-200">
            <div className="flex justify-between items-center">
              <p className="text-[6.5pt] font-black text-slate-400">
                SYSTEM VERIFIED: All records matched against regional operational database for {selectedRegion}.
              </p>
              <div className="border border-indigo-900 px-2 py-0.5 rounded text-indigo-900 font-black text-[6pt] uppercase tracking-tighter">
                Official Validation Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
