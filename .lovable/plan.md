# ALFA Brain — pierwszy widok grafu i panel sterowania

## Cel
Dodać do obecnej strony osobny, responsywny widok **ALFA Brain**, który pokazuje architekturę bezpieczeństwa jako interaktywny graf D3.js i łączy ją z panelem sterowania w stylistyce Gold‑Black.

## Zakres
- Nowa pozycja **ALFA Brain** w głównej nawigacji i osobny adres strony.
- Interaktywny graf z rozdzielonymi węzłami, oparty na publicznym repozytorium ALFA Security.
- Pierwszy zestaw danych: rdzeń ALFA Brain, Cerber, Guardian, Łasuch, Brani, pamięć/graf wiedzy, filtr ryzyka, audyt oraz reprezentatywne domeny umiejętności.
- Panel sterowania po prawej stronie na komputerze i pod grafem na telefonie:
  - wyszukiwanie węzłów,
  - filtrowanie według typu,
  - wybór węzła i podgląd opisu, statusu, relacji i źródła,
  - powiększanie, pomniejszanie, centrowanie i reset układu,
  - przełącznik etykiet i pauza/wznowienie symulacji.
- Pasek stanu z potwierdzonymi danymi repozytorium: 754 umiejętności, 26 domen, 5 frameworków i licencja Apache‑2.0.
- Czytelne stany pustego wyszukiwania oraz dostępna obsługa klawiatury dla kontrolek.

## Wygląd
- Dedykowana odmiana Gold‑Black tylko dla widoku ALFA Brain, bez zmiany kolorystyki pozostałych stron.
- Czarne/grafitowe tło, złote akcenty, subtelna siatka techniczna, wysokokontrastowe etykiety i oszczędne animacje.
- Stabilny obszar grafu na desktopie i mobile; bez nakładania panelu na węzły.

## Dane i bezpieczeństwo
- Dane grafu będą lokalnym, typowanym wycinkiem publicznej architektury repozytorium, bez wykonywania kodu zewnętrznego.
- Linki źródłowe poprowadzą do wskazanego repozytorium GitHub.
- Panel w tej wersji jest bezpiecznym prototypem wizualizacyjnym: steruje widokiem grafu, nie uruchamia agentów ani operacji na sprzęcie.

## Technicznie
- React + TypeScript + D3 (`d3-force`, zoom, drag).
- Graf w osobnym komponencie, dane i typy w osobnym module.
- Kolory i cienie jako semantyczne tokeny w globalnym systemie stylów.
- Po wdrożeniu: sprawdzenie kompilacji oraz widoku desktopowego i mobilnego w działającym podglądzie.
