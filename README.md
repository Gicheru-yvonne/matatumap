# Matatu Map

A full-stack web application for mapping and managing matatu (public transport) routes, built with modern web technologies and PostgreSQL with PostGIS for spatial data handling.

## Technologies Used

- **Express.js** - Minimal and flexible Node.js web application framework
- **PostgreSQL 17** - Advanced open-source relational database
- **PostGIS** - Spatial database extension for PostgreSQL
- **HTML/CSS** - Frontend markup and styling
- **JavaScript** - Client-side and server-side scripting

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (version 14 or higher recommended)
- **PostgreSQL 17** - [Download here](https://sbp.enterprisedb.com/getfile.jsp?fileid=1259680&_gl=1*qr3upx*_gcl_au*NjM1MjU4Mjk1LjE3NTcxMzA2MTI.*_ga*R0ExLjEuR0ExLjEuR0ExLjEuR0ExLjEuR0ExLjEuMTQ3MjI0OTEzMC4xNzU3MTMwNjE1*_ga_ND3EP1ME7G*czE3NTcxMzA2MTQkbzEkZzEkdDE3NTcxMzA3NjckajEzJGwwJGg4NTg5MTA2NzM.)
- **PostGIS extension** - [Installation guide](https://postgis.net/documentation/getting_started/#installing-postgis)
- **psql** command-line tool (should be available in your terminal after PostgreSQL installation)

## Setup Instructions

### 1. Unzip Project and Install Dependencies
- Unzip the project and navigate to the project directory.
    ```bash
    npm install
    ```

### 2. Database Setup

1. **Start PostgreSQL service** and ensure it's running on your machine.

2. **Create database user**:
   ```bash
   psql postgres
   ```

   In the PostgreSQL prompt, create a user:
   ```sql
   CREATE USER matatumap WITH SUPERUSER CREATEDB LOGIN PASSWORD 'matatumap';
   ```

   Create the database:
   ```sql
   CREATE DATABASE matatumap OWNER matatumap;
   ```

   Verify the database was created:
   ```sql
   \l
   ```

   Exit PostgreSQL prompt:
   ```sql
   \q
   ```

3. **Load database schema and data**:
   ```bash
   cd db/
   psql -U matatumap -d matatumap -f mydb_dump.sql
   ```

### 3. Configuration

Verify your database configuration in `/config/db.js`:

```javascript
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'matatumap',
  user: 'matatumap',
  password: 'matatumap'
}
```

### 4. Running the Application

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Access the application**:
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
matatu-map/
├── bin/             # Server files
├── config/          # Configuration files
├── db/              # Database files and dumps
├── middlewares/     # Custom middleware handlers
├── modules/         # Route controllers
├── public/          # Static assets (CSS, JS, images)