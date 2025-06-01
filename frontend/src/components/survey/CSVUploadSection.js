// CSVUploadSection.js
import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const CSVUploadSection = ({ onCSVParsed }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const [fileName, setFileName] = useState('');

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setUploadStatus('error');
            setErrorMessage('Please upload a CSV file only.');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setUploadStatus('error');
            setErrorMessage('File size must be less than 5MB.');
            return;
        }

        setFileName(file.name);
        setUploadStatus('uploading');
        setErrorMessage('');

        // Parse CSV file
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csv = event.target.result;
                const questions = parseCSV(csv);

                if (questions.length === 0) {
                    setUploadStatus('error');
                    setErrorMessage('No valid questions found in the CSV file.');
                    return;
                }

                setUploadStatus('success');
                onCSVParsed(questions);
            } catch (error) {
                setUploadStatus('error');
                setErrorMessage('Error parsing CSV file. Please check the format.');
            }
        };

        reader.onerror = () => {
            setUploadStatus('error');
            setErrorMessage('Error reading the file.');
        };

        reader.readAsText(file);
    };

    const parseCSV = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one question row');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Expected headers: question, type, options (optional), required (optional)
        const questionIndex = headers.findIndex(h => h.includes('question'));
        const typeIndex = headers.findIndex(h => h.includes('type'));
        const optionsIndex = headers.findIndex(h => h.includes('option'));
        const requiredIndex = headers.findIndex(h => h.includes('required'));

        if (questionIndex === -1 || typeIndex === -1) {
            throw new Error('CSV must have "question" and "type" columns');
        }

        const questions = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());

            if (values.length < Math.max(questionIndex, typeIndex) + 1) {
                continue; // Skip incomplete rows
            }

            const questionText = values[questionIndex]?.replace(/"/g, '');
            const type = values[typeIndex]?.replace(/"/g, '').toLowerCase();

            if (!questionText || !type) {
                continue; // Skip rows without question or type
            }

            // Validate question type
            const validTypes = ['text', 'textarea', 'number', 'email', 'phone', 'date', 'radio', 'checkbox', 'dropdown', 'rating'];
            if (!validTypes.includes(type)) {
                continue; // Skip invalid types
            }

            const question = {
                id: `csv-${i}`,
                question: questionText,
                type: type,
                required: requiredIndex !== -1 ?
                    (values[requiredIndex]?.toLowerCase() === 'true' || values[requiredIndex] === '1') :
                    false
            };

            // Handle options for choice-based questions
            if (['radio', 'checkbox', 'dropdown'].includes(type) && optionsIndex !== -1) {
                const optionsText = values[optionsIndex]?.replace(/"/g, '');
                if (optionsText) {
                    // Split options by semicolon or pipe
                    question.options = optionsText.split(/[;|]/).map(opt => opt.trim()).filter(opt => opt);
                }
            }

            // Handle rating scale
            if (type === 'rating') {
                const scaleIndex = headers.findIndex(h => h.includes('scale'));
                if (scaleIndex !== -1 && values[scaleIndex]) {
                    const scale = parseInt(values[scaleIndex]);
                    if ([3, 5, 7, 10].includes(scale)) {
                        question.scale = scale;
                    }
                }
            }

            questions.push(question);
        }

        return questions;
    };

    const resetUpload = () => {
        setUploadStatus(null);
        setErrorMessage('');
        setFileName('');
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Import Questions from CSV</h2>
                <p className="text-gray-600 text-sm">
                    Upload a CSV file containing your survey questions. Survey title, description and other settings will remain unchanged.
                </p>
            </div>

            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : uploadStatus === 'success'
                            ? 'border-green-400 bg-green-50'
                            : uploadStatus === 'error'
                                ? 'border-red-400 bg-red-50'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadStatus === 'uploading'}
                />

                {uploadStatus === null && (
                    <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            Drop your CSV file here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                            Supports CSV files up to 5MB
                        </p>
                    </>
                )}

                {uploadStatus === 'uploading' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            Processing {fileName}...
                        </p>
                        <p className="text-sm text-gray-500">
                            Parsing questions from your CSV file
                        </p>
                    </>
                )}

                {uploadStatus === 'success' && (
                    <>
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            Successfully imported {fileName}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Questions imported successfully and ready to edit
                        </p>
                        <button
                            onClick={resetUpload}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            Upload Another File
                        </button>
                    </>
                )}

                {uploadStatus === 'error' && (
                    <>
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            Upload Failed
                        </p>
                        <p className="text-sm text-red-600 mb-4">
                            {errorMessage}
                        </p>
                        <button
                            onClick={resetUpload}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </>
                )}
            </div>

            {/* CSV Format Guide */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">CSV Format for Questions:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>• <strong>Required columns:</strong> question, type</p>
                    <p>• <strong>Optional columns:</strong> options, required, scale</p>
                    <p>• <strong>Valid types:</strong> text, textarea, number, email, phone, date, radio, checkbox, dropdown, rating</p>
                    <p>• <strong>Options format:</strong> Separate multiple choices with semicolons (;)</p>
                    <p>• <strong>Required format:</strong> true/false or 1/0</p>
                    <p>• <strong>Note:</strong> Only questions will be imported. Survey title and description are set separately.</p>
                </div>

                <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-xs font-mono text-gray-700">
                        Example CSV content:<br />
                        question,type,options,required<br />
                        "What's your name?",text,,true<br />
                        "Choose your department",radio,"Sales;Marketing;Engineering;HR",true<br />
                        "Rate our service",rating,,false<br />
                        "Additional comments",textarea,,false
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CSVUploadSection;