from flask import Blueprint, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Create Blueprint
user_profile_bp = Blueprint("user_profile", __name__)

# Load environment variables
load_dotenv()
mongo_uri = os.getenv("MONGODB_URI")

# MongoDB setup
client = MongoClient(mongo_uri)
db = client.authDB
users_collection = db.users

# Route for fetching user profile
@user_profile_bp.route('/profile/<userID>', methods=['GET'])
def get_user_info(userID):
    user = users_collection.find_one({"userID": userID}, {"_id": 0, "password": 0})
    if user:
        return jsonify(user), 200
    return jsonify({"message": "User not found"}), 404
