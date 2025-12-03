# **NationPost — A Blockchain-Based News Platform**

A blockchain-backed news publishing and verification system built for integrity, transparency, and tamper-proof article management. The platform uses a custom local blockchain implemented in JSON, Flask-based backend APIs, a React + TypeScript frontend, and an AI-powered verification model to analyze the authenticity of news articles and links.

---

## **Overview**

NationPost ensures that every news article is securely stored as a block in a local blockchain, preventing silent tampering or manipulation. Alongside blockchain integrity, the system integrates an AI-driven verification module that evaluates news credibility using Google’s RSS news engine and Gemini API. This combination provides strong protection against misinformation while maintaining full transparency.

---

## **Key Features**

### **Immutable Article Storage**
- Every article is stored as a block in a JSON-based blockchain  
- Contains timestamp, hash, and previous hash for integrity  
- Tampering instantly invalidates hash relationships  

### **Local Blockchain Implementation**
- Fully custom and lightweight  
- No dependency on Ethereum or external blockchain networks  
- Complete control over data structure and flow  

### **User Management**
- MongoDB used to store user accounts and metadata  
- Supports authentication and controlled access  

### **Decentralized External Storage**
- Pinata IPFS used to store media or extended article data  
- Ensures distributed content availability and tamper resistance  

### **AI Verification Model**
- Accepts either raw article text or URL links  
- Uses Google’s RSS News Engine to fetch related articles for cross-checking  
- Uses Gemini API to evaluate credibility, consistency, and likelihood of misinformation  
- Provides a verification score or classification to help users judge reliability  

### **Frontend–Backend Integration**
- Flask REST API serves all blockchain, AI, and user operations  
- React + TypeScript frontend offers a clean and responsive interface  
- Smooth request–response cycle across all modules  

---

## **Tech Stack**

### **Backend**
- Flask (Python)
- Custom JSON blockchain
- MongoDB for user data
- Pinata IPFS for external storage
- Gemini API for AI verification
- Google RSS feed API for news comparisons
- SHA-256 hashing

### **Frontend**
- React
- TypeScript (TSX components)

---

## **How the Blockchain Works**

1. User submits an article from the frontend.  
2. Flask backend generates a block containing:  
   - Article data  
   - Timestamp  
   - Previous block hash  
   - Newly computed hash  
3. Block is appended to the local JSON chain.  
4. Any alteration breaks hash linkage and is detected instantly.  
5. Verification tools flag inconsistencies when hashes don’t match.

---

## **How AI Verification Works**

1. User inputs either an article or a news URL.  
2. System fetches related articles using Google’s RSS engine.  
3. Gemini API evaluates:  
   - Consistency across multiple sources  
   - News reliability patterns  
   - Suspicious claims or anomalies  
4. Output is provided as a credibility judgment or score.  
5. Users can compare the AI evaluation with blockchain-stored data.

---

## **Running the Project**

### **Backend (Flask)**
```bash
cd backend
pip install -r requirements.txt
python app.py
 ```

## **Academic Purpose**

This project demonstrates:

- Blockchain fundamentals  
- AI-driven misinformation verification  
- Data integrity techniques  
- Decentralized storage economics  
- Full-stack system design with Flask and React  

---
## **Research Paper** 
**Link** - https://ijsrem.com/download/blockchain-based-news-platform-with-integrated-agentic-ai-for-news-verification/

## **Developer**

**Uday Pandey(T-Bugging)**  
**Sanskar Pandey** 
**Aniket Thakur** 
**Yash Kanhere** 
**Nishant Parashar** 
**Vrundita Jamkar** 
GitHub: https://github.com/T-Bugging

---

## **License**

This project is intended for academic and research use. Modification and extension are permitted.
