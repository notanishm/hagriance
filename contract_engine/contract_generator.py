# Contract Generation Engine - Standalone CLI
# Run: python contract_generator.py

from fpdf import FPDF
import datetime
import os
import uuid

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

def get_input(prompt, required=True):
    while True:
        value = input(prompt).strip()
        if value or not required:
            return value
        print("This field is required. Please enter a value.")

def get_yes_no(prompt):
    while True:
        value = input(f"{prompt} (y/n): ").strip().lower()
        if value in ['y', 'yes']:
            return True
        elif value in ['n', 'no']:
            return False

def get_farming_methods():
    print("\n=== FARMING METHODS ===")
    print("Select methods (enter numbers separated by commas, e.g., 1,3,5)")
    methods = [
        "Organic Farming",
        "Natural Farming", 
        "Integrated Pest Management (IPM)",
        "Crop Rotation",
        "Mulching",
        "Drip Irrigation",
        "Sprinkler System",
        "Green Manure",
        "Vermicomposting",
        "Hydroponics"
    ]
    for i, m in enumerate(methods, 1):
        print(f"  {i}. {m}")
    
    selected = []
    while True:
        choice = input("\nEnter numbers (or press Enter to finish): ").strip()
        if not choice:
            break
        try:
            nums = [int(x.strip()) for x in choice.split(',')]
            for n in nums:
                if 1 <= n <= len(methods):
                    selected.append(methods[n-1])
            break
        except:
            print("Invalid input. Try again.")
    return selected

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
    print("\n" + "="*50)
    print("   AGRIANCE CONTRACT GENERATOR")
    print("="*50)
    
    data = {}
    
    # Contract Details
    print("\n--- CONTRACT DETAILS ---")
    data['contract_number'] = f"CRT-{datetime.datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
    data['contract_date'] = datetime.datetime.now().strftime('%d-%m-%Y')
    data['crop_name'] = get_input("Crop Name: ")
    data['quantity'] = get_input("Quantity (Quintals): ")
    data['price'] = get_input("Price per Quintal (Rs.): ")
    data['delivery_date'] = get_input("Delivery Date (DD-MM-YYYY): ")
    
    # Farmer Details
    print("\n--- FARMER DETAILS (Party A) ---")
    data['farmer_name'] = get_input("Farmer Name: ")
    data['farmer_location'] = get_input("Location (Village, District, State): ")
    data['farmer_phone'] = get_input("Phone Number (optional): ", required=False)
    data['farmer_land_size'] = get_input("Land Size in Hectares (optional): ", required=False)
    
    # Business Details
    print("\n--- BUSINESS DETAILS (Party B) ---")
    data['business_name'] = get_input("Company/Business Name: ")
    data['business_contact'] = get_input("Contact Person Name: ")
    data['business_gst'] = get_input("GST Number (optional): ", required=False)
    data['business_phone'] = get_input("Business Phone (optional): ", required=False)
    
    # Farming Methods
    data['farming_methods'] = get_farming_methods()
    if not data['farming_methods']:
        data['farming_methods'] = ['Standard Farming']
    
    # Equipment
    print("\n--- EQUIPMENT PROVIDED BY BUSINESS ---")
    data['equipment'] = get_input("Equipment/Inputs (or press Enter for none): ", required=False)
    if not data['equipment']:
        data['equipment'] = "No additional equipment provided."
    
    # Payment Structure
    print("\n--- PAYMENT STRUCTURE ---")
    data['advance_percent'] = get_input("Advance Payment % (default 30): ", required=False) or "30"
    data['delivery_percent'] = get_input("On Delivery % (default 50): ", required=False) or "50"
    data['quality_percent'] = get_input("After Quality Check % (default 20): ", required=False) or "20"
    
    print("\n--- PAYMENT MODE ---")
    print("1. Bank Transfer  2. UPI  3. Cheque  4. Cash")
    pm = get_input("Select (1-4): ")
    modes = {1: "Bank Transfer", 2: "UPI", 3: "Cheque", 4: "Cash"}
    data['payment_mode'] = modes.get(int(pm) if pm.isdigit() else 1, "Bank Transfer")
    
    # Generate PDF
    print("\n" + "="*50)
    print("Generating contract PDF...")
    
    pdf = generate_contract(data)
    
    filename = f"Contract_{data['contract_number']}.pdf"
    pdf.output(filename)
    
    print(f"\n✓ Contract generated successfully!")
    print(f"✓ Saved as: {filename}")
    print("="*50)

if __name__ == "__main__":
    main()
