import hashlib, json, time, os

class BlockchainManager:
    def __init__(self, file_path="data/blockchain.json"):
        self.file_path = file_path
        if not os.path.exists("data"):
            os.makedirs("data")
        if not os.path.exists(file_path):
            self.chain = [self.create_genesis_block()]
            self._save_chain()
        else:
            self.chain = self._load_chain()

    def create_genesis_block(self):
        return {
            "index": 1,
            "timestamp": time.time(),
            "data": {"message": "Genesis Block"},
            "previous_hash": "0",
            "hash": self.hash_block({
                "index": 1,
                "timestamp": time.time(),
                "data": {"message": "Genesis Block"},
                "previous_hash": "0"
            }),
            "proof": 1
        }

    def hash_block(self, block):
        encoded = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(encoded).hexdigest()

    def _save_chain(self):
        with open(self.file_path, "w") as f:
            json.dump(self.chain, f, indent=2)

    def _load_chain(self):
        with open(self.file_path, "r") as f:
            return json.load(f)

    def add_block(self, data):
        prev_block = self.chain[-1]
        proof = self.proof_of_work(prev_block["proof"])
        block = {
            "index": len(self.chain) + 1,
            "timestamp": time.time(),
            "data": data,
            "previous_hash": prev_block["hash"],
            "proof": proof
        }
        block["hash"] = self.hash_block(block)
        self.chain.append(block)
        self._save_chain()
        return block

    def proof_of_work(self, previous_proof):
        new_proof = 1
        while True:
            guess = f'{new_proof ** 2 - previous_proof ** 2}'.encode()
            guess_hash = hashlib.sha256(guess).hexdigest()
            if guess_hash[:4] == "0000":
                return new_proof
            new_proof += 1

    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i-1]
            if curr["previous_hash"] != self.hash_block(prev):
                return False
        return True
