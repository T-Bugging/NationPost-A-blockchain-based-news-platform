import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv

# Create Blueprint — add a URL prefix (recommended)
login_bp = Blueprint("login", __name__, url_prefix="/login")



# Load environment variables
load_dotenv()
mongo_uri = os.getenv("MONGODB_URI")

# MongoDB setup
client = MongoClient(mongo_uri)
db = client.authDB
users_collection = db.users

# Login route
@login_bp.route("", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    data = request.json
    email = data.get("email")
    password = data.get("password").encode("utf-8")

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    stored_hash = user.get("password")
    if isinstance(stored_hash, str):
        stored_hash = stored_hash.encode("utf-8")

    if bcrypt.checkpw(password, stored_hash):
        # Issue JWT containing userID and name
        load_dotenv()
        JWT_SECRET = os.getenv("JWT_SECRET")
        token_payload = {
            "userID": user.get("userID"),
            "name": user.get("name"),
            "exp": datetime.utcnow() + timedelta(hours=8)
        }
        token = jwt.encode(token_payload, JWT_SECRET, algorithm="HS256")
        return jsonify({"message": "Login successful", "token": token, "name": user.get("name")}), 200

    return jsonify({"message": "Invalid credentials"}), 401
