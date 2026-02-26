import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ label, accept, onFileSelect, value }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    };

    const handleFileChange = (file) => {
        if (onFileSelect) onFileSelect(file);
    };

    const clearFile = (e) => {
        e.stopPropagation();
        if (onFileSelect) onFileSelect(null);
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--text-main)'
                }}>
                    {label}
                </label>
            )}

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    position: 'relative',
                    padding: '2rem',
                    background: isDragging ? 'rgba(45, 90, 39, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                    overflow: 'hidden'
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    accept={accept}
                    style={{ display: 'none' }}
                />

                <AnimatePresence mode="wait">
                    {value ? (
                        <motion.div
                            key="file-info"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
                        >
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(45, 90, 39, 0.1)',
                                borderRadius: '12px',
                                color: 'var(--primary)'
                            }}>
                                <File size={24} />
                            </div>
                            <div style={{ textAlign: 'left', flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                    {value.name || 'File Uploaded'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Ready for submission
                                </div>
                            </div>
                            <button
                                onClick={clearFile}
                                style={{
                                    background: 'rgba(0, 0, 0, 0.05)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload-prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem',
                                boxShadow: 'var(--shadow-sm)',
                                color: 'var(--primary)'
                            }}>
                                <Upload size={20} />
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                Click or drag file to upload
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {accept ? `Accepted: ${accept}` : 'PDF, JPG, PNG up to 10MB'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {value && (
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        color: 'var(--success)'
                    }}>
                        <CheckCircle size={18} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
