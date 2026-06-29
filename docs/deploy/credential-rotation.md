# Credential rotation note

Any credential pasted into chat, shell commands, logs, issue text, or pull request text must be treated as compromised.

Before production deploy:

1. Revoke the exposed token.
2. Create a replacement token with least privilege.
3. Store the replacement only as a managed secret.
4. Run the repo secret scanner.
5. Confirm no secret values are printed.

Do not deploy until rotation is confirmed.
