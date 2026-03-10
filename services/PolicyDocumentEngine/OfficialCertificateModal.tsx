import React, { useState, useRef } from 'react';
import { Policy, User } from '../../types';
import { mapToProjection } from './adapter';
import { OfficialCertificateTemplate } from './renderer';
import { Download, Loader2, X, FileCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  policy: Policy;
  user?: User;
  onClose: () => void;
}

export const OfficialCertificateModal: React.FC<Props> = ({ policy, user, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);
  const projection = mapToProjection(policy, user);

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(documentRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200, // Force a consistent width for capture
        onclone: (clonedDoc) => {
          // Recursively remove oklch colors from all elements in the cloned document
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const element = allElements[i] as HTMLElement;
            const style = window.getComputedStyle(element);
            
            if (style.backgroundColor.includes('oklch')) {
              element.style.backgroundColor = '#ffffff';
            }
            if (style.color.includes('oklch')) {
              element.style.color = '#000000';
            }
            if (style.borderColor.includes('oklch')) {
              element.style.borderColor = '#e5e7eb';
            }
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add subsequent pages if content is longer than one A4 page
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save(`Certificate_of_Motor_Insurance_${projection.certificate_number}.pdf`);
    } catch (e) {
      console.error('Certificate PDF Generation Error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#2d1f2d]/95 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-full sm:max-w-[95vw] bg-white h-full sm:h-[90vh] sm:rounded-[40px] md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-white shrink-0 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600"><FileCheck size={24}/></div>
             <div>
               <h3 className="font-black text-[#2d1f2d] uppercase tracking-tighter text-sm md:text-base">Official Insurance Certificate</h3>
               <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Legal Document Generation Engine v2.0</p>
             </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
             <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-green-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download Certificate
             </button>
             <button onClick={onClose} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"><X size={20}/></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-12 bg-gray-100">
           <div className="min-w-fit flex justify-center">
              <div ref={documentRef} className="bg-white shadow-2xl w-full max-w-full sm:max-w-[210mm]">
                 <OfficialCertificateTemplate projection={projection} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
