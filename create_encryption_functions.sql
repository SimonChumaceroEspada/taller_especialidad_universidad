CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION encrypt_text(text, key text) RETURNS bytea AS $$
DECLARE
    iv bytea = gen_random_bytes(16);
    encrypted bytea;
BEGIN
    encrypted := pgp_sym_encrypt($1, $2, 'cipher-algo=aes256');
    RETURN iv || encrypted;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_text(encrypted bytea, key text) RETURNS text AS $$
DECLARE
    iv bytea;
    ciphertext bytea;
BEGIN
    iv := substring($1 from 1 for 16);
    ciphertext := substring($1 from 17);
    RETURN pgp_sym_decrypt(ciphertext, $2, 'cipher-algo=aes256');
END;
$$ LANGUAGE plpgsql;
