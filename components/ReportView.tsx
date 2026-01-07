
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
            margin: 15mm 10mm 15mm 10mm;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          
          /* Force LTR for Regulatory PDF */
          #pdf-content {
            direction: ltr !important;
            text-align: left !important;
            font-family: sans-serif !important;
            width: 100% !important;
          }

          /* Fixed Header */
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1e1b4b;
            padding-bottom: 10px;
            background: white;
            z-index: 1000;
          }

          /* Fixed Footer */
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            font-size: 8pt;
            color: #64748b;
            background: white;
            z-index: 1000;
          }

          .print-footer::after {
            counter-increment: page;
            content: "Page " counter(page);
          }

          /* Content Spacing for Fixed Elements */
          .content-wrapper {
            margin-top: 70px;
            margin-bottom: 50px;
          }

          /* Table Optimization */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed;
            font-size: 8pt !important;
          }
          thead { display: table-header-group !important; }
          th {
            background-color: #1e1b4b !important;
            color: white !important;
            border: 1px solid #e2e8f0 !important;
            padding: 8px !important;
            text-align: left !important;
          }
          td {
            border: 1px solid #e2e8f0 !important;
            padding: 6px !important;
            word-wrap: break-word;
          }
          tr { page-break-inside: avoid !important; }

          /* KPI Compact for Print */
          .kpi-row {
            display: flex !important;
            flex-direction: row !important;
            gap: 20px !important;
            margin-bottom: 20px !important;
          }
          .kpi-card {
            flex: 1;
            padding: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
        }

        /* Screen Only Header */
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
            <h1 className="text-lg font-black text-indigo-950 m-0">OPERATIONAL MANPOWER REPORT</h1>
            <p className="text-[9pt] font-bold text-slate-500 m-0">Region Identifier: <span className="text-indigo-800">{selectedRegion}</span></p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[7pt] font-black text-slate-400 uppercase">Regulatory Audit Seal</span>
              <ShieldCheck size={16} className="text-indigo-900" />
            </div>
            <p className="text-[8pt] font-black text-indigo-950 m-0">REF: {reportRef}</p>
            <p className="text-[7pt] text-slate-400 m-0 font-bold">{reportDate}</p>
          </div>
        </div>

        <div className="print-footer">
          <p className="m-0 font-black">Regulatory Data Audit System • Integrated Compliance Protocol</p>
          <p className="m-0 italic">Authorized Document: {reportRef}</p>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper space-y-8">
          
          {/* Section: Operational Summary */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-indigo-900 rounded-full"></div>
              <h2 className="text-base font-black text-indigo-950 uppercase tracking-tight">I. Operational Summary</h2>
            </div>
            <div className="kpi-row grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="kpi-card bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-900"><Users size={20}/></div>
                <div>
                  <p className="text-[8pt] font-black text-slate-400 uppercase">Total Workforce</p>
                  <p className="text-xl font-black text-indigo-950">{stats.total} <span className="text-[10pt] font-medium opacity-50">Staff</span></p>
                </div>
              </div>
              <div className="kpi-card bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-500"><MapPin size={20}/></div>
                <div>
                  <p className="text-[8pt] font-black text-slate-400 uppercase">Active Locations</p>
                  <p className="text-xl font-black text-indigo-950">{stats.locations}</p>
                </div>
              </div>
              <div className="kpi-card bg-orange-50/30 p-5 rounded-2xl border border-orange-100 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-orange-600"><FileCheck size={20}/></div>
                <div>
                  <p className="text-[8pt] font-black text-slate-400 uppercase">Supervisors</p>
                  <p className="text-xl font-black text-indigo-950">{stats.supervisors}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Detailed Manpower Ledger */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-indigo-900 rounded-full"></div>
              <h2 className="text-base font-black text-indigo-950 uppercase tracking-tight">II. Detailed Manpower Ledger</h2>
            </div>
            
            <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
              <table className="w-full">
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Civil ID</th>
                    <th style={{ width: '25%' }}>Full Name (English/Arabic)</th>
                    <th style={{ width: '10%' }}>Emp #</th>
                    <th style={{ width: '20%' }}>Location</th>
                    <th style={{ width: '18%' }}>Position</th>
                    <th style={{ width: '15%' }}>Operating Co.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? filteredData.map((emp, i) => (
                    <tr key={i}>
                      <td className="font-mono font-bold text-indigo-900">{emp["ID#"]}</td>
                      <td>
                        <div className="font-black text-indigo-950 text-[9pt]">{emp["NAME (ENG)"]}</div>
                        <div className="text-[7pt] text-slate-400 font-bold">{emp["NAME (AR)"]}</div>
                      </td>
                      <td className="font-mono text-slate-500">{emp["EMP#"]}</td>
                      <td className="font-bold text-slate-700">
                        <div className="flex items-center gap-1">
                          <Building2 size={10} className="text-slate-300"/>
                          {emp["LOCATION"] || "General Area"}
                        </div>
                      </td>
                      <td>
                        <span className={`text-[7pt] font-black px-1.5 py-0.5 rounded border ${
                          emp.POSITION.toLowerCase().includes('supervisor') 
                          ? 'bg-orange-50 text-orange-700 border-orange-100' 
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {emp["POSITION"]}
                        </span>
                      </td>
                      <td className="text-indigo-800 font-bold uppercase">{emp["COMPANY"]}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 font-bold italic">No data records found for selection.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Final Verification Stamp (Print Only) */}
          <div className="hidden print:block mt-6 pt-6 border-t border-dashed border-slate-200">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[8pt] font-black text-slate-900">SYSTEM VERIFIED DATA</p>
                <p className="text-[7pt] text-slate-400">All records matched against Region: {selectedRegion}</p>
              </div>
              <div className="border-2 border-indigo-900 p-2 rounded-lg text-indigo-900 flex flex-col items-center">
                <span className="text-[6pt] font-black uppercase">Official Seal</span>
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
