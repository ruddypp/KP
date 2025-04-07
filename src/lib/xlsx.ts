import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Gunakan tipe generik atau unknown[]
export const exportToExcel = <T,>(data: T[], sheetName: string, fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Gunakan tipe generik atau unknown[]
export const exportToPDF = (data: unknown[], title: string, fileName: string) => {
  const doc = new jsPDF();
  doc.text(title, 14, 10);
  (doc as any).autoTable({
    startY: 20,
    head: [Object.keys(data[0] as object)], // Ambil header dari objek pertama
    body: data.map(item => Object.values(item as object)),
  });
  doc.save(`${fileName}.pdf`);
}; 