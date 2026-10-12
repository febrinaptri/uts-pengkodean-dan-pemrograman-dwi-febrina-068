CREATE TABLE chart_of_accounts (
    account_id            bigint GENERATED ALWAYS AS IDENTITY,
    account_code          varchar(20)  NOT NULL,
    account_name          varchar(100) NOT NULL,
    normal_balance        varchar(10)  NOT NULL,
    report_classification varchar(30)  NOT NULL,

    CONSTRAINT pk_chart_of_accounts
        PRIMARY KEY (account_id),
    CONSTRAINT uq_chart_of_accounts_account_code
        UNIQUE (account_code),
    CONSTRAINT chk_chart_of_accounts_normal_balance
        CHECK (normal_balance IN ('DEBIT', 'CREDIT'))
);

COMMENT ON TABLE chart_of_accounts IS
    'Menyimpan kode, nama, saldo normal, dan klasifikasi laporan akun.';


CREATE TABLE journal_headers (
    id             bigint GENERATED ALWAYS AS IDENTITY,
    journal_date   date        NOT NULL,
    reference      varchar(50),
    description    text,
    status_posting varchar(20) NOT NULL,

    CONSTRAINT pk_journal_headers
        PRIMARY KEY (id),
    CONSTRAINT chk_journal_headers_status_posting
        CHECK (status_posting IN ('DRAFT', 'POSTED'))
);

COMMENT ON TABLE journal_headers IS
    'Menyimpan informasi umum dan status posting jurnal.';


CREATE TABLE journal_lines (
    id         bigint GENERATED ALWAYS AS IDENTITY,
    header_id  bigint        NOT NULL,
    account_id bigint        NOT NULL,
    debit      numeric(18,2) NOT NULL,
    credit     numeric(18,2) NOT NULL,

    CONSTRAINT pk_journal_lines
        PRIMARY KEY (id),
    CONSTRAINT fk_journal_lines_header
        FOREIGN KEY (header_id)
        REFERENCES journal_headers (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_journal_lines_account
        FOREIGN KEY (account_id)
        REFERENCES chart_of_accounts (account_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_journal_lines_debit_nonnegative
        CHECK (debit >= 0),
    CONSTRAINT chk_journal_lines_credit_nonnegative
        CHECK (credit >= 0),
    CONSTRAINT chk_journal_lines_not_both_zero
        CHECK (debit <> 0 OR credit <> 0)
);

COMMENT ON TABLE journal_lines IS
    'Menyimpan baris akun serta nilai debit dan kredit dalam jurnal.';
