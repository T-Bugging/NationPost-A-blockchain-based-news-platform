from flask import Blueprint, jsonify, request
import requests
from app.blockchain_manager import BlockchainManager

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")
manager = BlockchainManager()


def _reload_chain():
    """Reload chain from disk so dashboard notices new blocks written by other modules."""
    try:
        manager.chain = manager._load_chain()
    except Exception:
        pass


def _map_metadata_to_card(metadata, fallback_block=None):
    title = metadata.get("title")
    uploader = metadata.get("uploaded_by") or {}
    user_id = uploader.get("userID") if isinstance(uploader, dict) else None

    desc = metadata.get("description") or ""
    words = [w for w in desc.split() if w]
    excerpt = " ".join(words[:20])
    if len(words) > 20:
        excerpt = excerpt + "..."

    files = metadata.get("files") or []
    expected_pin = f"{(title or '').strip()} - image 1"
    thumbnail = None
    for f in files:
        try:
            if f.get("pin_name") == expected_pin:
                thumbnail = f.get("ipfsHash")
                break
        except Exception:
            continue
    if not thumbnail and files:
        thumbnail = files[0].get("ipfsHash")

    reliability = None
    try:
        reliability = metadata.get("verification", {}).get("score")
    except Exception:
        reliability = None

    category = metadata.get("category")
    published_at = metadata.get("published_at") or (fallback_block or {}).get("timestamp")
    block_hash = metadata.get("block_hash") or (fallback_block or {}).get("hash")

    return {
        "id": user_id,
        "title": title,
        "excerpt": excerpt,
        "thumbnail": thumbnail,
        "reliability": reliability,
        "category": category,
        "publishedAt": published_at,
        "blockHash": block_hash,
        "metadata_hash": metadata.get("metadata_hash") or None
    }


def _map_block_to_card(block):
    """Create a minimal card from a blockchain block's data when metadata can't be fetched."""
    data = block.get("data") or {}
    title = data.get("title")
    ipfs_url = data.get("ipfs_url") or ""
    cid = data.get("metadata_hash")
    if not cid and isinstance(ipfs_url, str) and "/ipfs/" in ipfs_url:
        cid = ipfs_url.rsplit("/", 1)[-1]

    desc = data.get("description") or title or ""
    words = [w for w in str(desc).split() if w]
    excerpt = " ".join(words[:20])
    if len(words) > 20:
        excerpt = excerpt + "..."

    thumbnail = cid if cid else None

    return {
        "id": None,
        "title": title,
        "excerpt": excerpt,
        "thumbnail": thumbnail,
        "reliability": None,
        "category": data.get("category"),
        "publishedAt": data.get("timestamp"),
        "blockHash": block.get("hash"),
        "metadata_hash": cid
    }


@dashboard_bp.route("/latest", methods=["GET"])
def latest_article():
    # keep existing behavior: return a single latest mapped card
    try:
        # reload chain from disk so we see newly added blocks
        _reload_chain()
        chain = manager.chain or []
        chosen_block = None
        metadata_hash = None
        
        for block in reversed(chain):
            data = block.get("data", {}) if isinstance(block, dict) else {}
            if data.get("metadata_hash"):
                chosen_block = block
                metadata_hash = data.get("metadata_hash")
                break

        if not chosen_block or not metadata_hash:
            return jsonify({"error": "No articles found in blockchain"}), 404

        ipfs_url = chosen_block.get("data", {}).get("ipfs_url") or f"https://gateway.pinata.cloud/ipfs/{metadata_hash}"
        metadata = None
        
        # Try multiple gateways
        gateways = [
            ipfs_url,
            f"https://gateway.pinata.cloud/ipfs/{metadata_hash}",
            f"https://ipfs.io/ipfs/{metadata_hash}",
            f"https://dweb.link/ipfs/{metadata_hash}"
        ]
        
        for gateway_url in gateways:
            try:
                r = requests.get(gateway_url, timeout=15)
                if r.status_code == 200:
                    try:
                        metadata = r.json()
                        break
                    except Exception:
                        continue
            except Exception:
                continue

        if not metadata:
            # Fallback to block data
            return jsonify(_map_block_to_card(chosen_block)), 200

        card = _map_metadata_to_card(metadata, fallback_block=chosen_block)
        return jsonify(card), 200
    except Exception as e:
        print(f"ERROR in /latest: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/list", methods=["GET"])
def list_articles():
    """
    Return up to `limit` latest article cards by scanning the blockchain (newest-first),
    fetching each metadata JSON from IPFS, mapping to card fields, and returning an array.

    Query params:
      - limit (int): maximum number of articles to return (default 15)
    """
    try:
        try:
            limit = int(request.args.get("limit", 15))
        except Exception:
            limit = 15
        
        # DEBUG: Print received limit
        print(f"=== /list called with limit={limit} ===")

        # reload chain from disk so list reflects recent uploads
        _reload_chain()
        chain = manager.chain or []
        items = []
        
        # DEBUG: Print chain length
        print(f"Chain has {len(chain)} blocks")

        # iterate newest to oldest and collect up to limit
        for block in reversed(chain):
            if len(items) >= limit:
                break
            data = block.get("data", {}) if isinstance(block, dict) else {}
            cid = data.get("metadata_hash")
            if not cid:
                print(f"Skipping block at index {block.get('index')}: no metadata_hash found")
                continue
            
            ipfs_url = data.get("ipfs_url") or f"https://gateway.pinata.cloud/ipfs/{cid}"
            metadata = None
            
            # Try multiple gateways with increased timeout
            gateways = [
                ipfs_url,
                f"https://gateway.pinata.cloud/ipfs/{cid}",
                f"https://ipfs.io/ipfs/{cid}",
                f"https://dweb.link/ipfs/{cid}"
            ]
            
            for gateway_url in gateways:
                try:
                    print(f"Attempting to fetch from: {gateway_url}")
                    r = requests.get(gateway_url, timeout=15)
                    if r.status_code == 200:
                        try:
                            metadata = r.json()
                            print(f"✓ Successfully fetched metadata from {gateway_url}")
                            break
                        except Exception as json_err:
                            print(f"✗ Failed to parse JSON from {gateway_url}: {json_err}")
                            continue
                    else:
                        print(f"✗ Gateway {gateway_url} returned status {r.status_code}")
                except requests.Timeout:
                    print(f"✗ Timeout fetching from {gateway_url}")
                    continue
                except requests.RequestException as req_err:
                    print(f"✗ Request error from {gateway_url}: {req_err}")
                    continue
                except Exception as err:
                    print(f"✗ Unexpected error from {gateway_url}: {err}")
                    continue
            
            # Use fallback card if metadata fetch failed
            if isinstance(metadata, dict):
                # attach metadata hash if not present
                metadata.setdefault("metadata_hash", cid)
                card = _map_metadata_to_card(metadata, fallback_block=block)
                # include CID explicitly for frontend
                card["metadata_hash"] = cid
                items.append(card)
                print(f"Added card from metadata: {card.get('title')}")
            else:
                # Fallback: create minimal card from block data
                print(f"Metadata fetch failed for CID {cid}. Using fallback card from block data.")
                card = _map_block_to_card(block)
                items.append(card)
                print(f"Added fallback card: {card.get('title')}")

        print(f"Returning {len(items)} items out of {len(chain)} blocks")
        return jsonify({"count": len(items), "items": items}), 200

    except Exception as e:
        print(f"ERROR in /list: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/article/<cid>", methods=["GET"])
def get_article_by_cid(cid):
    """
    Fetch the raw metadata JSON for a given metadata CID from IPFS and return it.
    If fetching fails, return 502.
    """
    try:
        # try known ipfs gateways
        try_urls = [
            f"https://gateway.pinata.cloud/ipfs/{cid}",
            f"https://ipfs.io/ipfs/{cid}",
            f"https://dweb.link/ipfs/{cid}"
        ]
        metadata = None
        for url in try_urls:
            try:
                print(f"Fetching article metadata from: {url}")
                r = requests.get(url, timeout=15)
                if r.status_code == 200:
                    try:
                        metadata = r.json()
                        print(f"✓ Successfully fetched from {url}")
                        break
                    except Exception as json_err:
                        print(f"✗ JSON parse error from {url}: {json_err}")
                        continue
                else:
                    print(f"✗ Status {r.status_code} from {url}")
            except requests.Timeout:
                print(f"✗ Timeout from {url}")
                continue
            except Exception as err:
                print(f"✗ Error from {url}: {err}")
                continue

        if metadata is None:
            print(f"Failed to fetch metadata for CID: {cid}")
            return jsonify({"error": "Unable to fetch metadata from IPFS for provided CID"}), 502

        return jsonify(metadata), 200
    except Exception as e:
        print(f"ERROR in /article/{cid}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/all", methods=["GET"])
def all_articles():
    """
    Return cards for all article blocks found in the blockchain (newest-first).
    This forces a chain reload and builds either a rich card (if metadata fetch succeeds)
    or a minimal fallback card from the block data.
    """
    try:
        _reload_chain()
        chain = manager.chain or []
        items = []
        
        print(f"=== /all endpoint called: {len(chain)} total blocks ===")
        
        for block in reversed(chain):
            data = block.get("data") or {}
            cid = data.get("metadata_hash")
            if not cid:
                print(f"Skipping block at index {block.get('index')}: no metadata_hash")
                continue
            
            ipfs_url = data.get("ipfs_url") or f"https://gateway.pinata.cloud/ipfs/{cid}"
            metadata = None
            
            # Try multiple gateways with longer timeout
            gateways = [
                ipfs_url,
                f"https://gateway.pinata.cloud/ipfs/{cid}",
                f"https://ipfs.io/ipfs/{cid}",
                f"https://dweb.link/ipfs/{cid}"
            ]
            
            for gateway_url in gateways:
                try:
                    r = requests.get(gateway_url, timeout=15)
                    if r.status_code == 200:
                        try:
                            metadata = r.json()
                            break
                        except Exception:
                            continue
                except Exception:
                    continue

            if isinstance(metadata, dict):
                metadata.setdefault("metadata_hash", cid)
                card = _map_metadata_to_card(metadata, fallback_block=block)
                card["metadata_hash"] = cid
                items.append(card)
                print(f"✓ Added rich card: {card.get('title')}")
            else:
                card = _map_block_to_card(block)
                items.append(card)
                print(f"✓ Added fallback card for CID {cid}")

        print(f"Returning {len(items)} cards")
        return jsonify({"count": len(items), "items": items}), 200
    except Exception as e:
        print(f"ERROR in /all: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
