CREATE TABLE log_table (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    id_registro_tabla_modificada INT NOT NULL,
    action TEXT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE encrypted_log_table (
    id SERIAL PRIMARY KEY,
    table_name BYTEA NOT NULL,
    id_registro_tabla_modificada BYTEA NOT NULL,
    action BYTEA NOT NULL,
    date BYTEA NOT NULL
);
