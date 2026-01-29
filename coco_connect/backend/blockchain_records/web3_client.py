import os
import json
from web3 import Web3
from django.conf import settings

import json, hashlib
from datetime import datetime, timezone

RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
LOCAL_PRIVATE_KEY = os.getenv("LOCAL_PRIVATE_KEY")

ABI_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../blockchain/artifacts/contracts/ProductRegistry.sol/ProductRegistry.json"
    )
)


def _get_w3() -> Web3:
    """Create Web3 client lazily (no crash on import)."""
    return Web3(Web3.HTTPProvider(RPC_URL))

def _get_contract():
    """Create contract lazily (no crash on import)."""
    w3 = _get_w3()
    if not w3.is_connected():
        # Don't raise at import time. Raise only when function actually used.
        raise RuntimeError(f"Web3 not connected to RPC_URL={RPC_URL}. Is hardhat node running?")
    if not CONTRACT_ADDRESS:
        raise RuntimeError("CONTRACT_ADDRESS missing in env (.env.local).")

    with open(ABI_PATH, "r", encoding="utf-8") as f:
        abi = json.load(f)["abi"]

    return w3, w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=abi
    )

def get_proof_count(product_id: int) -> int:
    w3, contract = _get_contract()
    return contract.functions.proofCount(int(product_id)).call()

def record_proof(product_id: int, product_hash_hex: str) -> str:
    w3, contract = _get_contract()
    if not LOCAL_PRIVATE_KEY:
        raise RuntimeError("LOCAL_PRIVATE_KEY missing in env (.env.local).")

    acct = w3.eth.account.from_key(LOCAL_PRIVATE_KEY)

    tx = contract.functions.recordProductProof(
        int(product_id),
        Web3.to_bytes(hexstr=product_hash_hex)
    ).build_transaction({
        "from": acct.address,
        "nonce": w3.eth.get_transaction_count(acct.address),
        "gas": 300000,
        "gasPrice": w3.eth.gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, LOCAL_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    return tx_hash.hex()




def now_utc():
    return datetime.now(timezone.utc)

def make_product_hash(product) -> str:
    """
    Deterministic hash from key product fields.
    Works with your Django Product model instance.
    """
    payload = {
        "id": getattr(product, "id", None),
        "name": getattr(product, "name", ""),
        "price": str(getattr(product, "price", "")),
        "category": str(getattr(product, "category", "")),
        "type": str(getattr(product, "type", getattr(product, "product_type", ""))),
        "author": str(getattr(product, "author", "")),
        "image": str(getattr(product, "image", "")),
        "updated_at": getattr(product, "updated_at", None).isoformat() if getattr(product, "updated_at", None) else "",
    }

    raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return "0x" + hashlib.sha256(raw).hexdigest()
