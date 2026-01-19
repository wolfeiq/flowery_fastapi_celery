#!/bin/bash
set -e

echo "Creating scent_user and setting up permissions..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create the scent_user
    CREATE USER scent_user WITH PASSWORD 'scent_pass';
    
    -- Grant connection privileges
    GRANT ALL PRIVILEGES ON DATABASE scent_memory TO scent_user;
    
    -- Connect to the database and set up schema permissions
    \c scent_memory
    
    -- Grant all privileges on public schema
    GRANT ALL ON SCHEMA public TO scent_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO scent_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO scent_user;
    
    -- Set default privileges for future objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO scent_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO scent_user;
    
    -- Make scent_user owner of the database
    ALTER DATABASE scent_memory OWNER TO scent_user;
    ALTER SCHEMA public OWNER TO scent_user;
    
    -- Create extensions if needed (common for production)
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
EOSQL

echo "Database initialization completed successfully!"