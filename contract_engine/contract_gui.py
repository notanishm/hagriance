from tkinter import *
from tkinter import ttk, messagebox
from fpdf import FPDF
import datetime
import uuid
import os

class ContractPDF(FPDF):
    def header(self):
        pass

    def footer(self):
        pass

def generate_contract(data):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=False)
    
    margin = 10
    pdf.set_margins(margin, margin, margin)
    pdf.set_font('Helvetica', '', 9)
    
    pdf.set_font('Helvetica', 'B', 13)
    pdf.cell(0, 8, 'AGRICULTURAL PRODUCE PURCHASE CONTRACT', 0, 1, 'C')
    pdf.set_font('Helvetica', '', 9)
    pdf.cell(95, 6, f"Contract No: {data['contract_number']}", 0, 0)
    pdf.cell(0, 6, f"Date: {data['contract_date']}", 0, 1, 'R')
    pdf.ln(3)
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 6, 'PARTIES TO THIS CONTRACT:', 0, 1)
    pdf.set_font('Helvetica', '', 9)
    
    pdf.cell(5, 5, 'A.', 0, 0)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.cell(35, 5, 'PRODUCER (Farmer):', 0, 0)
    pdf.set_font('Helvetica', '', 9)
    pdf.cell(0, 5, f"{data['farmer_name']}", 0, 1)
    
    pdf.cell(40, 5, '', 0, 0)
    pdf.cell(0, 5, f"{data['farmer_location']}", 0, 1)
    
    pdf.cell(40, 5, '', 0, 0)
    pdf.cell(0, 5, f"Phone: {data.get('farmer_phone', 'N/A')}  |  Land: {data.get('farmer_land_size', 'N/A')} Hectares", 0, 1)
    pdf.ln(2)
    
    pdf.cell(5, 5, 'B.', 0, 0)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.cell(35, 5, 'BUYER (Company):', 0, 0)
    pdf.set_font('Helvetica', '', 9)
    pdf.cell(0, 5, f"{data['business_name']}", 0, 1)
    
    pdf.cell(40, 5, '', 0, 0)
    pdf.cell(0, 5, f"Contact: {data.get('business_contact', 'N/A')}  |  GST: {data.get('business_gst', 'N/A')}", 0, 1)
    pdf.ln(4)
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 6, 'CONTRACT TERMS:', 0, 1)
    
    pdf.set_font('Helvetica', '', 8)
    pdf.set_fill_color(240, 240, 240)
    
    pdf.cell(60, 6, 'Description', 1, 0, 'C', True)
    pdf.cell(0, 6, 'Details', 1, 1, 'C', True)
    
    total = int(data['quantity']) * int(data['price'])
    
    pdf.cell(60, 6, 'Crop Name', 1, 0)
    pdf.cell(0, 6, str(data['crop_name']), 1, 1)
    
    pdf.cell(60, 6, 'Quantity', 1, 0)
    pdf.cell(0, 6, f"{data['quantity']} Quintals", 1, 1)
    
    pdf.cell(60, 6, 'Price per Quintal', 1, 0)
    pdf.cell(0, 6, f"Rs. {data['price']}", 1, 1)
    
    pdf.cell(60, 6, 'Total Contract Value', 1, 0)
    pdf.cell(0, 6, f"Rs. {total:,}", 1, 1)
    
    pdf.cell(60, 6, 'Delivery Date', 1, 0)
    pdf.cell(0, 6, str(data['delivery_date']), 1, 1)
    
    pdf.cell(60, 6, 'Farming Methods', 1, 0)
    pdf.cell(0, 6, ', '.join(data.get('farming_methods', ['Standard'])), 1, 1)
    
    pdf.cell(60, 6, 'Equipment Provided', 1, 0)
    pdf.cell(0, 6, str(data.get('equipment', 'None'))[:60] + ('...' if len(str(data.get('equipment', 'None'))) > 60 else ''), 1, 1)
    pdf.ln(4)
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 6, 'PAYMENT STRUCTURE:', 0, 1)
    pdf.set_font('Helvetica', '', 8)
    
    pdf.cell(32, 6, f"Advance: {data['advance_percent']}%", 1, 0, 'C')
    pdf.cell(32, 6, f"On Delivery: {data['delivery_percent']}%", 1, 0, 'C')
    pdf.cell(32, 6, f"Quality Check: {data['quality_percent']}%", 1, 0, 'C')
    pdf.cell(0, 6, f"Mode: {data.get('payment_mode', 'Bank Transfer')}", 1, 1, 'C')
    pdf.ln(4)
    
    pdf.set_font('Helvetica', 'B', 9)
    pdf.cell(95, 5, 'Producer Obligations:', 0, 0)
    pdf.cell(0, 5, 'Buyer Obligations:', 0, 1)
    pdf.set_font('Helvetica', '', 7)
    
    pdf.cell(95, 4, '- Cultivate as per agreed farming methods', 0, 0)
    pdf.cell(0, 4, '- Provide equipment/inputs in time', 0, 1)
    
    pdf.cell(95, 4, '- Maintain cultivation records', 0, 0)
    pdf.cell(0, 4, '- Make payments as per schedule', 0, 1)
    
    pdf.cell(95, 4, '- Deliver produce on agreed date', 0, 0)
    pdf.cell(0, 4, '- Accept quality produce', 0, 1)
    
    pdf.cell(95, 4, '- Ensure quality standards are met', 0, 0)
    pdf.cell(0, 4, '- Honor contract in good faith', 0, 1)
    pdf.ln(4)
    
    pdf.set_font('Helvetica', 'I', 7)
    pdf.cell(0, 4, 'Force Majeure: Neither party shall be liable for delays due to circumstances beyond their control including natural disasters, war, epidemics.', 0, 1)
    pdf.cell(0, 4, 'Dispute Resolution: Any dispute shall be resolved through mutual discussion within 30 days. Failing which, arbitration under Indian laws.', 0, 1)
    pdf.ln(6)
    
    pdf.set_font('Helvetica', 'B', 10)
    
    pdf.cell(95, 6, 'PRODUCER (Party A):', 0, 1)
    pdf.set_font('Helvetica', '', 9)
    pdf.cell(95, 5, f"Name: {data['farmer_name']}", 0, 1)
    pdf.cell(95, 5, f"Location: {data['farmer_location']}", 0, 1)
    pdf.ln(8)
    
    pdf.set_draw_color(0, 0, 0)
    pdf.set_line_width(0.3)
    pdf.line(10, pdf.get_y(), 90, pdf.get_y())
    pdf.cell(40, 5, 'Signature', 0, 0)
    pdf.cell(50, 5, 'Date: ____________', 0, 1, 'R')
    pdf.ln(10)
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(95, 6, 'BUYER (Party B):', 0, 1)
    pdf.set_font('Helvetica', '', 9)
    pdf.cell(95, 5, f"Company: {data['business_name']}", 0, 1)
    pdf.cell(95, 5, f"Contact Person: {data.get('business_contact', 'N/A')}", 0, 1)
    pdf.ln(8)
    
    pdf.line(10, pdf.get_y(), 90, pdf.get_y())
    pdf.cell(40, 5, 'Signature', 0, 0)
    pdf.cell(50, 5, 'Date: ____________', 0, 1, 'R')
    pdf.ln(10)
    
    pdf.set_font('Helvetica', '', 8)
    pdf.cell(95, 5, 'Witness 1: _________________________', 0, 0)
    pdf.cell(0, 5, 'Witness 2: _________________________', 0, 1)
    pdf.ln(8)
    
    pdf.set_font('Helvetica', 'I', 6)
    pdf.set_text_color(128, 128, 128)
    pdf.cell(0, 4, f"Generated on {datetime.datetime.now().strftime('%d-%m-%Y at %H:%M')} | Agriance - Agricultural Contract Platform", 0, 0, 'C')
    
    return pdf

class ContractGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Agriance Contract Generator")
        self.root.geometry("700x750")
        self.root.configure(bg='#f0f0f0')
        
        style = ttk.Style()
        style.configure('TLabel', font=('Arial', 10))
        style.configure('TEntry', font=('Arial', 10))
        
        header = Frame(root, bg='#1a472a', height=60)
        header.pack(fill=X)
        Label(header, text="Agriance Contract Generator", font=('Arial', 18, 'bold'), 
              bg='#1a472a', fg='white').pack(pady=15)
        
        canvas = Canvas(root, bg='#f0f0f0')
        scrollbar = Scrollbar(root, orient="vertical", command=canvas.yview)
        scrollable_frame = Frame(canvas, bg='#f0f0f0')
        
        scrollable_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True, padx=10, pady=10)
        scrollbar.pack(side="right", fill="y")
        
        def on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        canvas.bind_all("<MouseWheel>", on_mousewheel)
        
        self.frame = scrollable_frame
        
        self.create_section("Contract Details")
        self.contract_number = self.create_entry("Contract Number", f"CRT-{datetime.datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}")
        self.contract_date = self.create_entry("Contract Date", datetime.datetime.now().strftime('%d-%m-%Y'))
        self.crop_name = self.create_entry("Crop Name *", "")
        self.quantity = self.create_entry("Quantity (Quintals) *", "")
        self.price = self.create_entry("Price per Quintal (Rs.) *", "")
        self.delivery_date = self.create_entry("Delivery Date (DD-MM-YYYY) *", "")
        
        self.create_section("Farmer Details (Party A)")
        self.farmer_name = self.create_entry("Farmer Name *", "")
        self.farmer_location = self.create_entry("Location *", "")
        self.farmer_phone = self.create_entry("Phone Number", "")
        self.farmer_land = self.create_entry("Land Size (Hectares)", "")
        
        self.create_section("Business Details (Party B)")
        self.business_name = self.create_entry("Company/Business Name *", "")
        self.business_contact = self.create_entry("Contact Person *", "")
        self.business_gst = self.create_entry("GST Number", "")
        
        self.create_section("Farming Methods")
        self.methods_frame = Frame(self.frame, bg='#f0f0f0')
        self.methods_frame.pack(fill=X, padx=20, pady=5)
        
        self.method_vars = {}
        methods = ["Organic Farming", "Natural Farming", "Integrated Pest Management", 
                  "Crop Rotation", "Mulching", "Drip Irrigation", "Sprinkler System",
                  "Green Manure", "Vermicomposting"]
        
        row, col = 0, 0
        for method in methods:
            var = BooleanVar()
            self.method_vars[method] = var
            cb = Checkbutton(self.methods_frame, text=method, variable=var, bg='#f0f0f0', 
                           font=('Arial', 9), activebackground='#f0f0f0')
            cb.grid(row=row, column=col, sticky='w', padx=5, pady=2)
            col += 1
            if col > 2:
                col = 0
                row += 1
        
        self.create_section("Equipment Provided by Business")
        self.equipment = Text(self.frame, height=3, width=50, font=('Arial', 10))
        self.equipment.pack(fill=X, padx=20, pady=5)
        
        self.create_section("Payment Structure")
        payment_frame = Frame(self.frame, bg='#f0f0f0')
        payment_frame.pack(fill=X, padx=20, pady=5)
        
        self.advance = self.create_entry_in_frame(payment_frame, "Advance %", "30", 0, 0)
        self.delivery = self.create_entry_in_frame(payment_frame, "On Delivery %", "50", 0, 2)
        self.quality = self.create_entry_in_frame(payment_frame, "Quality Check %", "20", 1, 0)
        
        self.payment_mode = StringVar(value="Bank Transfer")
        pm_frame = LabelFrame(payment_frame, text="Payment Mode", bg='#f0f0f0', font=('Arial', 9, 'bold'))
        pm_frame.grid(row=1, column=2, padx=5, pady=5, sticky='w')
        for mode in ["Bank Transfer", "UPI", "Cheque", "Cash"]:
            Radiobutton(pm_frame, text=mode, variable=self.payment_mode, value=mode, 
                       bg='#f0f0f0', font=('Arial', 9)).pack(anchor='w', padx=10)
        
        btn_frame = Frame(self.frame, bg='#f0f0f0')
        btn_frame.pack(fill=X, padx=20, pady=20)
        
        Button(btn_frame, text="Generate Contract PDF", font=('Arial', 12, 'bold'),
              bg='#1a472a', fg='white', height=2, command=self.generate).pack(fill=X)
        
        Button(btn_frame, text="Clear Form", font=('Arial', 10),
              bg='#6c757d', fg='white', height=1, command=self.clear_form, pady=5).pack(fill=X)
    
    def create_section(self, title):
        Label(self.frame, text=title, font=('Arial', 12, 'bold'), bg='#1a472a', 
              fg='white', pady=5).pack(fill=X, padx=10, pady=(15, 5))
    
    def create_entry(self, label, default=""):
        Label(self.frame, text=label, bg='#f0f0f0', font=('Arial', 9)).pack(anchor='w', padx=20)
        entry = Entry(self.frame, font=('Arial', 10))
        entry.insert(0, default)
        entry.pack(fill=X, padx=20, pady=(0, 10))
        return entry
    
    def create_entry_in_frame(self, frame, label, default, row, col):
        Label(frame, text=label, bg='#f0f0f0', font=('Arial', 9)).grid(row=row*2, column=col, sticky='w', padx=5)
        entry = Entry(frame, font=('Arial', 10), width=15)
        entry.insert(0, default)
        entry.grid(row=row*2+1, column=col, padx=5, pady=(0, 10))
        return entry
    
    def generate(self):
        required = [
            (self.crop_name, "Crop Name"),
            (self.quantity, "Quantity"),
            (self.price, "Price"),
            (self.delivery_date, "Delivery Date"),
            (self.farmer_name, "Farmer Name"),
            (self.farmer_location, "Farmer Location"),
            (self.business_name, "Business Name"),
            (self.business_contact, "Contact Person")
        ]
        
        for field, name in required:
            if not field.get().strip():
                messagebox.showerror("Validation Error", f"Please enter {name}")
                field.focus()
                return
        
        methods = [m for m, v in self.method_vars.items() if v.get()]
        if not methods:
            methods = ["Standard Farming"]
        
        data = {
            'contract_number': self.contract_number.get(),
            'contract_date': self.contract_date.get(),
            'crop_name': self.crop_name.get(),
            'quantity': self.quantity.get(),
            'price': self.price.get(),
            'delivery_date': self.delivery_date.get(),
            'farmer_name': self.farmer_name.get(),
            'farmer_location': self.farmer_location.get(),
            'farmer_phone': self.farmer_phone.get(),
            'farmer_land_size': self.farmer_land.get(),
            'business_name': self.business_name.get(),
            'business_contact': self.business_contact.get(),
            'business_gst': self.business_gst.get(),
            'farming_methods': methods,
            'equipment': self.equipment.get("1.0", END).strip() or "No additional equipment provided.",
            'advance_percent': self.advance.get(),
            'delivery_percent': self.delivery.get(),
            'quality_percent': self.quality.get(),
            'payment_mode': self.payment_mode.get()
        }
        
        try:
            pdf = generate_contract(data)
            filename = f"Contract_{data['contract_number']}.pdf"
            pdf.output(filename)
            messagebox.showinfo("Success", f"Contract generated successfully!\n\nSaved as: {os.path.abspath(filename)}")
            if messagebox.askyesno("Open File", "Would you like to open the PDF?"):
                os.startfile(os.path.abspath(filename))
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate contract:\n{str(e)}")
    
    def clear_form(self):
        for entry in [self.crop_name, self.quantity, self.price, self.delivery_date,
                     self.farmer_name, self.farmer_location, self.farmer_phone, self.farmer_land,
                     self.business_name, self.business_contact, self.business_gst]:
            entry.delete(0, END)
        
        self.equipment.delete("1.0", END)
        
        for var in self.method_vars.values():
            var.set(False)
        
        self.advance.delete(0, END)
        self.advance.insert(0, "30")
        self.delivery.delete(0, END)
        self.delivery.insert(0, "50")
        self.quality.delete(0, END)
        self.quality.insert(0, "20")
        
        self.payment_mode.set("Bank Transfer")

if __name__ == "__main__":
    root = Tk()
    app = ContractGUI(root)
    root.mainloop()
