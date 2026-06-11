import os
import subprocess

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running {cmd}: {result.stderr}")
    else:
        print(result.stdout)

token = os.environ.get('GITHUB_API_TOKEN')
if not token:
    print("GITHUB_API_TOKEN is not set.")
    exit(1)

branch_name = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD']).decode('utf-8').strip()

remote_url = f"https://x-access-token:{token}@github.com/Sovereign-os/sovereign-os.git"
subprocess.run(['git', 'remote', 'set-url', 'origin', remote_url])
run_cmd(f'git push -u origin {branch_name}')
