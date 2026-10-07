export interface PowerShellCommand {
  command: string;
  description: string;
  category: 'System' | 'Pliki i foldery' | 'Sieć' | 'Procesy i usługi' | 'Bezpieczeństwo' | 'Administracja';
}

export const PS_CATEGORIES = [
  'System',
  'Pliki i foldery',
  'Sieć',
  'Procesy i usługi',
  'Bezpieczeństwo',
  'Administracja',
] as const;

export const powershellCommands: PowerShellCommand[] = [
  // System
  { category: 'System', command: 'Get-ComputerInfo', description: 'Pełne informacje o komputerze: system, sprzęt, BIOS.' },
  { category: 'System', command: 'Get-Date', description: 'Aktualna data i godzina.' },
  { category: 'System', command: 'Get-Volume', description: 'Lista dysków i wolnego miejsca.' },
  { category: 'System', command: 'Get-CimInstance Win32_Processor', description: 'Informacje o procesorze.' },
  { category: 'System', command: 'Get-CimInstance Win32_PhysicalMemory', description: 'Kości RAM i ich pojemność.' },
  { category: 'System', command: 'Get-PSDrive', description: 'Wszystkie zamontowane dyski i dostawcy.' },
  { category: 'System', command: '$PSVersionTable', description: 'Wersja PowerShella.' },
  // Pliki i foldery
  { category: 'Pliki i foldery', command: 'Get-ChildItem -Recurse', description: 'Lista plików i folderów, także w podfolderach.' },
  { category: 'Pliki i foldery', command: 'Get-ChildItem -Recurse -Filter *.gguf', description: 'Znajdź wszystkie pliki danego typu (np. modele).' },
  { category: 'Pliki i foldery', command: 'Copy-Item .\\plik.txt .\\kopia\\', description: 'Kopiowanie pliku do folderu.' },
  { category: 'Pliki i foldery', command: 'Move-Item .\\stary.txt .\\nowy\\', description: 'Przenoszenie pliku.' },
  { category: 'Pliki i foldery', command: 'Remove-Item .\\plik.txt', description: 'Usuwanie pliku.' },
  { category: 'Pliki i foldery', command: 'New-Item -ItemType Directory -Name "backup"', description: 'Tworzenie nowego folderu.' },
  { category: 'Pliki i foldery', command: 'Get-Content .\\log.txt -Tail 50', description: 'Ostatnie 50 linii pliku (jak tail).' },
  { category: 'Pliki i foldery', command: 'Get-Content .\\log.txt -Wait', description: 'Podgląd pliku na żywo (nowe linie).' },
  { category: 'Pliki i foldery', command: 'Select-String -Path .\\*.log -Pattern "error"', description: 'Szukanie tekstu w plikach (jak grep).' },
  { category: 'Pliki i foldery', command: 'Compress-Archive .\\folder .\\folder.zip', description: 'Pakowanie folderu do ZIP.' },
  { category: 'Pliki i foldery', command: 'Get-FileHash .\\plik.zip -Algorithm SHA256', description: 'Suma kontrolna pliku — weryfikacja integralności.' },
  // Sieć
  { category: 'Sieć', command: 'Get-NetIPAddress', description: 'Adresy IP wszystkich kart sieciowych.' },
  { category: 'Sieć', command: 'Get-NetAdapter', description: 'Lista kart sieciowych i ich status.' },
  { category: 'Sieć', command: 'Test-NetConnection google.com -Port 443', description: 'Test połączenia z hostem i portem.' },
  { category: 'Sieć', command: 'Get-NetTCPConnection -State Listen', description: 'Otwarte porty nasłuchujące na komputerze.' },
  { category: 'Sieć', command: 'Resolve-DnsName karentonoyan.pl', description: 'Zapytanie DNS o domenę.' },
  { category: 'Sieć', command: 'Get-NetRoute', description: 'Tablica routingu.' },
  { category: 'Sieć', command: 'Invoke-WebRequest https://api.github.com', description: 'Zapytanie HTTP z PowerShella.' },
  // Procesy i usługi
  { category: 'Procesy i usługi', command: 'Get-Process | Sort-Object CPU -Descending', description: 'Procesy posortowane po zużyciu CPU.' },
  { category: 'Procesy i usługi', command: 'Stop-Process -Name notepad', description: 'Zamykanie procesu po nazwie.' },
  { category: 'Procesy i usługi', command: 'Get-Service', description: 'Lista wszystkich usług systemowych.' },
  { category: 'Procesy i usługi', command: 'Get-Service | Where-Object Status -eq "Running"', description: 'Tylko działające usługi.' },
  { category: 'Procesy i usługi', command: 'Restart-Service wuauserv', description: 'Restart usługi (np. Windows Update).' },
  { category: 'Procesy i usługi', command: 'Get-ScheduledTask', description: 'Zadania zaplanowane w systemie.' },
  // Bezpieczeństwo
  { category: 'Bezpieczeństwo', command: 'Get-MpComputerStatus', description: 'Status Windows Defendera.' },
  { category: 'Bezpieczeństwo', command: 'Start-MpScan -ScanType QuickScan', description: 'Szybki skan antywirusowy.' },
  { category: 'Bezpieczeństwo', command: 'Get-NetFirewallRule -Enabled True', description: 'Aktywne reguły zapory sieciowej.' },
  { category: 'Bezpieczeństwo', command: 'Get-LocalUser', description: 'Konta użytkowników na komputerze.' },
  { category: 'Bezpieczeństwo', command: 'Get-ExecutionPolicy -List', description: 'Polityka uruchamiania skryptów.' },
  { category: 'Bezpieczeństwo', command: 'Get-WinEvent -LogName Security -MaxEvents 20', description: 'Ostatnie zdarzenia z dziennika bezpieczeństwa.' },
  { category: 'Bezpieczeństwo', command: 'Get-AuthenticodeSignature .\\skrypt.ps1', description: 'Sprawdzenie podpisu cyfrowego pliku.' },
  // Administracja
  { category: 'Administracja', command: 'Get-WindowsUpdate', description: 'Lista dostępnych aktualizacji (moduł PSWindowsUpdate).' },
  { category: 'Administracja', command: 'Get-AppxPackage | Select-Object Name', description: 'Zainstalowane aplikacje Microsoft Store.' },
  { category: 'Administracja', command: 'winget list', description: 'Wszystkie zainstalowane programy.' },
  { category: 'Administracja', command: 'sfc /scannow', description: 'Naprawa plików systemowych Windows.' },
  { category: 'Administracja', command: 'Get-EventLog -LogName System -Newest 30', description: 'Ostatnie zdarzenia systemowe.' },
  { category: 'Administracja', command: 'Export-Csv -Path .\\raport.csv', description: 'Zapis wyników do pliku CSV (po potoku |).' },
  { category: 'Administracja', command: 'Get-Help Get-Process -Examples', description: 'Pomoc i przykłady dla dowolnej komendy.' },
];
