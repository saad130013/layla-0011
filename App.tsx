
import React, { useState } from 'react';
import { AppStep, Employee, ValidationState } from './types';
import FileUploader from './components/FileUploader';
import ValidationSummary from './components/ValidationSummary';
import Dashboard from './components/Dashboard';
import ReportView from './components/ReportView';
import { ShieldCheck, FileText, PieChart, UploadCloud } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [data, setData] = useState<Employee[]>([]);
  const [validation, setValidation] = useState<ValidationState | null>(null);

  const handleDataLoaded = (loadedData: Employee[]) => {
    setData(loadedData);
    
    const uniqueRegions = Array.from(new Set(loadedData.map(d => d.SourceSheet))).filter(Boolean);
    const regions: any[] = uniqueRegions.map((name, index) => ({
      id: index + 1,
      name
    }));

    const validationTable = uniqueRegions.map(name => {
      const regionEmployees = loadedData.filter(d => d.SourceSheet === name);
      const uniqueEmps = new Set(regionEmployees.map(d => d["EMP#"]));
      return {
        name,
        count: uniqueEmps.size
      };
    });

    const errors: string[] = [];
    const invalidEmps = loadedData.filter(d => !d.SourceSheet);
    if (invalidEmps.length > 0) {
      errors.push(`تم رصد ${invalidEmps.length} موظف بدون منطقة تشغيلية معتمدة.`);
    }

    setValidation({
      isValid: errors.length === 0,
      regions,
      validationTable,
      totalRegions: uniqueRegions.length,
      errors
    });
    
    setStep(AppStep.VALIDATION);
  };

  const reset = () => {
    setStep(AppStep.UPLOAD);
    setData([]);
    setValidation(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg text-indigo-900">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">نظام التدقيق الرقابي والامتثال</h1>
              <p className="text-xs text-indigo-200">Regulatory Data Audit & Compliance</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-indigo-800/50 p-1 rounded-full">
            <button 
              onClick={() => step !== AppStep.UPLOAD && setStep(AppStep.UPLOAD)}
              className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${step === AppStep.UPLOAD ? 'bg-indigo-600 shadow-sm' : 'hover:bg-indigo-700/50'}`}
            >
              <UploadCloud size={16} /> رفع البيانات
            </button>
            <button 
              disabled={!validation}
              onClick={() => setStep(AppStep.VALIDATION)}
              className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${step === AppStep.VALIDATION ? 'bg-indigo-600 shadow-sm' : 'hover:bg-indigo-700/50 disabled:opacity-50'}`}
            >
              <ShieldCheck size={16} /> التحقق المرجعي
            </button>
            <button 
              disabled={!validation || !validation.isValid}
              onClick={() => setStep(AppStep.DASHBOARD)}
              className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${step === AppStep.DASHBOARD ? 'bg-indigo-600 shadow-sm' : 'hover:bg-indigo-700/50 disabled:opacity-50'}`}
            >
              <PieChart size={16} /> لوحة المؤشرات
            </button>
            <button 
              disabled={!validation || !validation.isValid}
              onClick={() => setStep(AppStep.REPORT)}
              className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${step === AppStep.REPORT ? 'bg-indigo-600 shadow-sm' : 'hover:bg-indigo-700/50 disabled:opacity-50'}`}
            >
              <FileText size={16} /> التقارير الرقابية
            </button>
          </nav>

          <button 
            onClick={reset}
            className="text-xs bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            إعادة تعيين
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8">
        {step === AppStep.UPLOAD && <FileUploader onDataLoaded={handleDataLoaded} />}
        {step === AppStep.VALIDATION && validation && (
          <ValidationSummary validation={validation} onProceed={() => setStep(AppStep.DASHBOARD)} />
        )}
        {step === AppStep.DASHBOARD && validation && (
          <Dashboard data={data} validation={validation} />
        )}
        {step === AppStep.REPORT && validation && (
          <ReportView data={data} validation={validation} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2024 نظام التدقيق والامتثال الرقابي - معايير الجودة</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="flex items-center gap-1"><ShieldCheck size={14} /> بيانات موثقة</span>
            <span className="flex items-center gap-1"><ShieldCheck size={14} /> تدقيق رقمي</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
