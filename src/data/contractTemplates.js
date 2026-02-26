export const contractTemplates = {
    en: {
        title: "AGRICULTURAL PRODUCE PURCHASE AGREEMENT",
        sections: {
            header: "Agreement No: {{contractId}}\nDate: {{contractDate}}",
            parties: "### 1. PARTIES\n\n**BUYER:** {{businessName}}, GSTIN: {{businessGst}}\n\n**SELLER:** {{farmerName}}, ID: {{farmerId}}00-XXXX-XXXX\n\nWHEREAS the Seller is engaged in agricultural production and the Buyer wishes to purchase the produce described herein under the terms of this digital agreement.",
            terms: "### 2. COMMERCIAL TERMS\n\n*   **Crop:** {{cropName}}\n*   **Estimated Quantity:** {{quantity}} {{unit}}\n*   **Agreed Price:** ₹{{price}} per {{unit}}\n*   **Total Estimated Value:** ₹{{totalValue}}\n*   **Advance Payment (25%):** ₹{{advanceAmount}}\n*   **Balance Amount:** ₹{{balanceAmount}}",
            delivery: "### 3. DELIVERY & LOGISTICS\n\n*   **Expected Delivery Date:** {{deliveryDate}}\n*   **Location:** Buyer's designated collection center or warehouse as notified 48 hours prior to delivery.\n*   **Transportation:** To be arranged and borne by the [Buyer/Seller as per platform terms].",
            quality: "### 4. QUALITY STANDARDS\n\nProduce must meet standard Grade-A requirements for {{cropName}}. The Buyer retains the right to inspect produce within 7 days of delivery. Sub-standard produce may be subject to price renegotiation or return at Seller's expense.",
            payment: "### 5. PAYMENT TERMS\n\nAdvance payment shall be released to the Seller's verified bank account within 24 hours of contract execution. Balance payment shall be settled within 15 days of successful quality verification post-delivery.",
            forceMajeure: "### 6. FORCE MAJEURE (PROTECTION)\n\nNeither party shall be liable for failure to perform due to unseasonal rain, floods, pests, or other natural disasters affecting crop yields, provided the affected party notifies the other via the FarmConnect platform within 72 hours of the event.",
            dispute: "### 7. DISPUTE RESOLUTION\n\nIn case of disagreements, parties first agree to mediation via FarmConnect support. Unresolved issues shall be escalated to the District Agricultural Officer, whose decision shall be binding.",
            organicCert: "### 8. ORGANIC CERTIFICATION\n\nThe Seller warrants that the produce has been grown using certified organic practices. All relevant certifications shall be provided to the Buyer upon request.",
            insurance: "### 9. CROP INSURANCE\n\nThe Seller declares that the crop is covered under insurance. In case of natural calamities, the Seller will initiate the insurance claim process and notify the Buyer immediately.",
            footer: "---\n*This is a digitally generated legal document. By signing, both parties agree to the terms herein and the FarmConnect Platform Terms of Service.*"
        }
    },
    hi: {
        title: "कृषि उत्पाद खरीद समझौता",
        sections: {
            header: "समझौता संख्या: {{contractId}}\nदिनांक: {{contractDate}}",
            parties: "### 1. पक्ष\n\n**खरीदार:** {{businessName}}, GSTIN: {{businessGst}}\n\n**विक्रेता:** {{farmerName}}, आईडी: {{farmerId}}00-XXXX-XXXX\n\nचूंकि विक्रेता कृषि उत्पादन में लगा हुआ है और खरीदार इस डिजिटल समझौते की शर्तों के तहत यहां वर्णित उपज खरीदना चाहता है।",
            terms: "### 2. व्यावसायिक शर्तें\n\n*   **फसल:** {{cropName}}\n*   **अनुमानित मात्रा:** {{quantity}} {{unit}}\n*   **सहमत मूल्य:** ₹{{price}} प्रति {{unit}}\n*   **कुल अनुमानित मूल्य:** ₹{{totalValue}}\n*   **अग्रिम भुगतान (25%):** ₹{{advanceAmount}}\n*   **शेष राशि:** ₹{{balanceAmount}}",
            delivery: "### 3. वितरण और रसद\n\n*   **अपेक्षित वितरण तिथि:** {{deliveryDate}}\n*   **स्थान:** खरीदार का नामित संग्रह केंद्र या गोदाम, जिसकी सूचना वितरण से 48 घंटे पहले दी जाएगी।\n*   **परिवहन:** प्लेटफ़ॉर्म की शर्तों के अनुसार [खरीदार/विक्रेता] द्वारा व्यवस्थित और वहन किया जाएगा।",
            quality: "### 4. गुणवत्ता मानक\n\nउपज को {{cropName}} के लिए मानक ग्रेड-ए आवश्यकताओं को पूरा करना चाहिए। खरीदार के पास डिलीवरी के 7 दिनों के भीतर उपज का निरीक्षण करने का अधिकार सुरक्षित है।",
            payment: "### 5. भुगतान की शर्तें\n\nअनुबंध निष्पादन के 24 घंटों के भीतर विक्रेता के सत्यापित बैंक खाते में अग्रिम भुगतान जारी किया जाएगा। शेष भुगतान वितरण के बाद सफल गुणवत्ता सत्यापन के 15 दिनों के भीतर किया जाएगा।",
            forceMajeure: "### 6. फोर्स मेज्योर (सुरक्षा)\n\nअसामयिक बारिश, बाढ़, कीटों या फसल की पैदावार को प्रभावित करने वाली अन्य प्राकृतिक आपदाओं के कारण विफल होने के लिए कोई भी पक्ष उत्तरदायी नहीं होगा, बशर्ते प्रभावित पक्ष घटना के 72 घंटों के भीतर फार्मकनेक्ट प्लेटफॉर्म के माध्यम से दूसरे को सूचित करे।",
            dispute: "### 7. विवाद समाधान\n\nअसहमतियों के मामले में, पक्ष पहले फार्मकनेक्ट समर्थन के माध्यम से मध्यस्थता के लिए सहमत होते हैं। अनसुलझे मुद्दों को जिला कृषि अधिकारी के पास भेजा जाएगा, जिनका निर्णय बाध्यकारी होगा।",
            organicCert: "### 8. जैविक प्रमाणन\n\nविक्रेता वारंट करता है कि उपज प्रमाणित जैविक प्रथाओं का उपयोग करके उगाई गई है। खरीदार के अनुरोध पर सभी प्रासंगिक प्रमाणपत्र प्रदान किए जाएंगे।",
            insurance: "### 9. फसल बीमा\n\nविक्रेता घोषणा करता है कि फसल बीमा के तहत कवर की गई है। प्राकृतिक आपदाओं के मामले में, विक्रेता बीमा दावा प्रक्रिया शुरू करेगा और खरीदार को तुरंत सूचित करेगा।",
            footer: "---\n*यह एक डिजिटल रूप से तैयार कानूनी दस्तावेज है। हस्ताक्षर करके, दोनों पक्ष यहां दी गई शर्तों और फार्मकनेक्ट प्लेटफॉर्म सेवा की शर्तों से सहमत होते हैं।*"
        }
    },
    mr: {
        title: "कृषी उत्पादन खरेदी करार",
        sections: {
            header: "करार क्रमांक: {{contractId}}\nदिनांक: {{contractDate}}",
            parties: "### 1. पक्ष\n\n**खरेदीदार:** {{businessName}}, GSTIN: {{businessGst}}\n\n**विक्रेता:** {{farmerName}}, आयडी: {{farmerId}}00-XXXX-XXXX\n\nज्याअर्थी विक्रेता कृषी उत्पादनात गुंतलेला आहे आणि खरेदीदाराला या डिजिटल कराराच्या अटींनुसार येथे वर्णन केलेले उत्पादन खरेदी करायचे आहे.",
            terms: "### 2. व्यावसायिक अटी\n\n*   **पीक:** {{cropName}}\n*   **अंदाजित प्रमाण:** {{quantity}} {{unit}}\n*   **ठरलेली किंमत:** ₹{{price}} प्रति {{unit}}\n*   **एकूण अंदाजित मूल्य:** ₹{{totalValue}}\n*   **आगाऊ रक्कम (25%):** ₹{{advanceAmount}}\n*   **उर्वरित रक्कम:** ₹{{balanceAmount}}",
            delivery: "### 3. डिलिव्हरी आणि लॉजिस्टिक\n\n*   **अपेक्षित डिलिव्हरी तारीख:** {{deliveryDate}}\n*   **ठिकाण:** खरेदीदाराचे नियुक्त संकलन केंद्र किंवा गोदाम, ज्याची सूचना डिलिव्हरीच्या 48 तास आधी दिली जाईल।\n*   **वाहतूक:** प्लॅटफॉर्मच्या अटींनुसार [खरेदीदार/विक्रेता] द्वारे आयोजित आणि सोसली जाईल।",
            quality: "### 4. गुणवत्ता मानके\n\nउत्पादन {{cropName}} साठी मानक ग्रेड-ए आवश्यकता पूर्ण करणे आवश्यक आहे. खरेदीदाराला डिलिव्हरीच्या 7 दिवसांच्या आत उत्पादनाची तपासणी करण्याचा अधिकार आहे।",
            payment: "### 5. पेमेंट अटी\n\nकरार अंमलात आल्यापासून 24 तासांच्या आत विक्रेत्याच्या सत्यापित बँक खात्यात आगाऊ पेमेंट जमा केले जाईल. डिलिव्हरीनंतर यशस्वी गुणवत्ता तपासणीच्या 15 दिवसांच्या आत उर्वरित पेमेंट केले जाईल।",
            forceMajeure: "### 6. फोर्स मेज्योर (संरक्षण)\n\nअवेळी पाऊस, पूर, कीड किंवा पिकाच्या उत्पन्नावर परिणाम करणाऱ्या इतर नैसर्गिक आपत्तींमुळे काम करण्यात अपयश आल्यास कोणताही पक्ष जबाबदार राहणार नाही, परंतु बाधित पक्षाने घटनेच्या 72 तासांच्या आत फार्मकनेक्ट प्लॅटफॉर्मद्वारे दुसऱ्या पक्षाला सूचित करणे आवश्यक आहे।",
            dispute: "### 7. विवाद समाधान\n\nमतभेदांच्या बाबतीत, दोन्ही पक्ष प्रथम फार्मकनेक्ट सपोर्टद्वारे मध्यस्थी करण्यास सहमत आहेत. न सुटलेले प्रश्न जिल्हा कृषी अधिकाऱ्याकडे पाठवले जातील, ज्यांचा निर्णय बंधनकारक असेल।",
            organicCert: "### 8. सेंद्रिय प्रमाणन\n\nविक्रेता हमी देतो की हे उत्पादन प्रमाणित सेंद्रिय पद्धतींचा वापर करून पिकवले गेले आहे. विनंती केल्यावर सर्व संबंधित प्रमाणपत्रे खरेदीदाराला प्रदान केली जातील।",
            insurance: "### 9. पीक विमा\n\nविक्रेता घोषित करतो की या पिकाचा विमा उतरवला गेला आहे. नैसर्गिक आपत्तीच्या बाबतीत, विक्रेता विमा दाव्याची प्रक्रिया सुरू करेल आणि खरेदीदाराला त्वरित सूचित करेल।",
            footer: "---\n*हे डिजिटलरीत्या तयार केलेले कायदेशीर दस्तऐवज आहे. स्वाक्षरी करून, दोन्ही पक्ष येथील अटी आणि फार्मकनेक्ट प्लॅटफॉर्म सेवा अटींशी सहमत आहेत.*"
        }
    }
};
