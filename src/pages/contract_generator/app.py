# Contract Generation Engine
# Requirements: pip install flask fpdf reportlab

from flask import Flask, render_template_string, request, send_file
from fpdf import FPDF
import datetime
import os

app = Flask(__name__)

# HTML Template for the input form
INPUT_FORM = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agriance Contract Generator</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #1a472a 0%, #2d5a27 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 2rem;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { opacity: 0.8; }
        .card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            margin-bottom: 1.5rem;
        }
        .card h2 {
            color: #1a472a;
            border-bottom: 2px solid #1a472a;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        .form-group { margin-bottom: 1rem; }
        .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #333;
        }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            outline: none;
            border-color: #1a472a;
        }
        .form-group textarea { min-height: 100px; resize: vertical; }
        .section-title {
            background: #f8f9fa;
            padding: 0.75rem 1rem;
            border-left: 4px solid #1a472a;
            margin: 1.5rem 0 1rem;
            font-weight: 600;
            color: #1a472a;
        }
        .checkbox-group {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .checkbox-item input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #1a472a;
        }
        .btn {
            background: #1a472a;
            color: white;
            border: none;
            padding: 1rem 2rem;
            font-size: 1.1rem;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-weight: 600;
            transition: background 0.3s;
        }
        .btn:hover { background: #143620; }
        .btn-secondary {
            background: #6c757d;
        }
        .btn-secondary:hover { background: #5a6268; }
        .footer {
            text-align: center;
            color: white;
            opacity: 0.7;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌾 Agriance Contract Generator</h1>
            <p>Generate legally-binding agricultural contracts</p>
        </div>

        <form method="POST" action="/generate" target="_blank">
            <div class="card">
                <h2>📋 Contract Details</h2>
                <div class="form-row">
                    <div class="form-group">
                        <label>Contract Number</label>
                        <input type="text" name="contract_number" value="CRT-2026-{{contract_num}}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Contract Date</label>
                        <input type="date" name="contract_date" value="{{today}}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Crop Name</label>
                    <input type="text" name="crop_name" placeholder="e.g., Organic Wheat" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Quantity (Quintals)</label>
                        <input type="number" name="quantity" placeholder="100" required>
                    </div>
                    <div class="form-group">
                        <label>Price per Quintal (₹)</label>
                        <input type="number" name="price" placeholder="2500" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Delivery Date</label>
                    <input type="date" name="delivery_date" required>
                </div>
            </div>

            <div class="card">
                <h2>👨‍🌾 Farmer Details (Party A)</h2>
                <div class="form-row">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" name="farmer_name" placeholder="Enter farmer's full name" required>
                    </div>
                    <div class="form-group">
                        <label>Aadhaar Number</label>
                        <input type="text" name="farmer_aadhaar" placeholder="12-digit Aadhaar" maxlength="12">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="text" name="farmer_phone" placeholder="10-digit mobile" maxlength="10">
                    </div>
                    <div class="form-group">
                        <label>Location (Village/City)</label>
                        <input type="text" name="farmer_location" placeholder="Village, District, State" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Land Size (Hectares)</label>
                    <input type="number" step="0.01" name="farmer_land_size" placeholder="e.g., 5.5">
                </div>
            </div>

            <div class="card">
                <h2>🏢 Business Details (Party B)</h2>
                <div class="form-row">
                    <div class="form-group">
                        <label>Company/Business Name</label>
                        <input type="text" name="business_name" placeholder="Company name" required>
                    </div>
                    <div class="form-group">
                        <label>GST Number</label>
                        <input type="text" name="business_gst" placeholder="29AABCU9603R1ZM">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Contact Person</label>
                        <input type="text" name="business_contact" placeholder="Name of contact person" required>
                    </div>
                    <div class="form-group">
                        <label>Business Phone</label>
                        <input type="text" name="business_phone" placeholder="10-digit mobile">
                    </div>
                </div>
                <div class="form-group">
                    <label>Registered Address</label>
                    <textarea name="business_address" placeholder="Full business address"></textarea>
                </div>
            </div>

            <div class="card">
                <h2>🌱 Farming Methods & Equipment</h2>
                
                <div class="section-title">Farming Methods (Select all that apply)</div>
                <div class="checkbox-group">
                    <div class="checkbox-item"><input type="checkbox" name="farming_methods" value="Organic"> <span>Organic</span></div>
                    <div class="checkbox-item"><input type="checkbox" name="farming_methods" value="Natural Farming"> <span>Natural Farming</span></div>
                    <div class="checkbox-item"><input type="checkbox" name="farming_methods" value="Integrated Pest Management"> <span>IPM</span></div>
                    <div class="checkbox-item"><input type="checkbox" name="farming_methods" value="Crop Rotation"> <span>Crop Rotation</span></div>
                    <div class="checkbox-item"><input type="checkbox" name="farming_methods" value="Mulching"> <span>Mulching</span></div>
                    <div class="checkbox-item"><input type="checkbox" name="farming_methods" value="Drip Irrigation"> <span>Drip Irrigation</span></div>
                    <div class="checkbox-item"><input type="checkbox" name="farming_methods" value="Sprinkler System"> <span>Sprinkler</span></div>
                    <div class="checkbox-item"><input type="checkbox" name="farming_methods" value="Green Manure"> <span>Green Manure</span></div>
                    <div class="checkbox-item"><input type="checkbox" name="farming_methods" value="Vermicomposting"> <span>Vermicompost</span></div>
                </div>

                <div class="section-title">Equipment Provided by Business</div>
                <div class="form-group">
                    <textarea name="equipment_provided" placeholder="List equipment, seeds, fertilizers to be provided by the business..."></textarea>
                </div>
            </div>

            <div class="card">
                <h2>💰 Payment Structure</h2>
                <div class="form-row">
                    <div class="form-group">
                        <label>Advance Payment (%)</label>
                        <input type="number" name="advance_percent" value="30" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>On Delivery (%)</label>
                        <input type="number" name="delivery_percent" value="50" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>After Quality Check (%)</label>
                        <input type="number" name="quality_percent" value="20" min="0" max="100">
                    </div>
                </div>
                <div class="form-group">
                    <label>Payment Mode</label>
                    <select name="payment_mode">
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Cash">Cash</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Additional Payment Terms</label>
                    <textarea name="payment_terms" placeholder="Any additional payment conditions..."></textarea>
                </div>
            </div>

            <button type="submit" class="btn">📄 Generate Contract PDF</button>
        </form>

        <div class="footer">
            Agriance Contract Generation Engine &copy; 2026
        </div>
    </div>
</body>
</html>
"""

class ContractPDF(FPDF):
    def header(self):
        # Header bar
        self.set_fill_color(26, 71, 42)
        self.rect(0, 0, 210, 35, 'F')
        
        # Title
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(255, 255, 255)
        self.cell(0, 25, 'AGRIANCE CONTRACT AGREEMENT', 0, 1, 'C')
        
        self.set_font('Helvetica', '', 10)
        self.cell(0, 5, 'Agricultural Produce Purchase & Supply Contract', 0, 1, 'C')
        
        self.ln(10)

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 12)
        self.set_fill_color(26, 71, 42)
        self.cell(0, 10, title, 0, 1, 'L', True)
        self.ln(4)

    def chapter_body(self, text, indent=0):
        self.set_font('Helvetica', '', 11)
        self.set_text_color(0, 0, 0)
        
        lines = text.split('\n')
        for line in lines:
            if line.strip():
                self.cell(indent, 7, line.strip(), 0, 1, 'L')
        self.ln(3)

    def add_clauses(self, clauses):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(26, 71, 42)
        
        for i, clause in enumerate(clauses, 1):
            self.cell(0, 8, f"{i}. {clause['title']}", 0, 1, 'L')
            self.set_font('Helvetica', '', 10)
            self.set_text_color(0, 0, 0)
            self.multi_cell(0, 6, f"   {clause['content']}")
            self.ln(3)
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(26, 71, 42)

    def signature_block(self, party, name, date_label="Date:"):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(26, 71, 42)
        self.cell(90, 10, f"{party}:", 0, 0, 'L')
        
        self.set_font('Helvetica', '', 10)
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, date_label, 0, 1, 'L')
        
        # Signature line
        self.set_draw_color(100, 100, 100)
        self.line(10, self.get_y() + 25, 95, self.get_y() + 25)
        
        self.ln(30)

def generate_contract(data):
    pdf = ContractPDF()
    pdf.add_page()
    
    # Contract Number & Date
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(0, 8, f"Contract No: {data['contract_number']}", 0, 1, 'R')
    pdf.cell(0, 8, f"Date: {data['contract_date']}", 0, 1, 'R')
    pdf.ln(10)
    
    # Preamble
    pdf.chapter_title("THIS AGREEMENT")
    preamble = f"""This Agricultural Produce Purchase Contract ("Agreement") is made and entered into on {data['contract_date']}, by and between:

{data['farmer_name']}, son/daughter of {data.get('farmer_father', '___')}, aged about ___ years, residing at {data['farmer_location']}, Aadhaar No. {data.get('farmer_aadhaar', '___')}, Phone: {data.get('farmer_phone', '___')} (hereinafter referred to as "PRODUCER/FARMER" which expression shall include their heirs, successors and assigns) (Party A)

AND

{data['business_name']}, a company/firm registered under the Companies Act/GST, having its registered office at {data.get('business_address', 'N/A')}, GST No. {data.get('business_gst', '___')}, represented by {data.get('business_contact', 'Authorized Signatory')} (hereinafter referred to as "BUYER/COMPANY" which expression shall include its successors and assigns) (Party B)

WHEREAS the PRODUCER is engaged in agricultural activities and is the owner/cultivator of agricultural land;

AND WHEREAS the BUYER is engaged in the business of purchasing agricultural produce;

NOW THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth and for other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, the parties agree as follows:"""
    pdf.chapter_body(preamble)
    pdf.ln(5)
    
    # Terms and Conditions
    pdf.add_page()
    pdf.chapter_title("TERMS AND CONDITIONS")
    
    clauses = [
        {
            "title": "SCOPE OF AGREEMENT",
            "content": f"The PRODUCER agrees to cultivate and supply, and the BUYER agrees to purchase the following agricultural produce:\nCrop: {data['crop_name']}\nQuantity: {data['quantity']} Quintals\nPrice: Rs. {data['price']} per Quintal\nTotal Contract Value: Rs. {int(data['quantity']) * int(data['price'])}"
        },
        {
            "title": "DELIVERY TERMS",
            "content": f"The produce shall be delivered on or before {data['delivery_date']} at a location mutually agreed upon by both parties. The delivery shall be completed during business hours (9:00 AM to 6:00 PM)."
        },
        {
            "title": "QUALITY STANDARDS",
            "content": "The produce shall be of good quality, free from adulteration, and meet the quality standards as specified by the buyer. The moisture content shall not exceed 14%. The buyer reserves the right to reject produce that does not meet the quality standards."
        },
        {
            "title": "FARMING METHODS",
            "content": f"The producer agrees to use the following farming methods:\n{', '.join(data.get('farming_methods', []))}\n\nAny deviation from the agreed farming methods shall require prior written approval from the buyer."
        },
        {
            "title": "EQUIPMENT & INPUTS",
            "content": f"The following equipment/inputs shall be provided by the BUYER:\n{data.get('equipment_provided', 'N/A')}"
        },
        {
            "title": "PAYMENT TERMS",
            "content": f"Payment shall be made as follows:\n- Advance Payment: {data.get('advance_percent', 30)}% of total contract value (to be paid within 7 days of contract signing)\n- On Delivery: {data.get('delivery_percent', 50)}% of total contract value\n- After Quality Check: {data.get('quality_percent', 20)}% of total contract value\n\nPayment Mode: {data.get('payment_mode', 'Bank Transfer')}\n\nAdditional Terms: {data.get('payment_terms', 'N/A')}"
        },
        {
            "title": "OBLIGATIONS OF PRODUCER",
            "content": "1. To cultivate the crop as per agreed farming methods\n2. To maintain proper records of cultivation\n3. To inform buyer about any crop disease or pest attack immediately\n4. To deliver produce on the agreed date and location\n5. To ensure produce meets quality standards\n6. To provide necessary documents for verification"
        },
        {
            "title": "OBLIGATIONS OF BUYER",
            "content": "1. To provide agreed equipment/inputs in time\n2. To make payments as per the payment schedule\n3. To accept delivery of produce meeting quality standards\n4. To provide necessary technical guidance if required\n5. To honor the contract terms in good faith"
        },
        {
            "title": "FORCE MAJEURE",
            "content": "Neither party shall be liable for any failure or delay in performing their obligations under this contract if such failure or delay results from circumstances beyond the reasonable control of that party, including but not limited to natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, epidemics, pandemics, or strikes."
        },
        {
            "title": "DISPUTE RESOLUTION",
            "content": "Any dispute arising out of or in connection with this contract shall first be resolved through mutual discussion. If the dispute cannot be resolved amicably within 30 days, it shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted by a sole arbitrator appointed by mutual consent. The arbitration shall be held in accordance with the rules of the Arbitration and Conciliation Act, 1996."
        },
        {
            "title": "GOVERNING LAW",
            "content": "This contract shall be governed by and construed in accordance with the laws of India. Any legal proceedings shall be subject to the exclusive jurisdiction of the courts in the State where the producer's land is located."
        },
        {
            "title": "ENTIRE AGREEMENT",
            "content": "This contract constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, or agreements relating thereto. This contract may not be amended except by a written instrument signed by both parties."
        }
    ]
    
    pdf.add_clauses(clauses)
    
    # Signature Page
    pdf.add_page()
    pdf.chapter_title("SIGNATURES")
    
    pdf.set_font('Helvetica', '', 11)
    pdf.multi_cell(0, 8, "IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.")
    pdf.ln(20)
    
    # Farmer Signature
    pdf.set_xy(10, pdf.get_y())
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(26, 71, 42)
    pdf.cell(90, 10, "PRODUCER/FARMER (Party A)", 0, 2)
    
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(90, 8, f"Name: {data['farmer_name']}", 0, 2)
    pdf.cell(90, 8, f"Location: {data['farmer_location']}", 0, 2)
    pdf.cell(90, 8, f"Phone: {data.get('farmer_phone', '___')}", 0, 2)
    
    pdf.line(15, pdf.get_y() + 20, 90, pdf.get_y() + 20)
    pdf.set_xy(15, pdf.get_y() + 22)
    pdf.cell(75, 8, "Signature", 0, 0, 'L')
    pdf.cell(0, 8, "Date: ____________", 0, 1, 'R')
    
    # Business Signature
    pdf.ln(30)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(26, 71, 42)
    pdf.cell(90, 10, "BUYER/COMPANY (Party B)", 0, 2)
    
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(90, 8, f"Company: {data['business_name']}", 0, 2)
    pdf.cell(90, 8, f"Contact: {data.get('business_contact', '___')}", 0, 2)
    pdf.cell(90, 8, f"GST: {data.get('business_gst', '___')}", 0, 2)
    
    pdf.line(15, pdf.get_y() + 20, 90, pdf.get_y() + 20)
    pdf.set_xy(15, pdf.get_y() + 22)
    pdf.cell(75, 8, "Signature", 0, 0, 'L')
    pdf.cell(0, 8, "Date: ____________", 0, 1, 'R')
    
    # Witness Section
    pdf.ln(30)
    pdf.set_font('Helvetica', 'I', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, "WITNESS 1: _________________________     WITNESS 2: _________________________", 0, 1, 'C')
    
    # Footer
    pdf.set_y(-25)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.cell(0, 5, f"This is a computer-generated document. Generated on {datetime.datetime.now().strftime('%d-%m-%Y at %H:%M:%S')}", 0, 1, 'C')
    pdf.cell(0, 5, "Agriance - Agricultural Contract Platform | www.agriance.com", 0, 1, 'C')
    
    return pdf

@app.route('/')
def index():
    from datetime import date
    import random
    contract_num = f"2026-{random.randint(100000, 999999)}"
    return render_template_string(INPUT_FORM, contract_num=contract_num, today=date.today())

@app.route('/generate', methods=['POST'])
def generate():
    data = request.form.to_dict()
    
    # Handle checkbox list
    data['farming_methods'] = request.form.getlist('farming_methods')
    
    # Calculate total value
    data['total_value'] = int(data.get('quantity', 0)) * int(data.get('price', 0))
    
    # Generate PDF
    pdf = generate_contract(data)
    
    # Save to file
    filename = f"Contract_{data['contract_number']}.pdf"
    filepath = f"/tmp/{filename}"
    pdf.output(filepath)
    
    return send_file(filepath, as_attachment=True, download_name=filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
