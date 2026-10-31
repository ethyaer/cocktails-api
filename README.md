
# cocktails-api
Zadanie rekrutacyjne do KN Solvro(backend)

REST API do zarządzania koktajlami i składnikami.

Feature'y:
    - Cocktails - pobieranie, tworzenie, aktualizacja i usuwanie koktajli
    - Ingredients - zarządzanie składnikami
    - Reviews - dodawanie opinii(skala 1-5 gwiazdek) i recenzji
    - Authentication - uwierzytelnianie użytkownika z użyciem tokenów JWT Bearer.
    - DB - PostgreSQL z TypeORM
    - Dokumentacja - Swagger

Stack technologiczny:
    - Runtime - Node.js
    - Framework: NestJS
    - Język: TypeScript
    - DB - PostgreSQL
    - ORM - TypeORM
    - Uwierzytelnianie - passport.js, JWT
    - Walidacja - class-validator, class-transformer

Opis działania:
    - program zawiera 4 serwisy cocktails, ingredients, reviews i auth.
    - niezalogowany użytkownik ma możliwość jedynie przeglądania bazy koktajli, składników i recenzji.
    - zalogowany użytkownik może sam dodawać, modyfikować i usuwać elementy.
    - zmodyfikować lub usunąć koktajl/składnik może tylko twórca lub administrator
    - tworząc nowy koktajl, łączymy go z istniejącymi już składnikami. Najpierw składniki, potem koktajl.
        Może i mało wygodne, aczkolwiek tworząc frontend można by wszystko zrobić w jednym formularzu.
    - funkcje get w serwisach cocktails i ingredients pobierają argumenty do paginacji o wartościach domyślnych page = 1, pageSize = 10
    - dla koktajli i składników dodana została możliwość filtrowania i sortowania
    - w katalogu src/ jest załączony podkatalog http-request-files posiadający pliki z szablonami requestów
    - w katalogu db/ został załączony schemat bazy oraz screeny drzewka relacji tabel i widoków
    
