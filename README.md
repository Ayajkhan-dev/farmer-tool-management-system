# farmer-tool-management-system
# 🚜 किसान टूल प्रबंधक | Farmer Tool Manager

एक Progressive Web App (PWA) जो किसानों को कृषि उपकरणों के किराए का प्रबंधन करने में मदद करता है।  
A Progressive Web App (PWA) to help farmers manage agricultural equipment rentals.

---

## 📱 विशेषताएं | Features

### हिंदी
- ⏱️ **टाइमर**: टूल चलने का समय ट्रैक करें
- 💰 **स्वचालित गणना**: प्रति घंटा दर के आधार पर लागत की गणना
- 📊 **इतिहास**: सभी काम का रिकॉर्ड रखें
- 📝 **उधार/खाता बही**: ग्राहकों का उधार ट्रैक करें
- 💾 **SQLite डेटाबेस**: स्थानीय डेटा स्टोरेज
- 📤 **JSON एक्सपोर्ट/इम्पोर्ट**: बैकअप और रिस्टोर
- 📱 **व्हाट्सऐप शेयर**: बिल सीधे व्हाट्सऐप पर भेजें

### English
- ⏱️ **Timer**: Track equipment running time
- 💰 **Auto Calculation**: Cost calculation based on hourly rates
- 📊 **History**: Keep records of all work
- 📝 **Loan/Ledger**: Track customer loans
- 💾 **SQLite Database**: Local data storage
- 📤 **JSON Export/Import**: Backup and restore
- 📱 **WhatsApp Share**: Send bills directly via WhatsApp

---

## 🛠️ तकनीकी विवरण | Technical Details

| तकनीक | विवरण |
|--------|--------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Database | SQLite (via SQL.js) |
| Persistence | IndexedDB |
| Export Format | JSON |
| Styling | CSS Variables, Flexbox, Grid |

---

## 📁 फाइल संरचना | File Structure
kisan-tool-manager/
├── index.html          # मुख्य HTML फाइल
├── style.css           # स्टाइलशीट
├── script.js           # जावास्क्रिप्ट लॉजिक
├── images/             # टूल इमेजेस
│   ├── cultivator.png
│   ├── rotavator.png
│   ├── leveler.png
│   └── trolley.png
└── README.md           # यह फाइल
plain
Copy

---

## 🚀 इंस्टॉलेशन | Installation

### स्थानीय उपयोग | Local Usage

1. **डाउनलोड करें** सभी फाइल्स को एक फोल्डर में
2. **index.html** को ब्राउज़र में खोलें
3. **तैयार!** कोई सर्वर या इंस्टॉलेशन नहीं चाहिए

### वेब सर्वर पर | On Web Server

```bash
# किसी भी स्थैतिक सर्वर का उपयोग करें
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
📖 उपयोग गाइड | Usage Guide
1. रेट सेट करें | Set Rates
plain
Copy
मेनू → रेट सेट करें → प्रत्येक टूल की दर दर्ज करें → सेव करें
2. टूल चलाएं | Run Tool
plain
Copy
डैशबोर्ड → टूल चुनें → स्टार्ट → काम पूरा होने पर स्टॉप
3. बिल शेयर करें | Share Bill
plain
Copy
स्टॉप → व्हाट्सऐप पर बिल भेजें → ग्राहक को भेजें
4. बैकअप लें | Take Backup
plain
Copy
मेनू → JSON एक्सपोर्ट → फाइल सेव करें
5. रिस्टोर करें | Restore
plain
Copy
मेनू → JSON इम्पोर्ट → बैकअप फाइल चुनें
📤 JSON बैकअप फॉर्मेट | JSON Backup Format
JSON
Copy
{
  "exportDate": "2026-03-30T13:22:00.000Z",
  "version": "1.0",
  "rates": {
    "Cultivator": 500,
    "Rotavator": 600,
    "Leveler": 400,
    "Sprayer": 350,
    "Trolley": 300
  },
  "history": [
    {
      "id": "1711801200000",
      "tool": "Cultivator",
      "toolHindi": "कल्टिवेटर",
      "minutes": 120,
      "cost": 1000,
      "ratePerHour": 500,
      "date": "2026-03-28T08:30:00.000Z",
      "timestamp": 1711801200000
    }
  ],
  "udhaar": [
    {
      "id": "1711804800000",
      "name": "राम प्रसाद",
      "mobile": "9876543210",
      "amount": 2000,
      "date": "2026-03-28",
      "timestamp": 1711804800000
    }
  ]
}
🔧 डेटाबेस स्कीमा | Database Schema
rates टेबल
Table
Column	Type	Description
tool	TEXT PRIMARY KEY	टूल का नाम
rate	INTEGER	प्रति घंटा दर
history टेबल
Table
Column	Type	Description
id	TEXT PRIMARY KEY	यूनिक ID
tool	TEXT	टूल का नाम (English)
toolHindi	TEXT	टूल का नाम (Hindi)
minutes	INTEGER	कुल मिनट
cost	INTEGER	कुल लागत
ratePerHour	INTEGER	प्रति घंटा दर
date	TEXT	ISO date
timestamp	INTEGER	Unix timestamp
udhaar टेबल
Table
Column	Type	Description
id	TEXT PRIMARY KEY	यूनिक ID
name	TEXT	ग्राहक का नाम
mobile	TEXT	मोबाइल नंबर
amount	INTEGER	राशि
date	TEXT	तारीख
timestamp	INTEGER	Unix timestamp
🐛 डिबगिंग | Debugging
ब्राउज़र कंसोल में | In Browser Console
JavaScript
Copy
// वर्तमान स्थिति देखें
ftmDebug.state

// डेटाबेस एक्सेस
ftmDebug.db()

// मैन्युअल एक्सपोर्ट
ftmDebug.export()

// सारा डेटा हटाएं
ftmDebug.clear()
⚠️ सावधानियां | Precautions
ब्राउज़र डेटा साफ न करें - इससे SQLite डेटाबेस डिलीट हो जाएगा
नियमित बैकअप लें - JSON एक्सपोर्ट करके सुरक्षित रखें
एक ब्राउज़र में इस्तेमाल करें - IndexedDB ब्राउज़र-स्पेसिफिक है
निजी मोड में न चलाएं - निजी मोड में डेटा सेव नहीं होगा
🔮 भविष्य के अपडेट | Future Updates
[ ] मल्टीपल यूजर सपोर्ट
[ ] क्लाउड सिंक (Google Drive/Dropbox)
[ ] रिपोर्ट्स और चार्ट्स
[ ] प्रिंटेबल बिल
[ ] वॉयस कमांड
[ ] डार्क मोड
📞 सहायता | Support
कोई समस्या या सुझाव के लिए:
📧 Email: aimlayaj@gmail.com
📱 WhatsApp: +91-XXXXXXXXXX
📄 लाइसेंस | License
MIT License - स्वतंत्र रूप से उपयोग करें, संशोधित करें और वितरित करें।
🙏 धन्यवाद | Thanks
इस ऐप का उपयोग करने के लिए धन्यवाद!
Thank you for using this app!
Made with ❤️ for Indian Farmers
