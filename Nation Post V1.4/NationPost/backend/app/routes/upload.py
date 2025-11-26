from flask import Blueprint, request, jsonify
import requests
import json
import os
import hashlib
import datetime
from dotenv import load_dotenv
import jwt
from app.blockchain_manager import BlockchainManager
from pymongo import MongoClient

# ---------------------------
# Load environment variables FIRST
# --------------------------- 
load_dotenv()
PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_API = os.getenv("PINATA_SECRET_API")
JWT_SECRET = os.getenv("JWT_SECRET")

# ---------------------------
# MongoDB Setup BEFORE Blueprint
# ---------------------------
mongo_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongo_uri)
db = client.authDB
users_collection = db.users

# ---------------------------
# Create Blueprint
# ---------------------------
upload_bp = Blueprint("upload", __name__, url_prefix="/upload")

PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"

headers = {
    "pinata_api_key": PINATA_API_KEY,
    "pinata_secret_api_key": PINATA_SECRET_API
}

# ---------------------------
# Blockchain instance
# ---------------------------
manager = BlockchainManager()

# ---------------------------
# Upload route
# ---------------------------
@upload_bp.route("/", methods=["POST"])
def upload_news():
    try:
        # DEBUG: Print all received form fields
        print("=== RECEIVED FORM DATA ===")
        for key in request.form.keys():
            print(f"{key}: {request.form.get(key)}")
        print("=== END FORM DATA ===")
        
        # Extract form fields
        title = request.form.get("title")
        category = request.form.get("category")
        source = request.form.get("source")
        
        # Accept both 'description' AND 'content' field names
        description = request.form.get("description") or request.form.get("content")
        
        # DEBUG: Print what we extracted
        print(f"Title: {title}")
        print(f"Category: {category}")
        print(f"Source: {source}")
        print(f"Description: {description}")
        print(f"Description length: {len(description or '')}")

        # Step 1: Upload files (if provided)
        file_hashes = []
        if "files" in request.files:
            uploaded_files = request.files.getlist("files")
            image_idx = 0
            video_idx = 0
            other_idx = 0
            base_title = (title or "Untitled").strip()
            for file in uploaded_files:
                content_type = getattr(file, 'content_type', '') or ''
                if content_type.startswith('image/'):
                    image_idx += 1
                    pin_label = f"{base_title} - image {image_idx}"
                elif content_type.startswith('video/'):
                    video_idx += 1
                    pin_label = f"{base_title} - video {video_idx}"
                else:
                    other_idx += 1
                    pin_label = f"{base_title} - file {other_idx}"

                files = {"file": (file.filename, file.stream, content_type)}
                data = {"pinataMetadata": json.dumps({"name": pin_label})}
                res = requests.post(PINATA_FILE_URL, files=files, data=data, headers=headers)

                if res.status_code in (200, 201):
                    ipfs_hash = res.json().get("IpfsHash")
                    file_hashes.append({
                        "filename": file.filename,
                        "ipfsHash": ipfs_hash,
                        "pin_name": pin_label
                    })
                else:
                    return jsonify({
                        "error": "File upload failed",
                        "details": res.text
                    }), 500

        # Step 2: Run verification
        verification = {
            "prediction": "UNKNOWN",
            "confidence": 0,
            "score": 5.0,
            "reason": "verification not performed",
            "sources": []
        }
        try:
            from app.routes.verify_news import fact_check_news
            verify_result, verify_sources = fact_check_news(title or "", description or "")

            try:
                raw_conf = float(verify_result.get("confidence", 0))
            except (TypeError, ValueError):
                raw_conf = 0.0
            confidence = max(0, min(100, int(round(raw_conf))))

            p = str(verify_result.get("prediction", "")).lower()
            if "real" in p:
                score_100 = confidence
            elif "fake" in p:
                score_100 = max(0, 100 - confidence)
            elif "no evidence" in p or "unknown" in p:
                score_100 = 0
            else:
                score_100 = confidence

            try:
                score_0_10 = round(float(score_100) / 10.0, 1)
            except Exception:
                score_0_10 = 5.0

            verification = {
                "prediction": verify_result.get("prediction"),
                "confidence": confidence,
                "score": score_0_10,
                "reason": verify_result.get("reason"),
                "sources": verify_sources
            }

        except Exception as e:
            verification["reason"] = str(e)

        # Determine uploader from JWT Authorization header
        uploaded_by = None
        try:
            auth = request.headers.get("Authorization", "")
            print(f"=== JWT AUTH DEBUG ===")
            print(f"Authorization header: {auth[:50] if auth else 'None'}...")
            
            if auth and auth.startswith("Bearer "):
                token = auth.split(None, 1)[1]
                try:
                    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                    print(f"Decoded JWT payload: {payload}")
                    
                    user_id = payload.get("userID")
                    user_name = payload.get("name")
                    
                    if user_id and user_name:
                        uploaded_by = {"userID": user_id, "name": user_name}
                        print(f"✓ Successfully extracted user from JWT: {uploaded_by}")
                    else:
                        print(f"⚠ JWT missing userID or name")
                        
                except jwt.ExpiredSignatureError:
                    print("⚠ JWT token expired")
                except jwt.InvalidTokenError as e:
                    print(f"⚠ Invalid JWT token: {e}")
                except Exception as e:
                    print(f"⚠ JWT decode error: {e}")

            # Fallback to form field if JWT didn't work
            if not uploaded_by:
                user_id = request.form.get("userID") or request.form.get("user_id")
                print(f"Fallback to form userID: {user_id}")
                
                if user_id:
                    user = users_collection.find_one({"userID": user_id}, {"_id": 0, "name": 1, "userID": 1})
                    if user:
                        uploaded_by = {"userID": user.get("userID"), "name": user.get("name")}
                        print(f"✓ Found user in DB: {uploaded_by}")
                    else:
                        print(f"⚠ User not found in DB for userID: {user_id}")
                        
        except Exception as e:
            print(f"ERROR extracting uploader: {e}")
            uploaded_by = None

        print(f"=== FINAL uploaded_by: {uploaded_by} ===")

        # Add publish timestamp
        published_at = datetime.datetime.utcnow().isoformat()

        metadata = {
            "title": title,
            "category": category,
            "source": source,
            "description": description,
            "files": file_hashes,
            "verification": verification,
            "uploaded_by": uploaded_by,
            "published_at": published_at
        }

        # Step 3: Upload metadata JSON to Pinata
        pin_name = (title or "Untitled").strip()
        pin_payload = {
            "pinataMetadata": {"name": pin_name},
            "pinataContent": metadata
        }

        res = requests.post(PINATA_JSON_URL, json=pin_payload, headers=headers)

        if res.status_code not in (200, 201):
            return jsonify({
                "error": "Metadata upload failed",
                "details": res.text
            }), 500

        metadata_hash = res.json().get("IpfsHash")
        ipfs_url = f"https://gateway.pinata.cloud/ipfs/{metadata_hash}"

        # Step 4: Add to Blockchain
        block_data = {
            "title": title,
            "category": category,
            "source": source,
            "metadata_hash": metadata_hash,
            "ipfs_url": ipfs_url,
            "content_hash": hashlib.sha256(metadata_hash.encode()).hexdigest(),
            "timestamp": str(datetime.datetime.utcnow())
        }

        block = manager.add_block(block_data)

        # Embed blockchain reference and repin
        try:
            block_hash = block.get("hash") if isinstance(block, dict) else None
            block_index = block.get("index") if isinstance(block, dict) else None
            if block_hash:
                metadata["block_hash"] = block_hash
            if block_index is not None:
                metadata["block_index"] = block_index

                repin_payload = {
                    "pinataMetadata": {"name": pin_name},
                    "pinataContent": metadata
                }
                rep = requests.post(PINATA_JSON_URL, json=repin_payload, headers=headers)
                if rep.status_code in (200, 201):
                    new_metadata_hash = rep.json().get("IpfsHash")
                    ipfs_url = f"https://gateway.pinata.cloud/ipfs/{new_metadata_hash}"

                    try:
                        old_cid = metadata_hash
                        metadata_hash = new_metadata_hash
                        unpin_url = f"https://api.pinata.cloud/pinning/unpin/{old_cid}"
                        unpin_res = requests.delete(unpin_url, headers=headers)
                    except Exception:
                        pass
        except Exception:
            pass

        # Step 5: Respond
        return jsonify({
            "message": "Article uploaded and added to blockchain successfully",
            "metadataHash": metadata_hash,
            "ipfs_url": ipfs_url,
            "block_index": block["index"],
            "block_hash": block["hash"],
            "files": file_hashes,
            "verification": verification,
            "uploaded_by": uploaded_by  # Include in response for debugging
        }), 201

    except Exception as e:
        print(f"ERROR in upload_news: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500