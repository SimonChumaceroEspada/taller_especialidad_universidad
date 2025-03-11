CREATE OR REPLACE FUNCTION log_changes() RETURNS TRIGGER AS $$
DECLARE
    primary_key_column TEXT;
    primary_key_value TEXT;
BEGIN
    IF TG_TABLE_NAME = 'log_table' OR TG_TABLE_NAME = 'encrypted_log_table' THEN
        RETURN NEW;
    END IF;

    SELECT column_name INTO primary_key_column
    FROM information_schema.columns
    WHERE table_name = TG_TABLE_NAME
    ORDER BY ordinal_position
    LIMIT 1;

    IF TG_OP = 'INSERT' THEN
        EXECUTE format('SELECT ($1).%I::text', primary_key_column) INTO primary_key_value USING NEW;
        INSERT INTO log_table (table_name, id_registro_tabla_modificada, action, date)
        VALUES (TG_TABLE_NAME, primary_key_value::int, 'CREATED ' || row_to_json(NEW)::text || ' in table ' || TG_TABLE_NAME, CURRENT_TIMESTAMP);
        INSERT INTO encrypted_log_table (table_name, id_registro_tabla_modificada, action, date)
        VALUES (encrypt_text(TG_TABLE_NAME, 'maquina'), encrypt_text(primary_key_value::text, 'maquina'), encrypt_text('CREATED ' || row_to_json(NEW)::text || ' in table ' || TG_TABLE_NAME, 'maquina'), encrypt_text(CURRENT_TIMESTAMP::text, 'maquina'));
    ELSIF TG_OP = 'UPDATE' THEN
        EXECUTE format('SELECT ($1).%I::text', primary_key_column) INTO primary_key_value USING NEW;
        INSERT INTO log_table (table_name, id_registro_tabla_modificada, action, date)
        VALUES (TG_TABLE_NAME, primary_key_value::int, 'UPDATED to ' || row_to_json(NEW)::text, CURRENT_TIMESTAMP);
        INSERT INTO encrypted_log_table (table_name, id_registro_tabla_modificada, action, date)
        VALUES (encrypt_text(TG_TABLE_NAME, 'maquina'), encrypt_text(primary_key_value::text, 'maquina'), encrypt_text('UPDATED to ' || row_to_json(NEW)::text, 'maquina'), encrypt_text(CURRENT_TIMESTAMP::text, 'maquina'));
    ELSIF TG_OP = 'DELETE' THEN
        EXECUTE format('SELECT ($1).%I::text', primary_key_column) INTO primary_key_value USING OLD;
        INSERT INTO log_table (table_name, id_registro_tabla_modificada, action, date)
        VALUES (TG_TABLE_NAME, primary_key_value::int, 'DELETED from table ' || TG_TABLE_NAME, CURRENT_TIMESTAMP);
        INSERT INTO encrypted_log_table (table_name, id_registro_tabla_modificada, action, date)
        VALUES (encrypt_text(TG_TABLE_NAME, 'maquina'), encrypt_text(primary_key_value::text, 'maquina'), encrypt_text('DELETED from table ' || TG_TABLE_NAME, 'maquina'), encrypt_text(CURRENT_TIMESTAMP::text, 'maquina'));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name NOT IN ('log_table', 'encrypted_log_table')) LOOP
        EXECUTE 'CREATE TRIGGER log_changes_' || r.table_name || ' AFTER INSERT OR UPDATE OR DELETE ON ' || r.table_name || ' FOR EACH ROW EXECUTE FUNCTION log_changes()';
    END LOOP;
END;
$$;
