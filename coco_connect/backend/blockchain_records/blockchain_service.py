import subprocess
import os

def record_investment_on_chain(investment_id: int, amount: int) -> str:
    # backend/ folder
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # coco_connect/blockchain folder
    blockchain_dir = os.path.abspath(os.path.join(backend_dir, "..", "blockchain"))

    # IMPORTANT: use relative script path for hardhat
    cmd = [
        "npx.cmd",
        "hardhat",
        "run",
        "scripts/call.js",
        "--network",
        "localhost",
    ]


    result = subprocess.run(
        cmd,
        cwd=blockchain_dir,
        capture_output=True,
        text=True,
        env={**os.environ, "INVESTMENT_ID": str(investment_id), "AMOUNT": str(amount)}
    )


    combined_output = (result.stdout or "") + "\n" + (result.stderr or "")

    if result.returncode != 0:
        raise Exception(f"Hardhat failed:\n{combined_output}")

    # Find any 0x... (tx hashes start with 0x)
    for line in combined_output.splitlines():
        if "0x" in line:
            # pick the first token that starts with 0x
            for token in line.replace(",", " ").split():
                if token.startswith("0x") and len(token) >= 10:
                    return token.strip()

    raise Exception(f"txHash not found. Output was:\n{combined_output}")
