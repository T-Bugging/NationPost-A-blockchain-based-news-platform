from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import bcrypt
app = Flask(__name__)
CORS(app)

load_dotenv()
mongo_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongo_uri)
db = client.authDB             #
users_collection = db.users
@app.route('/auth', methods=['POST'])
def auth():
    data = request.json
    action = data.get('action')
    username = data.get('username')
    password = data.get('password').encode('utf-8')

    if action == 'login':
        user = users_collection.find_one({"username": username})
        if not user:
            return jsonify({"message": "Invalid credentials"}), 401

        stored_hash = user.get("password")
    # ensure stored_hash is bytes
        if isinstance(stored_hash, str):
            stored_hash = stored_hash.encode('utf-8')

    # stored_hash could also be BSON binary, which is fine for bcrypt
        if bcrypt.checkpw(password, stored_hash):
            return jsonify({"message": "Login successful"}), 200

        return jsonify({"message": "Invalid credentials"}), 401


    elif action == 'signup':
        if users_collection.find_one({"username": username}):
            return jsonify({"message": "User already exists"}), 409

        hashed_pw = bcrypt.hashpw(password, bcrypt.gensalt())
        users_collection.insert_one({
            "username": username,
            "password": hashed_pw
        })
        return jsonify({"message": "Signup successful"}), 201


if __name__ == "__main__":
    app.run(debug=True)