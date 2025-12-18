import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import { features } from 'process';
import { performOCR } from "@/app/actions/ocr";
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
// export async function processResultImage(
//     file: File,
//     onProgress?: (progress: number) => void
// ): Promise<ResultData[]> {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();

//         // reader.onload = async (e) => {
//         //     try {
//         //         const imageData = e.target?.result as string;

//         //         // Perform OCR
//         //         const result = await Tesseract.recognize(
//         //             imageData,
//         //             'eng',
//         //             {
//         //                 logger: (m) => {
//         //                     if (m.status === 'recognizing text' && onProgress) {
//         //                         onProgress(Math.round(m.progress * 100));
//         //                     }
//         //                 },
//         //             }
//         //         );

//         //         const text = result.data.text;
//         //         console.log('OCR Result Text:', text);
//         //         console.log('OCR Result Data:', result);


//         //         // Parse the text to extract result data
//         //         const lines = text.split('\n').filter(line => line.trim());
//         //         const results: ResultData[] = [];

//         //         for (const line of lines) {
//         //             // Try different separators
//         //             let parts: string[] = [];
//         //             if (line.includes('|')) {
//         //                 parts = line.split('|');
//         //             } else if (line.includes(',')) {
//         //                 parts = line.split(',');
//         //             } else if (line.includes('\t')) {
//         //                 parts = line.split('\t');
//         //             } else {
//         //                 parts = line.split(/\s{2,}/);
//         //             }

//         //             if (parts.length >= 2) {
//         //                 const rollNo = parts[0].trim();
//         //                 const marks = parseFloat(parts[1].trim());

//         //                 // Basic validation
//         //                 if (rollNo && !isNaN(marks)) {
//         //                     results.push({ rollNo, marks });
//         //                 }
//         //             }
//         //         }

//         //         if (results.length === 0) {
//         //             reject(new Error('No valid result data found in image. Please ensure the image contains a clear table with Roll No and Marks columns.'));
//         //         } else {
//         //             resolve(results);
//         //         }
//         //     } catch (error) {
//         //         reject(new Error('Failed to process result image: ' + (error as Error).message));
//         //     }
//         // };
//         // reader.onerror = () => reject(new Error('Failed to read image file'));
//         // reader.readAsDataURL(file);

//         reader.onload = async (e) =>{
//             try {
//                 // 1. Prepare the image (stripe the "data:image/jpeg;hase64," prefix)
//                 const base64Image = (e.target?.result as string).split(",")[1];

//                 // 2. call google vision api
//                 if(onProgress) onProgress(50);
//                 console.log('Calling Google Vision API',process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY);
//                 const response = await fetch(
//                     `https://vision.googleapis.com/v1/images:annotate?key=${process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY}`,
//                     {
//                         method: 'POST',
//                         body: JSON.stringify({
//                             requests:[
//                                 {
//                                     image:{content:base64Image},
//                                     features:[{type:'TEXT_DETECTION'}]
//                                 }
//                             ]
//                         })
//                     },
//                 );
//                 const data = await response.json();
//                 const fullText = data.responses[0].fullTextAnnotation?.text || "";
                
//                 if (onProgress) onProgress(100);

//                 // 3. Parse the text (Refined logic for handwriting)
//                 const lines = fullText.split('\n').filter((l: string) => l.trim());
//                 const results: ResultData[] = [];

//                 for (const line of lines) {
//                     // This regex looks for: [Any Chars] [Roll No Number] [Space/Symbol] [Marks Number]
//                     const matches = line.match(/(\d{3,})\s*[:|-]?\s*(\d{1,3})/);
                    
//                     if (matches) {
//                         results.push({
//                             rollNo: matches[1],
//                             marks: parseFloat(matches[2])
//                         });
//                     }
//                 }

//                 if (results.length === 0) {
//                     reject(new Error('No valid data found. Google saw: ' + fullText.substring(0, 50) + '...'));
//                 } else {
//                     resolve(results);
//                 }
//             } catch (error) {
//                 reject(new Error('Vision API Error: ' + (error as Error).message));
//             }
//         }
//         reader.readAsDataURL(file);
//     });
// }

// google vision api version
// export async function processResultImage(
//     file: File,
//     onProgress?: (progress: number) => void
// ): Promise<ResultData[]> {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();

//         reader.onload = async (e) => {
//             try {
//                 const base64Image = (e.target?.result as string).split(",")[1];

//                 if (onProgress) onProgress(30);

//                 // IMPORTANT: Ensure there are NO single quotes around the key string
//                 const apiKey = "AIzaSyB0KhSxSk82EbfYRFvH3R3AVBSVPCGQuL4"; 
                
//                 const response = await fetch(
//                     `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
//                     {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({
//                             requests: [
//                                 {
//                                     image: { content: base64Image },
//                                     features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] // Use DOCUMENT_TEXT for better handwriting results
//                                 }
//                             ]
//                         })
//                     }
//                 );

//                 const data = await response.json();

//                 // 1. Check if the API returned an error (like Billing not enabled)
//                 if (data.error) {
//                     throw new Error(`Google API Error: ${data.error.message}`);
//                 }

//                 // 2. Safely check if responses exist before accessing [0]
//                 if (!data.responses || !data.responses[0]) {
//                     throw new Error("No response received from Google Vision.");
//                 }

//                 const fullText = data.responses[0].fullTextAnnotation?.text || "";
//                 console.log("Full OCR Text:", fullText);

//                 if (onProgress) onProgress(100);

//                 // 3. Robust parsing for your handwritten image
//                 const lines = fullText.split('\n').filter((l: string) => l.trim());
//                 const results: ResultData[] = [];

//                 for (const line of lines) {
//                     // This matches a Roll No (3+ digits) and Marks (1-3 digits) 
//                     // even if there is messy handwriting/symbols between them
//                     const matches = line.match(/(\d{3,})[\s\W]+(\d{1,3})/);
                    
//                     if (matches) {
//                         results.push({
//                             rollNo: matches[1],
//                             marks: parseFloat(matches[2])
//                         });
//                     }
//                 }

//                 if (results.length === 0) {
//                     reject(new Error("Could not find Roll No and Marks pattern in image."));
//                 } else {
//                     resolve(results);
//                 }
//             } catch (error) {
//                 reject(new Error('Process Error: ' + (error as Error).message));
//             }
//         };

//         reader.onerror = () => reject(new Error('Failed to read image file'));
//         reader.readAsDataURL(file);
//     });
// }

// hugging face api
export async function processResultImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<ResultData[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                // 1. Convert file to Base64 to send to our Server Action
                const base64Image = (e.target?.result as string).split(",")[1];

                if (onProgress) onProgress(40);

                // 2. Call the Server Action
                const response = await performOCR(base64Image);

                // 3. Handle the "Model Loading" state
                if (response.error === "loading") {
                    reject(new Error(`Model is waking up. Please wait ${Math.round(response.wait || 20)}s and try again.`));
                    return;
                }

                if (response.error || !response.data) {
                    throw new Error(response.error || "Failed to extract text from image.");
                }

                const fullText = response.data;
                console.log("OCR Result from Server:", fullText);

                if (onProgress) onProgress(100);

                // 4. Parsing Logic (Extracting Roll No and Marks)
                const results: ResultData[] = [];
                // Look for all sequences of digits
                const numbers = fullText.match(/\d+/g); 

                if (numbers && numbers.length >= 2) {
                    // We assume pairs: [RollNo1, Marks1, RollNo2, Marks2...]
                    for (let i = 0; i < numbers.length; i += 2) {
                        const rollNo = numbers[i];
                        const marks = numbers[i+1];

                        if (rollNo && marks) {
                            results.push({
                                rollNo: rollNo.trim(),
                                marks: parseFloat(marks)
                            });
                        }
                    }
                }

                if (results.length === 0) {
                    reject(new Error(`No numbers found in the image. The AI saw: "${fullText}"`));
                } else {
                    resolve(results);
                }

            } catch (error) {
                reject(new Error("OCR Processing Error: " + (error as Error).message));
            }
        };

        reader.onerror = () => reject(new Error("Failed to read image file"));
        
        // Use readAsDataURL so we can easily get the Base64 string
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
        // return processResultImage(file, onProgress);
        throw new Error('Result image processing is currently disabled. Please upload a CSV or Excel file.');
    } else {
        throw new Error('Unsupported file type. Please upload a CSV, Excel, or image file.');
    }
}
