# Auto Push Documentation

## Overview
This document describes the automated code backup system implemented for the `d99` repository.

## Configuration
- **Script Location**: `/var/www/html/d99/diamond99/auto_push.sh`
- **Log Directory**: `/var/www/html/d99/diamond99/auto_push_log/`
- **Log File**: `/var/www/html/d99/diamond99/auto_push_log/auto_push.log`
- **Git Remote**: Using HTTPS with Personal Access Token for authentication.

## Identity
Automated commits are attributed to:
- **Name**: `pallokesh495 [auto save]`
- **Email**: `pallokesh495@gmail.com`

## Schedule
The script is intended to be run via cron.
- **Example Cron Entry**: `30 0 * * * /var/www/html/d99/diamond99/auto_push.sh`
- **Server Timezone**: Ensure the cron schedule aligns with your desired timezone (e.g., IST).

## Logging & Maintenance
The script maintains a detailed log of all execution attempts.
- **Success**: Logs `[TIMESTAMP] SUCCESS: Changes pushed successfully.`
- **Error**: Logs `[TIMESTAMP] ERROR: ...` along with git error output.
- **No Change**: Logs `[TIMESTAMP] INFO: No changes to commit.` if the working directory is clean.

### Log Rotation
To prevent the log file from growing indefinitely, the script includes automatic log rotation:
- **Threshold**: If `auto_push.log` exceeds **5MB**, it is rotated.
- **Rotation Format**: Old logs are renamed to `auto_push_YYYYMMDD_HHMMSS.log`.
- **Retention**: Only the **5 most recent** rotated log files are kept. Older logs are automatically deleted.

## Troubleshooting
### Manual Execution
You can manually trigger the backup at any time by running:
```bash
/var/www/html/d99/diamond99/auto_push.sh
```

### Checking Logs
To view the latest execution logs:
```bash
tail -n 20 /var/www/html/d99/diamond99/auto_push_log/auto_push.log
```
