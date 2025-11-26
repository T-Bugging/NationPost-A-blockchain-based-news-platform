from flask import Blueprint, jsonify, request
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import bcrypt
import uuid

# Create Blueprint
signup_bp = Blueprint("signup", __name__, url_prefix="/signup")

# Load environment variables
load_dotenv()
mongo_uri = os.getenv("MONGODB_URI")

# MongoDB setup
client = MongoClient(mongo_uri)
db = client.authDB
users_collection = db.users

# Signup route
@signup_bp.route("/", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    name = data.get("name")
    password = data.get("password").encode("utf-8")

    # Check if user exists
    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 409

    # Hash password
    hashed_pw = bcrypt.hashpw(password, bcrypt.gensalt())

    # Create new user
    users_collection.insert_one({
        "name": name,
        "userID": str(uuid.uuid4()),
        "email": email,
        "password": hashed_pw,
        "articles": 0,
        "verifications": 0,
        "saved": [],
        "trust_score": 0.0
    })

    return jsonify({"message": "Signup successful"}), 201
