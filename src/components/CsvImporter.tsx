import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useStore } from '../context/StoreContext';
import { TRANSLATIONS } from '../data/translations';
import { CSV_TEMPLATE_STRING } from '../data/sampleData';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Image as ImageIcon 
} from 'lucide-react';

export const CsvImporter: React.FC = () => {
  const { importProductsFromCSV, settings } = useStore();
  const t = TRANSLATIONS[settings.language];

  const [dragActive, setDragActive] = useState(false);
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMessage(t.invalidCsv);
      setParsedItems([]);
      return;
    }

    setErrorMessage(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        // Validate headers roughly
        const headers = results.meta.fields || [];
        const required = ['name', 'price'];
        const missing = required.filter(h => !headers.includes(h));

        if (missing.length > 0) {
          setErrorMessage(
            settings.language === 'ar'
              ? `ملف CSV غير صالح. الأعمدة المطلوبة مفقودة: ${missing.join(', ')}`
              : `Invalid CSV structure. Missing required columns: ${missing.join(', ')}`
          );
          setParsedItems([]);
          return;
        }

        setParsedItems(results.data);
      },
      error: (error) => {
        setErrorMessage(error.message);
        setParsedItems([]);
      }
    });
  };

  const downloadCsvTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_STRING], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'quickstore_menu_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveImport = (overwrite: boolean) => {
    if (parsedItems.length === 0) return;
    importProductsFromCSV(parsedItems, overwrite);
    setParsedItems([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6" id="csv-importer-container">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-500" />
          {t.featureCsvTitle}
        </h3>
        <p className="text-sm text-slate-500 mb-6">{t.csvHelp}</p>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-amber-500 bg-amber-50/40' 
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{t.dragDropCsv}</p>
              <p className="text-xs text-slate-400 mt-1">{t.orBrowse}</p>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Template download link */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Need a template to get started?</span>
          <button
            onClick={downloadCsvTemplate}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t.downloadTemplate}
          </button>
        </div>
      </div>

      {/* Parsed Products Table Preview */}
      {parsedItems.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                {t.parsedSuccess.replace('{count}', String(parsedItems.length))}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Please check everything looks right before adding to store database.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setParsedItems([])}
                className="flex-1 sm:flex-initial text-slate-500 hover:text-rose-600 font-medium text-xs px-3 py-2 border border-slate-250 rounded-xl transition-all"
              >
                Clear Preview
              </button>
              <button
                onClick={() => handleSaveImport(false)}
                className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shadow-amber-500/10 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {t.saveImportedBtn}
              </button>
              <button
                onClick={() => handleSaveImport(true)}
                className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {t.overwriteImportedBtn}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[350px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5 pl-4">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Price</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 pr-4 text-center">Image</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 pl-4 font-semibold text-slate-900">{item.name || '—'}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {settings.currencySymbol}
                      {parseFloat(String(item.price).replace(/[^0-9.]/g, ''))?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-3 max-w-xs truncate text-slate-500">{item.description || '—'}</td>
                    <td className="p-3 text-center pr-4">
                      {item.image_url ? (
                        <div className="inline-block relative group">
                          <img
                            src={item.image_url}
                            alt="Parsed thumbnail"
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            onError={(e) => {
                              // Replace broken with icon
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
