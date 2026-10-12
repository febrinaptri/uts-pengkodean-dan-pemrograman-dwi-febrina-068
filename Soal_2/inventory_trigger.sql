-- Memperbarui stok setelah transaksi inventaris berhasil dimasukkan.
-- Untuk ADJUSTMENT, qty positif menambah stok dan qty negatif mengurangi stok.
CREATE OR REPLACE FUNCTION trg_update_stock_and_journal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_stock INTEGER;
    new_stock BIGINT;
BEGIN
    -- Validasi tipe dan kuantitas sebelum memproses perubahan stok.
    IF NEW.trx_type IS NULL
       OR NEW.trx_type NOT IN ('PURCHASE', 'SALE', 'ADJUSTMENT') THEN
        RAISE EXCEPTION 'Tipe transaksi tidak valid: %.', NEW.trx_type
            USING ERRCODE = '22023';
    END IF;

    IF NEW.trx_type IN ('PURCHASE', 'SALE') AND NEW.qty <= 0 THEN
        RAISE EXCEPTION 'Kuantitas transaksi % harus lebih besar dari 0 (item_id: %).',
            NEW.trx_type, NEW.item_id
            USING ERRCODE = '22023';
    END IF;

    IF NEW.trx_type = 'ADJUSTMENT' AND NEW.qty = 0 THEN
        RAISE EXCEPTION 'Kuantitas ADJUSTMENT tidak boleh 0 (item_id: %).', NEW.item_id
            USING ERRCODE = '22023';
    END IF;

    -- Kunci baris barang untuk mencegah transaksi bersamaan memakai stok yang sama.
    SELECT stock_qty
    INTO current_stock
    FROM inventory_items
    WHERE item_id = NEW.item_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Barang dengan item_id % tidak ditemukan.', NEW.item_id
            USING ERRCODE = '23503';
    END IF;

    -- PURCHASE menambah, SALE mengurangi, ADJUSTMENT menerapkan qty bertanda.
    IF NEW.trx_type = 'PURCHASE' THEN
        new_stock := current_stock::BIGINT + NEW.qty;
    ELSIF NEW.trx_type = 'SALE' THEN
        IF current_stock < NEW.qty THEN
            RAISE EXCEPTION 'Stok tidak mencukupi untuk item_id %: stok %, diminta %.',
                NEW.item_id, current_stock, NEW.qty
                USING ERRCODE = '23514';
        END IF;
        new_stock := current_stock::BIGINT - NEW.qty;
    ELSE
        new_stock := current_stock::BIGINT + NEW.qty;
    END IF;

    IF new_stock < 0 THEN
        RAISE EXCEPTION 'Perubahan transaksi % membuat stok item_id % menjadi negatif (%).',
            NEW.trx_type, NEW.item_id, new_stock
            USING ERRCODE = '23514';
    END IF;

    IF new_stock > 2147483647 THEN
        RAISE EXCEPTION 'Perubahan transaksi % melebihi kapasitas stock_qty untuk item_id % (%).',
            NEW.trx_type, NEW.item_id, new_stock
            USING ERRCODE = '22003';
    END IF;

    UPDATE inventory_items
    SET stock_qty = new_stock::INTEGER
    WHERE item_id = NEW.item_id;

    -- Jika terjadi exception, PostgreSQL membatalkan INSERT transaksi dan UPDATE stok
    -- dalam statement/transaksi yang sama.
    RETURN NEW;
END;
$$;

-- Pastikan hanya ada satu trigger dengan nama ini.
DROP TRIGGER IF EXISTS inventory_transactions_update_stock_after_insert
    ON inventory_transactions;

CREATE TRIGGER inventory_transactions_update_stock_after_insert
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION trg_update_stock_and_journal();
