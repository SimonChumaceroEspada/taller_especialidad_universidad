-- Verificar y crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Eliminar funciones existentes si las hay para evitar conflictos
DROP FUNCTION IF EXISTS decrypt_text(bytea, text);
DROP FUNCTION IF EXISTS encrypt_text(text, text);

-- Crear función de encriptado con manejo adecuado de tipos
CREATE OR REPLACE FUNCTION encrypt_text(data text, secret text)
RETURNS bytea AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, secret);
END;
$$ LANGUAGE plpgsql;

-- Crear función de desencriptado con manejo adecuado de tipos
CREATE OR REPLACE FUNCTION decrypt_text(data bytea, secret text)
RETURNS text AS $$
BEGIN
    RETURN pgp_sym_decrypt(data, secret);
EXCEPTION
    WHEN others THEN
        RETURN 'Error al desencriptar';
END;
$$ LANGUAGE plpgsql;

-- Verificar si las funciones se crearon correctamente
DO $$
BEGIN
    RAISE NOTICE 'Verificando funciones de encriptación...';
    
    -- Verificar encrypt_text
    DECLARE
        encrypted bytea;
    BEGIN
        encrypted := encrypt_text('test', 'maquina');
        IF encrypted IS NOT NULL THEN
            RAISE NOTICE 'Function encrypt_text works correctly';
        ELSE
            RAISE NOTICE 'Failed: encrypt_text returned NULL';
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Failed: encrypt_text raised exception: %', SQLERRM;
    END;

    -- Verificar decrypt_text
    DECLARE
        test_text text := 'test';
        encrypted bytea;
        decrypted text;
    BEGIN
        encrypted := encrypt_text(test_text, 'maquina');
        decrypted := decrypt_text(encrypted, 'maquina');
        
        IF decrypted = test_text THEN
            RAISE NOTICE 'Function decrypt_text works correctly';
        ELSE
            RAISE NOTICE 'Failed: decrypt_text returned % instead of %', decrypted, test_text;
        END IF;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Failed: decrypt_text raised exception: %', SQLERRM;
    END;
END;
$$;
