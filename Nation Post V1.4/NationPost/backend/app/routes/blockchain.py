from flask import Blueprint, jsonify, request
from app.blockchain_manager import BlockchainManager

blockchain_bp = Blueprint("blockchain", __name__, url_prefix="/blockchain")
manager = BlockchainManager()


def _reload_chain():
    """Reload chain from on-disk file so separate manager instances stay in sync."""
    try:
        manager.chain = manager._load_chain()
    except Exception:
        # If loading fails, keep current in-memory chain
        pass

@blockchain_bp.route("/mine", methods=["POST"])
def mine():
    data = request.json
    block = manager.add_block(data)
    return jsonify({"message": "Block mined", "block": block}), 201

@blockchain_bp.route("/chain", methods=["GET"])
def chain():
    # ensure we reflect any blocks added by other instances (e.g. upload)
    _reload_chain()
    return jsonify(manager.chain), 200

@blockchain_bp.route("/validate", methods=["GET"])
def validate():
    # validate against the latest on-disk chain
    _reload_chain()
    valid = manager.is_chain_valid()
    return jsonify({"valid": valid}), 200

from flask import Blueprint, jsonify
from app.blockchain_manager import BlockchainManager

# Blueprint
# Duplicate blueprint section continued below — keep behavior consistent by reloading

# ✅ Get full blockchain (duplicate section kept for compatibility)
@blockchain_bp.route("/chain", methods=["GET"])
def get_chain():
    _reload_chain()
    return jsonify(manager.chain), 200

# ✅ Verify a block hash
@blockchain_bp.route("/verify/<block_hash>", methods=["GET"])
def verify_block(block_hash):
    """
    Check if a given block hash exists in the blockchain.
    """
    # reload to ensure latest blocks are checked
    _reload_chain()
    chain = manager.chain

    # Search for a block with the given hash
    for block in chain:
        if block.get("hash") == block_hash:
            return jsonify({
                "verified": True,
                "message": "Block found in blockchain.",
                "block_index": block.get("index"),
                "block_data": block.get("data"),
                "timestamp": block.get("timestamp")
            }), 200

    # If no match found
    return jsonify({
        "verified": False,
        "message": "No block found with the given hash."
    }), 404

