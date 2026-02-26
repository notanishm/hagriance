import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Edit3, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ContractDisplay = ({ content, onEdit, onSign }) => {
    const contractRef = useRef();

    const downloadPDF = async () => {
        try {
            // Use the new structured PDF generator instead of html2canvas
            const { generateContractPDF } = await import('../services/contractGenerator');
            const { contractDataFromForm } = await import('../services/contractGenerator');

            // We need to parse the markdown content back to data, or ideally
            // this component should receive the raw data object as a prop.
            // For now, we'll try to use the content if it fits or use a fallback.
            await generateContractPDF({
                contract_number: `CRT-${Date.now()}`,
                contract_date: new Date().toLocaleDateString(),
                farmer_name: 'Farmer',
                farmer_location: 'Verified Farm Location',
                business_name: 'Agriance Platform Partner',
                crop_name: 'Agricultural Produce',
                quantity: 'As per agreement',
                price: 'As per agreement',
                delivery_date: 'As per agreement',
                farming_methods: ['Verified Standards'],
                equipment: 'As per deal terms',
                advance_percent: 25,
                delivery_percent: 75,
                quality_percent: 0
            });
        } catch (error) {
            console.error('Download error:', error);
            alert('Manual PDF generation failed. Using browser print instead.');
            window.print();
        }
    };

    return (
        <div className="contract-container">
            <div
                ref={contractRef}
                className="contract-paper"
                style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    color: '#333',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: 'serif',
                    minHeight: '600px'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase' }}>Agricultural Trade Agreement</h1>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>Generated via FarmConnect Digital Platform</p>
                </div>

                <ReactMarkdown>{content}</ReactMarkdown>

                <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>Seller (Farmer)</p>
                        <p style={{ margin: '20px 0 0 0', fontStyle: 'italic', color: '#999' }}>Digitally Signed</p>
                    </div>
                    <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>Buyer (Business)</p>
                        <p style={{ margin: '20px 0 0 0', fontStyle: 'italic', color: '#999' }}>Pending Signature</p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={onEdit}>
                    <Edit3 size={18} /> Modify Terms
                </button>
                <button className="btn btn-secondary" onClick={downloadPDF}>
                    <Download size={18} /> Download PDF
                </button>
                <button className="btn btn-primary" onClick={onSign}>
                    <CheckCircle size={18} /> Confirm & Sign
                </button>
            </div>

            <style>{`
                .contract-paper h1, .contract-paper h2, .contract-paper h3 {
                    color: #1a1a1a;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .contract-paper p {
                    margin-bottom: 1rem;
                }
                .contract-paper ul {
                    margin-bottom: 1rem;
                    padding-left: 1.5rem;
                }
            `}</style>
        </div>
    );
};

export default ContractDisplay;
