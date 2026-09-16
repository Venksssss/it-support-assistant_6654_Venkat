from sqlalchemy.orm import Session
from app.models.knowledge import KnowledgeBase

SEED_DATA = [
    {
        "title": "Wi-Fi connected but no internet",
        "problem": "The computer is connected to the local Wi-Fi router, but web pages fail to load and internet connection state shows 'No Internet'.",
        "solution": "1. Flush DNS cache using `ipconfig /flushdns` in Command Prompt.\n2. Restart the network adapter (`netsh winsock reset`).\n3. Restart the wireless router and modem.\n4. Check if a proxy or static IP configuration is incorrectly assigned under Network Settings.",
        "keywords": "wifi internet connection network router ipconfig dns network adapter",
        "category": "Network"
    },
    {
        "title": "Laptop running slowly",
        "problem": "The system experiences severe lag, sluggish app performance, high memory utilization, and delayed mouse clicks.",
        "solution": "1. Open Task Manager (`Ctrl + Shift + Esc`) to identify resource-heavy applications.\n2. Disable unnecessary startup applications in the Startup tab.\n3. Run Disk Cleanup (`cleanmgr`) to remove temporary files.\n4. Ensure system drive (C:) has at least 15-20% free space.\n5. Scan system files with `sfc /scannow`.",
        "keywords": "slow performance lag cpu disk memory task manager startup free space",
        "category": "Hardware / OS"
    },
    {
        "title": "Password reset",
        "problem": "User is locked out of their Active Directory / domain account after typing incorrect credentials or forgot password.",
        "solution": "1. Verify user identity following company verification protocol.\n2. Open Active Directory Users and Computers or your Identity Provider portal.\n3. Locate user account and select 'Reset Password'.\n4. Set a temporary password and check 'User must change password at next logon'.\n5. Unlock the account if locked out.",
        "keywords": "password reset locked out active directory credentials login authentication security",
        "category": "Identity & Security"
    },
    {
        "title": "VPN not connecting",
        "problem": "Client VPN software fails to establish a secure tunnel, throwing timeout errors or TAP/TUN driver errors.",
        "solution": "1. Confirm active internet connectivity before starting VPN.\n2. Restart the VPN client service or application.\n3. Check if local firewall or third-party antivirus is blocking VPN ports (UDP 500/4500 or OpenVPN ports).\n4. Re-install or update the VPN virtual network adapter driver.",
        "keywords": "vpn connection network firewall portal tunnel authentication driver openvpn pulse secure",
        "category": "Network / Security"
    },
    {
        "title": "Printer not printing",
        "problem": "Documents sent to local or network printer remain stuck in print queue with status 'Error' or 'Printing' indefinitely.",
        "solution": "1. Open Services (`services.msc`) and restart the 'Print Spooler' service.\n2. Clear print job queue files in `C:\\Windows\\System32\\spool\\PRINTERS`.\n3. Verify printer IP address / physical USB cable connection.\n4. Ensure correct printer driver is selected as default.",
        "keywords": "printer print spooler offline print queue driver paper jam local network printer",
        "category": "Hardware"
    },
    {
        "title": "DNS resolution failure",
        "problem": "Websites cannot be resolved by domain name (e.g. Server Not Found error), though IP address ping works.",
        "solution": "1. Test DNS resolution with `nslookup domain.com` in CMD.\n2. Update TCP/IPv4 DNS server addresses to automatic or reliable DNS servers (e.g., 1.1.1.1 or 8.8.8.8 / internal DNS).\n3. Clear browser cache and run `ipconfig /flushdns`.\n4. Restart the DNS Client service.",
        "keywords": "dns resolution hostname ipconfig nslookup domain name system connection page load",
        "category": "Network"
    },
    {
        "title": "Email not syncing",
        "problem": "Outlook or Mail client fails to receive new emails, showing connection error or PST/OST database sync errors.",
        "solution": "1. Verify network connection and check server status (Exchange / O365 / IMAP).\n2. Test accessing webmail via browser to isolate client vs account issue.\n3. Open Outlook in Safe Mode (`outlook.exe /safe`).\n4. Re-create the Outlook mail profile via Control Panel -> Mail.\n5. Repair OST file using Scanost/Scanpst utility.",
        "keywords": "email outlook exchange o365 syncing pst ost mail inbox sync failure connection",
        "category": "Software / Mail"
    },
    {
        "title": "Windows update failure",
        "problem": "Windows Update gets stuck downloading at 0% or errors out with code like 0x80070002 or 0x80240034.",
        "solution": "1. Run the built-in Windows Update Troubleshooter.\n2. Stop `wuauserv` and `bits` services in CMD (`net stop wuauserv`).\n3. Clear update download cache in `C:\\Windows\\SoftwareDistribution`.\n4. Restart services (`net start wuauserv`) and re-check for updates.",
        "keywords": "windows update failure installation error code softwaredistribution update troubleshooter restart OS",
        "category": "Operating System"
    },
    {
        "title": "Application crashing",
        "problem": "Business desktop application freezes or closes unexpectedly upon startup or executing specific actions.",
        "solution": "1. Check Windows Event Viewer under Application Logs for exact crash fault module.\n2. Run application as Administrator.\n3. Verify prerequisites (.NET Framework, Visual C++ Redistributable) are up to date.\n4. Repair or reinstall the application.\n5. Clear app data cache in `%AppData%`.",
        "keywords": "app application crashing freeze event viewer crash log appdata admin mode .net redistributable",
        "category": "Software"
    },
    {
        "title": "Blue screen / system crash",
        "problem": "System suddenly crashes displaying a Stop Error screen (BSOD) with codes like CRITICAL_PROCESS_DIED or MEMORY_MANAGEMENT.",
        "solution": "1. Note the specific Stop Code displayed on screen.\n2. Boot into Windows Safe Mode.\n3. Analyze dump files using BlueScreenView or WinDbg.\n4. Roll back recently updated hardware drivers (graphics, network).\n5. Run Windows Memory Diagnostic (`mdsched.exe`) and `chkdsk /f`.",
        "keywords": "bsod blue screen crash dump error stop code memory diagnostic driver safe mode chkdsk",
        "category": "Hardware / OS"
    },
    {
        "title": "High CPU usage",
        "problem": "System fan spins loudly and machine becomes non-responsive due to 90-100% continuous CPU utilization.",
        "solution": "1. Open Task Manager and sort processes by CPU column.\n2. Identify if process is system component (e.g. WMI Provider Host, System) or third-party app.\n3. End task on rogue third-party processes.\n4. If WMI Provider Host, restart `WmiPrvSE` service.\n5. Run malware check and update device drivers.",
        "keywords": "high cpu processor usage fan noise Task Manager process lag overload utilization wmi",
        "category": "Performance"
    },
    {
        "title": "Remote desktop connection failure",
        "problem": "RDP connection times out or throws error 'Remote Desktop cannot connect to the remote computer'.",
        "solution": "1. Ensure Remote Desktop is enabled on target computer under System Settings.\n2. Verify network routing and ping connectivity between source and destination.\n3. Check if TCP Port 3389 is open and allowed through Windows Firewall.\n4. Verify remote user is added to 'Remote Desktop Users' group.",
        "keywords": "rdp remote desktop connection timeout 3389 port firewall permissions mstsc",
        "category": "Network / Access"
    },
    {
        "title": "Bluetooth not working",
        "problem": "Bluetooth toggle disappears from Windows Settings or external Bluetooth peripherals fail to pair/connect.",
        "solution": "1. Toggle Airplane mode on/off or restart Bluetooth service (`bthserv`).\n2. Run Windows Bluetooth Troubleshooter.\n3. Open Device Manager and uninstall Bluetooth adapter under Bluetooth section.\n4. Scan for hardware changes to reinstall default Bluetooth driver.",
        "keywords": "bluetooth device pair connect missing toggle adapter driver peripheral troubleshooter",
        "category": "Hardware"
    },
    {
        "title": "No audio",
        "problem": "No sound comes out of internal speakers or connected headphones, or audio device shows as disconnected.",
        "solution": "1. Verify default playback device in Sound Settings (`mmsys.cpl`).\n2. Unmute master volume and application volume.\n3. Restart Windows Audio service (`Audiosrv`).\n4. Reinstall Realtek / audio device driver in Device Manager.",
        "keywords": "no audio sound mute speaker headphones output driver audiosrv volume playback",
        "category": "Hardware"
    },
    {
        "title": "Disk space running low",
        "problem": "System displays 'Low Disk Space' warning on drive C: with red warning indicator in File Explorer.",
        "solution": "1. Run Disk Cleanup (`cleanmgr`) as Administrator to clean system restore files and update cache.\n2. Check `%TEMP%` and `C:\\Windows\\Temp` folders and purge files.\n3. Use TreeSize / WizTree to find large forgotten files or old downloads.\n4. Move personal documents / downloads to secondary drive or cloud storage.",
        "keywords": "disk space low full drive C storage temp cleanup cleanmgr files capacity",
        "category": "Storage"
    }
]

def seed_knowledge_base(db: Session):
    existing_count = db.query(KnowledgeBase).count()
    if existing_count == 0:
        for item in SEED_DATA:
            kb = KnowledgeBase(
                title=item["title"],
                problem=item["problem"],
                solution=item["solution"],
                keywords=item["keywords"],
                category=item["category"]
            )
            db.add(kb)
        db.commit()
        print(f"Successfully seeded {len(SEED_DATA)} knowledge base entries.")
    else:
        print(f"Knowledge base already seeded ({existing_count} entries present).")
