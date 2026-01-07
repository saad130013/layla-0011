
import React, { useMemo, useState } from 'react';
import { Employee, ValidationState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';
import { Users, MapPin, TrendingUp, ListOrdered, Printer, ShieldCheck, Landmark, Globe } from 'lucide-react';

interface Props {
  data: Employee[];
  validation: ValidationState;
}

const COLORS = ['#1e1b4b', '#4338ca', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

const Dashboard: React.FC<Props> = ({ data, validation }) => {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalEmployees = new Set(data.map(d => String(d["ID#"]))).size;
    const avgPerRegion = (totalEmployees / validation.totalRegions).toFixed(1);
    
    const nationalities = data.reduce((acc: any, curr) => {
      acc[curr.NATIONALITY] = (acc[curr.NATIONALITY] || 0) + 1;
      return acc;
    }, {});
    
    const nationalityData = Object.entries(nationalities)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);

    return {
      totalEmployees,
      avgPerRegion,
      nationalityData
    };
  }, [data, validation]);

  const handleExportPDF = () => {
    window.print();
  };

  const getRegionEmployees = (regionName: string) => {
    return data.filter(emp => emp.SourceSheet === regionName);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 print:m-0">
      <style>{`
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 15mm; 
          }
          body { background: white !important; font-family: 'Cairo', sans-serif !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .card-shadow { box-shadow: none !important; border: 1px solid #e2e8f0 !important; border-radius: 8pt !important; }
          .chart-container { page-break-inside: avoid; margin-bottom: 20pt; }
          table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed; }
          th { background-color: #1e1b4b !important; color: white !important; padding: 10pt !important; border: 1px solid #e2e8f0 !important; }
          td { padding: 8pt !important; border: 1px solid #e2e8f0 !important; font-size: 9pt; overflow: hidden; text-overflow: ellipsis; }
          h2, h3 { color: #1e1b4b !important; }
          .print-header { display: flex !important; justify-content: space-between; border-bottom: 3px solid #1e1b4b; margin-bottom: 20pt; padding-bottom: 10pt; }
          .page-number::after { content: "Page " counter(page); }
        }
        .print-header { display: none; }
      `}</style>

      {/* Printable Header for PDF */}
      <div className="print-header">
        <div className="text-right">
          <h1 className="text-2xl font-black text-indigo-950">REGL-DATA AUDIT REPORT</h1>
          <p className="text-xs font-bold text-slate-500 uppercase">Executive Dashboard Summary</p>
        </div>
        <div className="text-left">
          <p className="text-xs font-black">Date: {new Date().toLocaleDateString('en-US')}</p>
          <p className="text-[10px] text-slate-400 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">لوحة القيادة والتحليل الشامل</h2>
          <p className="text-slate-500 font-bold mt-1">Operational & Regulatory Dashboard</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95"
          >
            <Printer size={20} /> Export to PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 chart-container">
        <div className="bg-indigo-900 p-8 rounded-[32px] text-white relative overflow-hidden card-shadow">
          <div className="relative z-10">
            <p className="text-xs font-black opacity-70 mb-1 uppercase tracking-wider">Total Workforce (IDs)</p>
            <h4 className="text-5xl font-black">{stats.totalEmployees}</h4>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 card-shadow">
          <p className="text-xs font-black text-slate-500 mb-1 uppercase tracking-wider">Verified Regions</p>
          <h4 className="text-4xl font-black text-slate-900">{validation.totalRegions}</h4>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 card-shadow">
          <p className="text-xs font-black text-slate-500 mb-1 uppercase tracking-wider">Staff Avg / Region</p>
          <h4 className="text-4xl font-black text-slate-900">{stats.avgPerRegion}</h4>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 card-shadow">
          <p className="text-xs font-black text-slate-500 mb-1 uppercase tracking-wider">Active Entities</p>
          <h4 className="text-4xl font-black text-emerald-600">{Array.from(new Set(data.map(d => d.COMPANY))).length}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4 bg-white rounded-[40px] border border-slate-200 overflow-hidden flex flex-col card-shadow chart-container">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <ListOrdered size={24} className="text-indigo-900" />
              Regional Reference & Identity Audit Table
            </h3>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="text-xs font-black text-white bg-indigo-950 uppercase">
                  <th className="px-8 py-5">Verified Operational Region</th>
                  <th className="px-8 py-5 text-center">Identity Count (IDs)</th>
                  <th className="px-8 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validation.validationTable.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-800 text-lg">{item.name}</td>
                    <td className="px-8 py-6 text-center font-black text-indigo-700 bg-indigo-50/10">{item.count} Record</td>
                    <td className="px-8 py-6 text-center">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Footer for print */}
      <div className="hidden print:block fixed bottom-0 left-0 right-0 py-4 text-center text-slate-400 border-t border-slate-100 text-[8pt] font-black uppercase tracking-widest">
        Audit ID: REGL-{Math.random().toString(36).substr(2, 5).toUpperCase()} | CONFIDENTIAL REGULATORY DATA | PAGE <span className="page-number"></span>
      </div>
    </div>
  );
};

export default Dashboard;
