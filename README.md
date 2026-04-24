# MEMEMUSEUM

MEMEMUSEUM è una web application full-stack progettata per gli amanti dei meme. Gli utenti possono esplorare un'esposizione di opere digitali, caricare i propri meme, e interagire con quelli degli altri con voti e commenti.

## Funzionalità

### Utenti & Autenticazione
- **Registrazione e Login**: Sistema di autenticazione sicuro basato su **JWT (JSON Web Tokens)**.
- **Gestione Sessione**: Persistenza del login tramite localStorage.

### Galleria Meme
- **Visualizzazione Dinamica**: Card del meme con dettagli su autore, data di pubblicazione e descrizione.
- **Upload**: Gli utenti loggati possono caricare immagini con titoli, descrizioni e tags.
- **Meme del Giorno**: Sezione dedicata ad una particolare opera che con un algoritmo di rotazione cambia ogni giorno.
- **Gestione Contenuti**: Gli autori possono modificare il titolo dei propri meme o eliminarli definitivamente dal "museo".

### Interazione
- **Sistema di Voto**: Possibilità di mettere "Mi piace" (Upvote) o "Non mi piace" (Downvote).
- **Commenti**: Sistema di pubblicazione di commenti per esprimere il proprio parere su un meme, con possibilità per l'autore del commento di modificarlo o cancellarlo.

### Ricerca e Filtri
- **Ricerca testuale**: Filtro per tag o titolo.
- **Filtro Data**: Ricerca meme pubblicati in una data specifica.
- **Ordinamento**: Visualizzazione per i più recenti, meno recenti, più votati o meno votati.
- **Paginazione**: Navigazione fluida tra le pagine della galleria, limite massimo di 10 meme per pagina e possibilità di navigare in più pagine.

##  Tech Stack

**Frontend:**
- [React.js](https://reactjs.org/)
- [React Router](https://reactrouter.com/) (Routing)
- [Axios](https://axios-http.com/) (Chiamate API)
- [React-Toastify](https://fkhadra.github.io/react-toastify/) (Notifiche UI)
- [React-Datepicker](https://reactdatepicker.com/) (Calendario)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (Database relazionale)
- [node-postgres (pg)](https://node-postgres.com/) (Client DB)
- [dotenv](https://www.npmjs.com/package/dotenv) (Gestione variabili d'ambiente)
- [CORS](https://www.npmjs.com/package/cors) (Cross-Origin Resource Sharing)

##  Installazione e Configurazione
Segui questi passaggi per configurare l'ambiente di sviluppo locale.

### Prerequisiti
- Node.js: versione 16.x o superiore.
- PostgreSQL
- Gestore pacchetti: npm (incluso con Node).

### Configurazione del Database
- Crea un database vuoto chiamato mememuseum.
- Esegui le query SQL necessarie per creare le tabelle (Utente, Meme, Commento, Voto):

```text
CREATE TABLE utente(  
    user_id SERIAL PRIMARY KEY,  
    nome VARCHAR(20) NOT NULL,  
    cognome VARCHAR(20) NOT NULL,  
    username VARCHAR(100) UNIQUE NOT NULL,  
    email VARCHAR(100) UNIQUE NOT NULL,  
    password VARCHAR(255) NOT NULL,  
    data_creazione_account TIMESTAMP DEFAULT CURRENT_TIMESTAMP   
);  

CREATE TABLE meme(  
    id_meme SERIAL PRIMARY KEY,  
    titolo VARCHAR(255) NOT NULL,  
    descrizione TEXT,  
    url_immagine TEXT NOT NULL,  
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    tags TEXT,  
    user_id INT REFERENCES utente(user_id) ON DELETE SET NULL  
);

CREATE TABLE commento(  
    id_commento SERIAL PRIMARY KEY,  
    meme_id INT REFERENCES meme(id_meme) ON DELETE CASCADE,  
    user_id INT REFERENCES utente(user_id) ON DELETE CASCADE,  
    contenuto TEXT NOT NULL,  
    data_creazione_commento TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

CREATE TABLE voto(  
    id_voto SERIAL PRIMARY KEY,  
    meme_id INT REFERENCES meme(id_meme) ON DELETE CASCADE,  
    user_id INT REFERENCES utente(user_id) ON DELETE CASCADE,  
    voto BOOLEAN, -- TRUE per upvote, FALSE per downvote  
    data_creazione_voto TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);
```
## Setup Backend
Accedi alla cartella del server, installa le dipendenze e configura l'ambiente:
- Entra nella cartella backend:
```text
cd backend
```
- Installa le librerie (express, pg, dotenv, cors, etc.):
 ```text
npm install
```
- Crea il file .env e incolla il seguente contenuto (modificando le tue credenziali)
```text
cat <<EOF > .env  
PORT=3000  
DATABASE_URL=postgres://postgres:TUAPASSWORD@localhost:5432/mememuseum  
JWT_SECRET=CHIAVE SEGRETA
EOF
```

### Avvio dell'Applicazione
È necessario avviare entrambi i servizi contemporaneamente.

### Terminale 1 (Backend):
```text
cd backend
```
```text
node app.js
```

### Terminale 2 (Frontend):
```text
cd frontend
```
```text
npm run dev
```

L'interfaccia sarà navigabile alla porta suggerita dal terminale.

## Struttura del Progetto

```text
├── backend/
│   ├── controllers/        # Logica di autenticazione
│   ├── middleware/         # Funzioni intermedie (es. autenticazione JWT, validazione)
│   ├── routes/             # Rotte API (authRoutes,commentoRoutes,votoRoutes,memeRoutes)
│   ├── uploads/            # Cartella per le immagini caricate
│   ├── app.js              # Entry point Express
│   ├── db.js               # Configurazione PostgreSQL Pool
│   └── .env                # Variabili d'ambiente (DB URL, Port, JWT Secret)
├── frontend/
│   │   ├── components/Home  # Componenti React (InteractionSection, MemeCard, UploadCard, SearchBar, Pagination)
│   │   ├── pages/          # Pagine principali React (Home, Auth, MemeDelGiorno)
│   │   ├── App.jsx         # Componente principale e Router
│   │   ├── App.css         # Stile dell'applicazione
│   │   └── index.js        # Entry point React
│   └── public/             # Asset statici (logo, ecc.)
