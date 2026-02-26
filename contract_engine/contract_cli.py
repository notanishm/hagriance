# Contract Generation Engine - CLI with Arguments
# Run: python contract_cli.py

from fpdf import FPDF
import datetime
import uuid
import sys
import os

class ContractPDF(FPDF):
    def header(self):
        self.set_fill_color(26, 71, 42)
        self.rect(0, 0, 210, 35, 'F')
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

    def chapter_body(self, text):
        self.set_font('Helvetica', '', 11)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 7, text)
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

def generate_contract(data):
    pdf = ContractPDF()
    pdf.add_page()
    
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(0, 8, f"Contract No: {data['contract_number']}", 0, 1, 'R')
    pdf.cell(0, 8, f"Date: {data['contract_date']}", 0, 1, 'R')
    pdf.ln(10)
    
    pdf.chapter_title("THIS AGREEMENT")
    preamble = f"""This Agricultural Produce Purchase Contract ("Agreement") is made and entered into on {data['contract_date']}, by and between:

{data['farmer_name']}, residing at {data['farmer_location']}, Phone: {data.get('farmer_phone', 'N/A')} (hereinafter referred to as "PRODUCER/FARMER" - Party A)

AND

{data['business_name']}, GST No. {data.get('business_gst', 'N/A')}, represented by {data.get('business_contact', 'Authorized Signatory')} (hereinafter referred to as "BUYER/COMPANY" - Party B)

WHEREAS the PRODUCER is engaged in agricultural activities;

AND WHEREAS the BUYER is engaged in the business of purchasing agricultural produce;

NOW THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, the parties agree as follows:"""
    pdf.chapter_body(preamble)
    pdf.ln(5)
    
    pdf.add_page()
    pdf.chapter_title("TERMS AND CONDITIONS")
    
    total_value = int(data['quantity']) * int(data['price'])
    
    clauses = [
        {
            "title": "SCOPE OF AGREEMENT",
            "content": f"Crop: {data['crop_name']}\nQuantity: {data['quantity']} Quintals\nPrice: Rs. {data['price']} per Quintal\nTotal Contract Value: Rs. {total_value:,}"
        },
        {
            "title": "DELIVERY TERMS",
            "content": f"The produce shall be delivered on or before {data['delivery_date']} at a mutually agreed location."
        },
        {
            "title": "QUALITY STANDARDS",
            "content": "The produce shall be of good quality, free from adulteration. Moisture content shall not exceed 14%. Buyer reserves the right to reject produce not meeting quality standards."
        },
        {
            "title": "FARMING METHODS",
            "content": f"The producer agrees to use: {', '.join(data.get('farming_methods', ['Standard']))}"
        },
        {
            "title": "EQUIPMENT & INPUTS",
            "content": data.get('equipment', 'No additional equipment provided.')
        },
        {
            "title": "PAYMENT TERMS",
            "content": f"Advance: {data['advance_percent']}% | On Delivery: {data['delivery_percent']}% | After Quality: {data['quality_percent']}%\nPayment Mode: {data.get('payment_mode', 'Bank Transfer')}"
        },
        {
            "title": "OBLIGATIONS OF PRODUCER",
            "content": "1. Cultivate as per agreed methods\n2. Maintain cultivation records\n3. Inform buyer about crop issues immediately\n4. Deliver produce on agreed date\n5. Ensure quality standards are met"
        },
        {
            "title": "OBLIGATIONS OF BUYER",
            "content": "1. Provide agreed equipment/inputs in time\n2. Make payments as per schedule\n3. Accept delivery of quality produce\n4. Honor contract in good faith"
        },
        {
            "title": "FORCE MAJEURE",
            "content": "Neither party shall be liable for delays due to circumstances beyond control including natural disasters, war, epidemics, etc."
        },
        {
            "title": "DISPUTE RESOLUTION",
            "content": "Disputes shall be resolved through mutual discussion within 30 days. Failing which, arbitration under Indian laws."
        }
    ]
    
    pdf.add_clauses(clauses)
    
    pdf.add_page()
    pdf.chapter_title("SIGNATURES")
    pdf.set_font('Helvetica', '', 11)
    pdf.multi_cell(0, 8, "IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.")
    pdf.ln(20)
    
    # Farmer Signature
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(26, 71, 42)
    pdf.cell(90, 10, "PRODUCER/FARMER (Party A)", 0, 2)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(90, 8, f"Name: {data['farmer_name']}", 0, 2)
    pdf.cell(90, 8, f"Location: {data['farmer_location']}", 0, 2)
    pdf.line(15, pdf.get_y() + 20, 90, pdf.get_y() + 20)
    pdf.set_xy(15, pdf.get_y() + 22)
    pdf.cell(75, 8, "Signature", 0, 0, 'L')
    pdf.cell(0, 8, "Date: ____________", 0, 1, 'R')
    
    # Business Signature
    pdf.ln(25)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(26, 71, 42)
    pdf.cell(90, 10, "BUYER/COMPANY (Party B)", 0, 2)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(90, 8, f"Company: {data['business_name']}", 0, 2)
    pdf.cell(90, 8, f"Contact: {data.get('business_contact', 'N/A')}", 0, 2)
    pdf.line(15, pdf.get_y() + 20, 90, pdf.get_y() + 20)
    pdf.set_xy(15, pdf.get_y() + 22)
    pdf.cell(75, 8, "Signature", 0, 0, 'L')
    pdf.cell(0, 8, "Date: ____________", 0, 1, 'R')
    
    pdf.ln(25)
    pdf.set_font('Helvetica', 'I', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, "WITNESS 1: _________________________     WITNESS 2: _________________________", 0, 1, 'C')
    
    pdf.set_y(-20)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.cell(0, 5, f"Generated on {datetime.datetime.now().strftime('%d-%m-%Y at %H:%M:%S')}", 0, 1, 'C')
    pdf.cell(0, 5, "Agriance - Agricultural Contract Platform", 0, 1, 'C')
    
    return pdf

def main():
    # Default values
    data = {
        'contract_number': f"CRT-{datetime.datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}",
        'contract_date': datetime.datetime.now().strftime('%d-%m-%Y'),
        'crop_name': 'Wheat',
        'quantity': '100',
        'price': '2500',
        'delivery_date': '31-03-2026',
        'farmer_name': 'Ramesh Kumar',
        'farmer_location': 'Village Ramnagar, District Vadodara, Gujarat',
        'farmer_phone': '9876543210',
        'farmer_land_size': '5',
        'business_name': 'AgriTech Foods Private Limited',
        'business_contact': 'Suresh Patel',
        'business_gst': '24AABCU9603R1ZM',
        'business_phone': '0265-1234567',
        'farming_methods': ['Organic Farming', 'Drip Irrigation', 'Integrated Pest Management'],
        'equipment': 'Seeds, Fertilizers, Drip Irrigation System',
        'advance_percent': '30',
        'delivery_percent': '50',
        'quality_percent': '20',
        'payment_mode': 'Bank Transfer'
    }
    
    # Parse command line arguments
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        arg = args[i]
        if arg.startswith('--') and i + 1 < len(args):
            key = arg[2:].replace('-', '_')
            data[key] = args[i + 1]
            i += 2
        else:
            i += 1
    
    print("\n" + "="*50)
    print("   AGRIANCE CONTRACT GENERATOR")
    print("="*50)
    print(f"\nContract: {data['contract_number']}")
    print(f"Crop: {data['quantity']}Q x Rs.{data['price']} = Rs.{int(data['quantity']) * int(data['price']):,}")
    print(f"Farmer: {data['farmer_name']}")
    print(f"Business: {data['business_name']}")
    print(f"Farming Methods: {', '.join(data['farming_methods'])}")
    
    # Generate PDF
    pdf = generate_contract(data)
    
    filename = f"Contract_{data['contract_number']}.pdf"
    pdf.output(filename)
    
    print("")
    print("="*50)
    print("Contract generated successfully!")
    print(f"Saved as: {os.path.abspath(filename)}")
    print("="*50)

if __name__ == "__main__":
    main()
