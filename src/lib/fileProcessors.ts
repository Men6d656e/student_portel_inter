import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';

export interface StudentData {
    name: string;
    rollNo: string;
}

export interface ResultData {
    rollNo: string;
    marks: number;
}

/**
 * Process CSV file and extract student data
 */
export async function processCSV(file: File): Promise<StudentData[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

                // Map to our StudentData format
                const students: StudentData[] = jsonData.map((row: any) => ({
                    name: String(row.name || row.Name || '').trim(),
                    rollNo: String(row.rollNo || row.RollNo || row.rollno || row['Roll No'] || '').trim(),
                })).filter(s => s.name && s.rollNo); // Filter out invalid rows

                if (students.length === 0) {
                    reject(new Error('No valid student data found. Please ensure the file has "name" and "rollNo" columns.'));
                } else {
                    resolve(students);
                }
            } catch (error) {
                reject(new Error('Failed to parse CSV file: ' + (error as Error).message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
    });
}

/**
 * Process Excel file and extract student data
 */
export async function processExcel(file: File): Promise<StudentData[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

                // Map to our StudentData format
                const students: StudentData[] = jsonData.map((row: any) => ({
                    name: String(row.name || row.Name || '').trim(),
                    rollNo: String(row.rollNo || row.RollNo || row.rollno || row['Roll No'] || '').trim(),
                })).filter(s => s.name && s.rollNo);

                if (students.length === 0) {
                    reject(new Error('No valid student data found. Please ensure the file has "name" and "rollNo" columns.'));
                } else {
                    resolve(students);
                }
            } catch (error) {
                reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Process image file using OCR and extract student data
 */
export async function processImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<StudentData[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const imageData = e.target?.result as string;

                // Perform OCR
                const result = await Tesseract.recognize(
                    imageData,
                    'eng',
                    {
                        logger: (m) => {
                            if (m.status === 'recognizing text' && onProgress) {
                                onProgress(Math.round(m.progress * 100));
                            }
                        },
                    }
                );

                const text = result.data.text;

                // Parse the text to extract student data
                // Assuming format: Name | Roll No or Name, Roll No or similar
                const lines = text.split('\n').filter(line => line.trim());
                const students: StudentData[] = [];

                for (const line of lines) {
                    // Try different separators
                    let parts: string[] = [];
                    if (line.includes('|')) {
                        parts = line.split('|');
                    } else if (line.includes(',')) {
                        parts = line.split(',');
                    } else if (line.includes('\t')) {
                        parts = line.split('\t');
                    } else {
                        // Try to split by multiple spaces
                        parts = line.split(/\s{2,}/);
                    }

                    if (parts.length >= 2) {
                        const name = parts[0].trim();
                        const rollNo = parts[1].trim();

                        // Basic validation
                        if (name && rollNo && name.length > 1) {
                            students.push({ name, rollNo });
                        }
                    }
                }

                if (students.length === 0) {
                    reject(new Error('No valid student data found in image. Please ensure the image contains a clear table with Name and Roll No columns.'));
                } else {
                    resolve(students);
                }
            } catch (error) {
                reject(new Error('Failed to process image: ' + (error as Error).message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Main file processor that routes to appropriate handler based on file type
 */
export async function processFile(
    file: File,
    onProgress?: (progress: number) => void
): Promise<StudentData[]> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // Determine file type and process accordingly
    if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
        return processCSV(file);
    } else if (
        fileType === 'application/vnd.ms-excel' ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileName.endsWith('.xls') ||
        fileName.endsWith('.xlsx')
    ) {
        return processExcel(file);
    } else if (fileType.startsWith('image/')) {
        return processImage(file, onProgress);
    } else {
        throw new Error('Unsupported file type. Please upload a CSV, Excel, or image file.');
    }
}

// ============ RESULT FILE PROCESSORS ============

/**
 * Process CSV file and extract result data (rollNo and marks)
 */
export async function processResultCSV(file: File): Promise<ResultData[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

                // Map to ResultData format
                const results: ResultData[] = jsonData.map((row: any) => ({
                    rollNo: String(row.rollNo || row.RollNo || row.rollno || row['Roll No'] || '').trim(),
                    marks: Number(row.marks || row.Marks || row.obtainedMarks || row['Obtained Marks'] || 0),
                })).filter(r => r.rollNo && !isNaN(r.marks));

                if (results.length === 0) {
                    reject(new Error('No valid result data found. Please ensure the file has "rollNo" and "marks" columns.'));
                } else {
                    resolve(results);
                }
            } catch (error) {
                reject(new Error('Failed to parse result CSV file: ' + (error as Error).message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
    });
}

/**
 * Process Excel file and extract result data (rollNo and marks)
 */
export async function processResultExcel(file: File): Promise<ResultData[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

                // Map to ResultData format
                const results: ResultData[] = jsonData.map((row: any) => ({
                    rollNo: String(row.rollNo || row.RollNo || row.rollno || row['Roll No'] || '').trim(),
                    marks: Number(row.marks || row.Marks || row.obtainedMarks || row['Obtained Marks'] || 0),
                })).filter(r => r.rollNo && !isNaN(r.marks));

                if (results.length === 0) {
                    reject(new Error('No valid result data found. Please ensure the file has "rollNo" and "marks" columns.'));
                } else {
                    resolve(results);
                }
            } catch (error) {
                reject(new Error('Failed to parse result Excel file: ' + (error as Error).message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Process image file using OCR and extract result data (rollNo and marks)
 */
export async function processResultImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<ResultData[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const imageData = e.target?.result as string;

                // Perform OCR
                const result = await Tesseract.recognize(
                    imageData,
                    'eng',
                    {
                        logger: (m) => {
                            if (m.status === 'recognizing text' && onProgress) {
                                onProgress(Math.round(m.progress * 100));
                            }
                        },
                    }
                );

                const text = result.data.text;

                // Parse the text to extract result data
                const lines = text.split('\n').filter(line => line.trim());
                const results: ResultData[] = [];

                for (const line of lines) {
                    // Try different separators
                    let parts: string[] = [];
                    if (line.includes('|')) {
                        parts = line.split('|');
                    } else if (line.includes(',')) {
                        parts = line.split(',');
                    } else if (line.includes('\t')) {
                        parts = line.split('\t');
                    } else {
                        parts = line.split(/\s{2,}/);
                    }

                    if (parts.length >= 2) {
                        const rollNo = parts[0].trim();
                        const marks = parseFloat(parts[1].trim());

                        // Basic validation
                        if (rollNo && !isNaN(marks)) {
                            results.push({ rollNo, marks });
                        }
                    }
                }

                if (results.length === 0) {
                    reject(new Error('No valid result data found in image. Please ensure the image contains a clear table with Roll No and Marks columns.'));
                } else {
                    resolve(results);
                }
            } catch (error) {
                reject(new Error('Failed to process result image: ' + (error as Error).message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Main result file processor that routes to appropriate handler based on file type
 */
export async function processResultFile(
    file: File,
    onProgress?: (progress: number) => void
): Promise<ResultData[]> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // Determine file type and process accordingly
    if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
        return processResultCSV(file);
    } else if (
        fileType === 'application/vnd.ms-excel' ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileName.endsWith('.xls') ||
        fileName.endsWith('.xlsx')
    ) {
        return processResultExcel(file);
    } else if (fileType.startsWith('image/')) {
        return processResultImage(file, onProgress);
    } else {
        throw new Error('Unsupported file type. Please upload a CSV, Excel, or image file.');
    }
}
