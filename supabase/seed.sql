--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1 (Debian 15.1-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: pgsodium; Type: SCHEMA; Schema: -; Owner: pgsodium_key_holder
--

CREATE SCHEMA pgsodium;


ALTER SCHEMA pgsodium OWNER TO pgsodium_key_holder;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pgsodium_crypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgsodium_crypto WITH SCHEMA pgsodium;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.get_auth(raw_jwt text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
  declare
    token_payload jsonb;
    user_id uuid;
    session_id uuid;
  begin
    token_payload := extensions.very_secure_decode_jwt_without_validation(raw_jwt);

    -- check custom claim
    if token_payload ? 'user_id' then
      user_id := (token_payload->>'user_id')::uuid;
    else
      user_id := (token_payload->>'sub')::uuid;
    end if;

    if token_payload ? 'session_id' then
      session_id := (token_payload->>'session_id')::uuid;
    end if;

    return jsonb_build_object(
      'user_id', user_id,
      'session_id', session_id
    );
  end;
$$;


ALTER FUNCTION auth.get_auth(raw_jwt text) OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION get_auth(raw_jwt text); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.get_auth(raw_jwt text) IS 'Get user and session from a JWT. This function is used by the auto-updating auth.uid() and auth.role() functions. Internal use only. This function is not meant to be called by you.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select
    coalesce(
        nullif(current_setting('request.jwt.claim.user_id', true), '')::uuid,
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
    );
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Get the user''s UID from the request';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA', 'DROP SCHEMA',
      'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE', 'DROP TABLE',
      'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE', 'DROP FOREIGN TABLE',
      'CREATE VIEW', 'ALTER VIEW', 'DROP VIEW',
      'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW', 'DROP MATERIALIZED VIEW',
      'CREATE FUNCTION', 'ALTER FUNCTION', 'DROP FUNCTION',
      'CREATE TRIGGER', 'ALTER TRIGGER', 'DROP TRIGGER',
      'CREATE TYPE', 'ALTER TYPE', 'DROP TYPE',
      'CREATE RULE', 'ALTER RULE', 'DROP RULE',
      'COMMENT'
    )
    AND cmd.schema_name IS DISTINCT FROM 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema',
      'table',
      'foreign table',
      'view',
      'materialized view',
      'function',
      'trigger',
      'type',
      'rule'
    )
    AND obj.schema_name IS DISTINCT FROM 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.set_graphql_placeholder() RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
    begin
        perform set_config('role', 'anon', true);
        return '{"errors": [{"message": "pg_graphql placeholder function"}]}';
    end;
$$;


ALTER FUNCTION graphql_public.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  -- Create a new tenant for the new user
  insert into public.tenants (id, company_name)
  values (new.id, new.raw_user_meta_data ->> 'business_name');

  -- Create a tenant_users entry to link the user and tenant
  insert into public.tenant_users (tenant_id, user_id, role)
  values (new.id, new.id, 'owner');
  
  return new;
end;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO supabase_admin;

--
-- Name: set_current_tenant(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_current_tenant(tenant_id_input text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Set the tenant ID for the current session, to be used by RLS policies
  PERFORM set_config('request.jwt.claims.tenant_id', tenant_id_input, true);
END;
$$;


ALTER FUNCTION public.set_current_tenant(tenant_id_input text) OWNER TO postgres;

--
-- Name: auth_users_identity_denylist; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.auth_users_identity_denylist (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    identity_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.auth_users_identity_denylist OWNER TO supabase_auth_admin;

--
-- Name: TABLE auth_users_identity_denylist; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.auth_users_identity_denylist IS 'denylist for auth.users.identities';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: pgrst_api_keys; Type: TABLE; Schema: extensions; Owner: postgres
--

CREATE TABLE extensions.pgrst_api_keys (
    id bigint NOT NULL,
    api_key text NOT NULL,
    schemas text[] NOT NULL,
    role name NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE extensions.pgrst_api_keys OWNER TO postgres;

--
-- Name: pgrst_api_keys_id_seq; Type: SEQUENCE; Schema: extensions; Owner: postgres
--

CREATE SEQUENCE extensions.pgrst_api_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE extensions.pgrst_api_keys_id_seq OWNER TO postgres;

--
-- Name: pgrst_api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: extensions; Owner: postgres
--

ALTER SEQUENCE extensions.pgrst_api_keys_id_seq OWNED BY extensions.pgrst_api_keys.id;


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.accounts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    account_code text NOT NULL,
    account_name text NOT NULL,
    account_type text NOT NULL,
    parent_account_id uuid,
    description text,
    is_active boolean DEFAULT true,
    balance numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.accounts OWNER TO supabase_admin;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    table_name text,
    record_id text,
    old_values jsonb,
    new_values jsonb,
    "timestamp" timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_log OWNER TO supabase_admin;

--
-- Name: bills; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.bills (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    supplier_id uuid,
    bill_number text,
    status text,
    total_amount numeric,
    amount_paid numeric,
    bill_date date,
    due_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.bills OWNER TO supabase_admin;

--
-- Name: bill_line_items; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.bill_line_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bill_id uuid,
    product_id uuid,
    quantity integer,
    unit_price numeric,
    total_price numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.bill_line_items OWNER TO supabase_admin;

--
-- Name: bill_payments; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.bill_payments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bill_id uuid,
    amount numeric,
    payment_date date,
    payment_method text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.bill_payments OWNER TO supabase_admin;

--
-- Name: customer_contacts; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.customer_contacts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    contact_type text,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.customer_contacts OWNER TO supabase_admin;

--
-- Name: customer_interactions; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.customer_interactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    type text NOT NULL,
    detail text NOT NULL,
    interaction_date timestamp with time zone NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.customer_interactions OWNER TO supabase_admin;

--
-- Name: customer_notes; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.customer_notes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    note text NOT NULL,
    author_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.customer_notes OWNER TO supabase_admin;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.customers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    city text,
    credit_terms text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.customers OWNER TO supabase_admin;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.departments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    parent_department_id uuid,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.departments OWNER TO supabase_admin;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.employees (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    job_title text,
    start_date date,
    employment_type text,
    status text,
    date_of_birth date,
    gender text,
    national_id text,
    marital_status text,
    address text,
    city text,
    state text,
    postal_code text,
    country text,
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relationship text,
    employee_number text,
    reporting_manager text,
    work_location text,
    base_salary numeric,
    currency text,
    payment_frequency text,
    payment_method text,
    bank_name text,
    account_number text,
    routing_number text,
    tax_id text,
    notes text,
    contract_url text,
    id_document_url text,
    resume_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    phone text,
    email text,
    department text
);


ALTER TABLE public.employees OWNER TO supabase_admin;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.expenses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    expense_date date NOT NULL,
    category text NOT NULL,
    description text,
    amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.expenses OWNER TO supabase_admin;

--
-- Name: fiscal_periods; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.fiscal_periods (
    period text NOT NULL,
    status text DEFAULT 'Open'::text
);


ALTER TABLE public.fiscal_periods OWNER TO supabase_admin;

--
-- Name: journal_batches; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.journal_batches (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date date NOT NULL,
    description text,
    source_type text,
    source_id text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.journal_batches OWNER TO supabase_admin;

--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    batch_id uuid NOT NULL,
    account_id uuid NOT NULL,
    debit numeric,
    credit numeric,
    memo text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.journal_entries OWNER TO supabase_admin;

--
-- Name: ledger_entries; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.ledger_entries (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    account_id uuid NOT NULL,
    debit_amount numeric,
    credit_amount numeric,
    transaction_date date NOT NULL,
    description text,
    reference_type text,
    reference_id text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ledger_entries OWNER TO supabase_admin;

--
-- Name: payslips; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.payslips (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    period text NOT NULL,
    gross numeric NOT NULL,
    deductions numeric,
    net numeric NOT NULL,
    status text,
    issued_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payslips OWNER TO supabase_admin;

--
-- Name: products; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.products (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    sku text,
    category text,
    cost_price numeric,
    selling_price numeric,
    stock_quantity integer,
    reorder_point integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    avg_cost numeric
);


ALTER TABLE public.products OWNER TO supabase_admin;

--
-- Name: sales_invoice_line_items; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.sales_invoice_line_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    invoice_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric NOT NULL,
    total_price numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    unit_cost numeric
);


ALTER TABLE public.sales_invoice_line_items OWNER TO supabase_admin;

--
-- Name: sales_invoices; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.sales_invoices (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    invoice_number text NOT NULL,
    customer_id uuid NOT NULL,
    invoice_date date NOT NULL,
    due_date date NOT NULL,
    total_amount numeric NOT NULL,
    payment_status text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    customer_name text,
    payment_date date,
    subtotal numeric,
    tax_rate numeric,
    tax_amount numeric,
    posting_status text,
    posted_at timestamp with time zone
);


ALTER TABLE public.sales_invoices OWNER TO supabase_admin;

--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.stock_movements (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    movement_type text NOT NULL,
    reference_document text,
    created_at timestamp with time zone DEFAULT now(),
    reason text,
    unit_cost numeric,
    qty_change numeric
);


ALTER TABLE public.stock_movements OWNER TO supabase_admin;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    payment_terms text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.suppliers OWNER TO supabase_admin;

--
-- Name: tax_codes; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.tax_codes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    rate numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tax_codes OWNER TO supabase_admin;

--
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.tenant_settings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    settings jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    logo_url text,
    business_address text,
    business_email text,
    business_phone text
);


ALTER TABLE public.tenant_settings OWNER TO supabase_admin;

--
-- Name: tenant_users; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.tenant_users (
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tenant_users OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.tenants (
    id uuid NOT NULL,
    company_name text,
    industry text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tenants OWNER TO supabase_admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text,
    email text,
    role text,
    status text,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO supabase_admin;

--
-- Name: v_product_stock; Type: VIEW; Schema: public; Owner: supabase_admin
--

CREATE VIEW public.v_product_stock AS
 SELECT p.id AS product_id,
    p.name,
    p.sku,
    COALESCE(sum(sm.qty_change), (0)::numeric) AS current_qty
   FROM (public.products p
     LEFT JOIN public.stock_movements sm ON ((p.id = sm.product_id)))
  GROUP BY p.id, p.name, p.sku;


ALTER TABLE public.v_product_stock OWNER TO supabase_admin;

--
-- Name: pgrst_api_keys id; Type: DEFAULT; Schema: extensions; Owner: postgres
--

ALTER TABLE ONLY extensions.pgrst_api_keys ALTER COLUMN id SET DEFAULT nextval('extensions.pgrst_api_keys_id_seq'::regclass);


--
-- Data for Name: audit_trail; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_trail (id, instance_id, payload, created_at) FROM stdin;
\.


--
-- Data for Name: auth_users_identity_denylist; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.auth_users_identity_denylist (id, identity_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, rel_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (id, instance_id, token, user_id, revitalized_at, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, from_ip_address, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20240328132924
20240409104033
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, confirmed_at, email_change_token_new, email_change, email_change_sent_at, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous, user_id_v2) FROM stdin;
-- Add a test user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
    '8a06146a-7c98-4444-9041-591456157449',
    'test@example.com',
    '$2a$10$E0.a4V/2k7.a8J0lF1i2l.X.Yj/Z.E/Z.E/Z.E/Z.E/Z.E/Z.E/Z.', -- This is a hash for 'password'
    NOW(),
    '{"full_name": "Test User", "business_name": "Test Inc."}',
    NOW(),
    NOW()
);
\.


--
-- Data for Name: pgrst_api_keys; Type: TABLE DATA; Schema: extensions; Owner: postgres
--

COPY extensions.pgrst_api_keys (id, api_key, schemas, role, created_at) FROM stdin;
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.accounts (id, account_code, account_name, account_type, parent_account_id, description, is_active, balance, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.audit_log (id, user_id, action, table_name, record_id, old_values, new_values, "timestamp") FROM stdin;
\.


--
-- Data for Name: bill_line_items; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.bill_line_items (id, bill_id, product_id, quantity, unit_price, total_price, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bill_payments; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.bill_payments (id, bill_id, amount, payment_date, payment_method, created_at) FROM stdin;
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.bills (id, supplier_id, bill_number, status, total_amount, amount_paid, bill_date, due_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_contacts; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.customer_contacts (id, tenant_id, customer_id, contact_type, value, created_at) FROM stdin;
\.


--
-- Data for Name: customer_interactions; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.customer_interactions (id, tenant_id, customer_id, type, detail, interaction_date, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: customer_notes; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.customer_notes (id, tenant_id, customer_id, note, author_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.customers (id, tenant_id, name, email, phone, address, city, credit_terms, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.departments (id, name, parent_department_id, manager_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.employees (id, first_name, last_name, job_title, start_date, employment_type, status, date_of_birth, gender, national_id, marital_status, address, city, state, postal_code, country, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, employee_number, reporting_manager, work_location, base_salary, currency, payment_frequency, payment_method, bank_name, account_number, routing_number, tax_id, notes, contract_url, id_document_url, resume_url, created_at, updated_at, phone, email, department) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.expenses (id, expense_date, category, description, amount, created_at) FROM stdin;
\.


--
-- Data for Name: fiscal_periods; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.fiscal_periods (period, status) FROM stdin;
\.


--
-- Data for Name: journal_batches; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.journal_batches (id, date, description, source_type, source_id, created_at) FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.journal_entries (id, batch_id, account_id, debit, credit, memo, created_at) FROM stdin;
\.


--
-- Data for Name: ledger_entries; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.ledger_entries (id, account_id, debit_amount, credit_amount, transaction_date, description, reference_type, reference_id, created_at) FROM stdin;
\.


--
-- Data for Name: payslips; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.payslips (id, employee_id, period, gross, deductions, net, status, issued_at, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.products (id, name, sku, category, cost_price, selling_price, stock_quantity, reorder_point, created_at, updated_at, avg_cost) FROM stdin;
\.


--
-- Data for Name: sales_invoice_line_items; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.sales_invoice_line_items (id, invoice_id, product_id, quantity, unit_price, total_price, created_at, unit_cost) FROM stdin;
\.


--
-- Data for Name: sales_invoices; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.sales_invoices (id, invoice_number, customer_id, invoice_date, due_date, total_amount, payment_status, created_at, customer_name, payment_date, subtotal, tax_rate, tax_amount, posting_status, posted_at) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.stock_movements (id, product_id, quantity, movement_type, reference_document, created_at, reason, unit_cost, qty_change) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.suppliers (id, name, email, phone, address, payment_terms, created_at) FROM stdin;
\.


--
-- Data for Name: tax_codes; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.tax_codes (id, name, rate, created_at) FROM stdin;
\.


--
-- Data for Name: tenant_settings; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.tenant_settings (id, tenant_id, settings, created_at, updated_at, logo_url, business_address, business_email, business_phone) FROM stdin;
\.


--
-- Data for Name: tenant_users; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.tenant_users (tenant_id, user_id, role, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.tenants (id, company_name, industry, created_at, updated_at) FROM stdin;
a8d6f397-8e3a-4b8d-9b3d-2e6b7d3b3e5c	Default Tenant	retail	2024-07-03 12:47:33.250559+00	2024-07-03 12:47:33.250559+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.users (id, name, email, role, status, last_login, created_at) FROM stdin;
\.


--
-- Name: pgrst_api_keys_id_seq; Type: SEQUENCE SET; Schema: extensions; Owner: postgres
--

SELECT pg_catalog.setval('extensions.pgrst_api_keys_id_seq', 1, false);


--
-- Name: auth_users_identity_denylist auth_users_identity_denylist_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.auth_users_identity_denylist
    ADD CONSTRAINT auth_users_identity_denylist_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: pgrst_api_keys pgrst_api_keys_pkey; Type: CONSTRAINT; Schema: extensions; Owner: postgres
--

ALTER TABLE ONLY extensions.pgrst_api_keys
    ADD CONSTRAINT pgrst_api_keys_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_account_code_key; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_account_code_key UNIQUE (account_code);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: bill_line_items bill_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.bill_line_items
    ADD CONSTRAINT bill_line_items_pkey PRIMARY KEY (id);


--
-- Name: bill_payments bill_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.bill_payments
    ADD CONSTRAINT bill_payments_pkey PRIMARY KEY (id);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: customer_contacts customer_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customer_contacts
    ADD CONSTRAINT customer_contacts_pkey PRIMARY KEY (id);


--
-- Name: customer_interactions customer_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customer_interactions
    ADD CONSTRAINT customer_interactions_pkey PRIMARY KEY (id);


--
-- Name: customer_notes customer_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: fiscal_periods fiscal_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.fiscal_periods
    ADD CONSTRAINT fiscal_periods_pkey PRIMARY KEY (period);


--
-- Name: journal_batches journal_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.journal_batches
    ADD CONSTRAINT journal_batches_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: ledger_entries ledger_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_pkey PRIMARY KEY (id);


--
-- Name: payslips payslips_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sales_invoice_line_items sales_invoice_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.sales_invoice_line_items
    ADD CONSTRAINT sales_invoice_line_items_pkey PRIMARY KEY (id);


--
-- Name: sales_invoices sales_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: sales_invoices sales_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: tax_codes tax_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.tax_codes
    ADD CONSTRAINT tax_codes_pkey PRIMARY KEY (id);


--
-- Name: tenant_settings tenant_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_pkey PRIMARY KEY (id);


--
-- Name: tenant_settings tenant_settings_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_tenant_id_key UNIQUE (tenant_id);


--
-- Name: tenant_users tenant_users_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_pkey PRIMARY KEY (tenant_id, user_id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: auth_users_identity_denylist_identity_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX auth_users_identity_denylist_identity_id_idx ON auth.auth_users_identity_denylist USING btree (identity_id);


--
-- Name: on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
         WHEN TAG IN ('CREATE SCHEMA', 'ALTER SCHEMA', 'DROP SCHEMA', 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE', 'DROP TABLE', 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE', 'DROP FOREIGN TABLE', 'CREATE VIEW', 'ALTER VIEW', 'DROP VIEW', 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW', 'DROP MATERIALIZED VIEW', 'CREATE FUNCTION', 'ALTER FUNCTION', 'DROP FUNCTION', 'CREATE TRIGGER', 'ALTER TRIGGER', 'DROP TRIGGER', 'CREATE TYPE', 'ALTER TYPE', 'DROP TYPE', 'CREATE RULE', 'ALTER RULE', 'DROP RULE', 'COMMENT')
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- Name: accounts accounts_parent_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_parent_account_id_fkey FOREIGN KEY (parent_account_id) REFERENCES public.accounts(id);


--
-- Name: bill_line_items bill_line_items_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.bill_line_items
    ADD CONSTRAINT bill_line_items_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id);


--
-- Name: bill_line_items bill_line_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.bill_line_items
    ADD CONSTRAINT bill_line_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: bill_payments bill_payments_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.bill_payments
    ADD CONSTRAINT bill_payments_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id);


--
-- Name: bills bills_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: customer_contacts customer_contacts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customer_contacts
    ADD CONSTRAINT customer_contacts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_contacts customer_contacts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customer_contacts
    ADD CONSTRAINT customer_contacts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: customer_interactions customer_interactions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customer_interactions
    ADD CONSTRAINT customer_interactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_interactions customer_interactions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customer_interactions
    ADD CONSTRAINT customer_interactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: customer_notes customer_notes_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_notes customer_notes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: customers customers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: departments departments_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: departments departments_parent_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_department_id_fkey FOREIGN KEY (parent_department_id) REFERENCES public.departments(id);


--
-- Name: journal_entries journal_entries_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: journal_entries journal_entries_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.journal_batches(id);


--
-- Name: ledger_entries ledger_entries_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: payslips payslips_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: sales_invoice_line_items sales_invoice_line_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.sales_invoice_line_items
    ADD CONSTRAINT sales_invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.sales_invoices(id);


--
-- Name: sales_invoice_line_items sales_invoice_line_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.sales_invoice_line_items
    ADD CONSTRAINT sales_invoice_line_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sales_invoices sales_invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: tenant_settings tenant_settings_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: tenant_users tenant_users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: tenants tenants_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
GRANT USAGE ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT USAGE ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA graphql; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA graphql TO anon;
GRANT USAGE ON SCHEMA graphql TO authenticated;
GRANT USAGE ON SCHEMA graphql TO service_role;


--
-- Name: SCHEMA graphql_public; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA graphql_public TO anon;
GRANT USAGE ON SCHEMA graphql_public TO authenticated;
GRANT USAGE ON SCHEMA graphql_public TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO anon;
GRANT ALL ON FUNCTION auth.uid() TO authenticated;
GRANT ALL ON FUNCTION auth.uid() TO service_role;


--
-- Name: FUNCTION "text-rc4"(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions."text-rc4"(text, text) TO "anon";
GRANT ALL ON FUNCTION extensions."text-rc4"(text, text) TO "authenticated";
GRANT ALL ON FUNCTION extensions."text-rc4"(text, text) TO "service_role";


--
-- Name: FUNCTION "text-rc4-decode"(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions."text-rc4-decode"(text, text) TO "anon";
GRANT ALL ON FUNCTION extensions."text-rc4-decode"(text, text) TO "authenticated";
GRANT ALL ON FUNCTION extensions."text-rc4-decode"(text, text) TO "service_role";


--
-- Name: FUNCTION algorithm_sign(signables text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO anon;
GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO authenticated;
GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO service_role;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO anon;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO authenticated;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO service_role;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO anon;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO authenticated;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO service_role;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO anon;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO service_role;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO anon;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO authenticated;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO service_role;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO service_role;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO anon;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO service_role;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO anon;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO authenticated;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO service_role;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO anon;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO authenticated;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO service_role;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO anon;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO authenticated;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO service_role;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO anon;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO authenticated;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO service_role;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO anon;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO service_role;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info() TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(oid, oid, bigint); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(oid, oid, bigint) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO service_role;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO service_role;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO service_role;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO anon;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO service_role;


--
-- Name: FUNCTION sign(signables text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.sign(signables text, secret text, algorithm text) TO anon;
GRANT ALL ON FUNCTION extensions.sign(signables text, secret text, algorithm text) TO authenticated;
GRANT ALL ON FUNCTION extensions.sign(signables text, secret text, algorithm text) TO service_role;


--
-- Name: FUNCTION try_cast_double(inp text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO anon;
GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO authenticated;
GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO service_role;


--
-- Name: FUNCTION url_decode(data text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.url_decode(data text) TO anon;
GRANT ALL ON FUNCTION extensions.url_decode(data text) TO authenticated;
GRANT ALL ON FUNCTION extensions.url_decode(data text) TO service_role;


--
-- Name: FUNCTION url_encode(data bytea); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO anon;
GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO authenticated;
GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO service_role;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO anon;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO service_role;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO anon;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO service_role;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO anon;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO service_role;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO anon;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO service_role;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO anon;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO service_role;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO anon;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO service_role;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO anon;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO service_role;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO anon;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO service_role;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO anon;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO service_role;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO anon;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO authenticated;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO service_role;


--
-- Name: FUNCTION verify(token text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO anon;
GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO authenticated;
GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO service_role;


--
-- Name: FUNCTION comment_on_GIST_fts_limit_RQuinH88Cg_i(text); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql.comment_on_GIST_fts_limit_RQuinH88Cg_i(text) TO anon;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_fts_limit_RQuinH88Cg_i(text) TO authenticated;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_fts_limit_RQuinH88Cg_i(text) TO service_role;


--
-- Name: FUNCTION comment_on_GIST_graphql_name_Kjp4GA_i(text); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql.comment_on_GIST_graphql_name_Kjp4GA_i(text) TO anon;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_graphql_name_Kjp4GA_i(text) TO authenticated;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_graphql_name_Kjp4GA_i(text) TO service_role;


--
-- Name: FUNCTION comment_on_GIST_pg_attribute_name_lze9gA_i(text); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_attribute_name_lze9gA_i(text) TO anon;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_attribute_name_lze9gA_i(text) TO authenticated;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_attribute_name_lze9gA_i(text) TO service_role;


--
-- Name: FUNCTION comment_on_GIST_pg_class_name_OB5O1Q_i(text); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_class_name_OB5O1Q_i(text) TO anon;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_class_name_OB5O1Q_i(text) TO authenticated;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_class_name_OB5O1Q_i(text) TO service_role;


--
-- Name: FUNCTION comment_on_GIST_pg_constraint_name_233o6Q_i(text); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_constraint_name_233o6Q_i(text) TO anon;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_constraint_name_233o6Q_i(text) TO authenticated;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_constraint_name_233o6Q_i(text) TO service_role;


--
-- Name: FUNCTION comment_on_GIST_pg_proc_name_17l02A_i(text); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_proc_name_17l02A_i(text) TO anon;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_proc_name_17l02A_i(text) TO authenticated;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_proc_name_17l02A_i(text) TO service_role;


--
-- Name: FUNCTION comment_on_GIST_pg_type_name_yL5PPA_i(text); Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_type_name_yL5PPA_i(text) TO anon;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_type_name_yL5PPA_i(text) TO authenticated;
GRANT ALL ON FUNCTION graphql.comment_on_GIST_pg_type_name_yL5PPA_i(text) TO service_role;


--
-- Name: FUNCTION graphql(text, jsonb, jsonb, jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql(text, jsonb, jsonb, jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql(text, jsonb, jsonb, jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql(text, jsonb, jsonb, jsonb) TO service_role;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.set_graphql_placeholder() TO anon;
GRANT ALL ON FUNCTION graphql_public.set_graphql_placeholder() TO authenticated;
GRANT ALL ON FUNCTION graphql_public.set_graphql_placeholder() TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION set_current_tenant(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_current_tenant(tenant_id_input text) TO anon;
GRANT ALL ON FUNCTION public.set_current_tenant(tenant_id_input text) TO authenticated;
GRANT ALL ON FUNCTION public.set_current_tenant(tenant_id_input text) TO service_role;


--
-- Name: FUNCTION crypto_aead_det_decrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea); Type: ACL; Schema: pgsodium; Owner: pgsodium_key_maker
--

GRANT ALL ON FUNCTION pgsodium.crypto_aead_det_decrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea) TO service_role;


--
-- Name: FUNCTION crypto_aead_det_encrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea); Type: ACL; Schema: pgsodium; Owner: pgsodium_key_maker
--

GRANT ALL ON FUNCTION pgsodium.crypto_aead_det_encrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea) TO service_role;


--
-- Name: FUNCTION crypto_aead_det_keygen(); Type: ACL; Schema: pgsodium; Owner: pgsodium_key_maker
--

GRANT ALL ON FUNCTION pgsodium.crypto_aead_det_keygen() TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.schema_migrations TO dashboard_user;


--
-- Name: TABLE pgrst_api_keys; Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON TABLE extensions.pgrst_api_keys TO anon;
GRANT ALL ON TABLE extensions.pgrst_api_keys TO authenticated;
GRANT ALL ON TABLE extensions.pgrst_api_keys TO service_role;


--
-- Name: SEQUENCE pgrst_api_keys_id_seq; Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON SEQUENCE extensions.pgrst_api_keys_id_seq TO anon;
GRANT ALL ON SEQUENCE extensions.pgrst_api_keys_id_seq TO authenticated;
GRANT ALL ON SEQUENCE extensions.pgrst_api_keys_id_seq TO service_role;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE accounts; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.accounts TO anon;
GRANT ALL ON TABLE public.accounts TO authenticated;
GRANT ALL ON TABLE public.accounts TO service_role;


--
-- Name: TABLE audit_log; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.audit_log TO anon;
GRANT ALL ON TABLE public.audit_log TO authenticated;
GRANT ALL ON TABLE public.audit_log TO service_role;


--
-- Name: TABLE bills; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.bills TO anon;
GRANT ALL ON TABLE public.bills TO authenticated;
GRANT ALL ON TABLE public.bills TO service_role;


--
-- Name: TABLE bill_line_items; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.bill_line_items TO anon;
GRANT ALL ON TABLE public.bill_line_items TO authenticated;
GRANT ALL ON TABLE public.bill_line_items TO service_role;


--
-- Name: TABLE bill_payments; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.bill_payments TO anon;
GRANT ALL ON TABLE public.bill_payments TO authenticated;
GRANT ALL ON TABLE public.bill_payments TO service_role;


--
-- Name: TABLE customer_contacts; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.customer_contacts TO anon;
GRANT ALL ON TABLE public.customer_contacts TO authenticated;
GRANT ALL ON TABLE public.customer_contacts TO service_role;


--
-- Name: TABLE customer_interactions; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.customer_interactions TO anon;
GRANT ALL ON TABLE public.customer_interactions TO authenticated;
GRANT ALL ON TABLE public.customer_interactions TO service_role;


--
-- Name: TABLE customer_notes; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.customer_notes TO anon;
GRANT ALL ON TABLE public.customer_notes TO authenticated;
GRANT ALL ON TABLE public.customer_notes TO service_role;


--
-- Name: TABLE customers; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.customers TO anon;
GRANT ALL ON TABLE public.customers TO authenticated;
GRANT ALL ON TABLE public.customers TO service_role;


--
-- Name: TABLE departments; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.departments TO anon;
GRANT ALL ON TABLE public.departments TO authenticated;
GRANT ALL ON TABLE public.departments TO service_role;


--
-- Name: TABLE employees; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.employees TO anon;
GRANT ALL ON TABLE public.employees TO authenticated;
GRANT ALL ON TABLE public.employees TO service_role;


--
-- Name: TABLE expenses; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.expenses TO anon;
GRANT ALL ON TABLE public.expenses TO authenticated;
GRANT ALL ON TABLE public.expenses TO service_role;


--
-- Name: TABLE fiscal_periods; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.fiscal_periods TO anon;
GRANT ALL ON TABLE public.fiscal_periods TO authenticated;
GRANT ALL ON TABLE public.fiscal_periods TO service_role;


--
-- Name: TABLE journal_batches; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.journal_batches TO anon;
GRANT ALL ON TABLE public.journal_batches TO authenticated;
GRANT ALL ON TABLE public.journal_batches TO service_role;


--
-- Name: TABLE journal_entries; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.journal_entries TO anon;
GRANT ALL ON TABLE public.journal_entries TO authenticated;
GRANT ALL ON TABLE public.journal_entries TO service_role;


--
-- Name: TABLE ledger_entries; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.ledger_entries TO anon;
GRANT ALL ON TABLE public.ledger_entries TO authenticated;
GRANT ALL ON TABLE public.ledger_entries TO service_role;


--
-- Name: TABLE payslips; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.payslips TO anon;
GRANT ALL ON TABLE public.payslips TO authenticated;
GRANT ALL ON TABLE public.payslips TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- Name: TABLE sales_invoice_line_items; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.sales_invoice_line_items TO anon;
GRANT ALL ON TABLE public.sales_invoice_line_items TO authenticated;
GRANT ALL ON TABLE public.sales_invoice_line_items TO service_role;


--
-- Name: TABLE sales_invoices; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.sales_invoices TO anon;
GRANT ALL ON TABLE public.sales_invoices TO authenticated;
GRANT ALL ON TABLE public.sales_invoices TO service_role;


--
-- Name: TABLE stock_movements; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.stock_movements TO anon;
GRANT ALL ON TABLE public.stock_movements TO authenticated;
GRANT ALL ON TABLE public.stock_movements TO service_role;


--
-- Name: TABLE suppliers; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.suppliers TO anon;
GRANT ALL ON TABLE public.suppliers TO authenticated;
GRANT ALL ON TABLE public.suppliers TO service_role;


--
-- Name: TABLE tax_codes; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.tax_codes TO anon;
GRANT ALL ON TABLE public.tax_codes TO authenticated;
GRANT ALL ON TABLE public.tax_codes TO service_role;


--
-- Name: TABLE tenant_settings; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.tenant_settings TO anon;
GRANT ALL ON TABLE public.tenant_settings TO authenticated;
GRANT ALL ON TABLE public.tenant_settings TO service_role;


--
-- Name: TABLE tenant_users; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.tenant_users TO anon;
GRANT ALL ON TABLE public.tenant_users TO authenticated;
GRANT ALL ON TABLE public.tenant_users TO service_role;


--
-- Name: TABLE tenants; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.tenants TO anon;
GRANT ALL ON TABLE public.tenants TO authenticated;
GRANT ALL ON TABLE public.tenants TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE key; Type: ACL; Schema: pgsodium; Owner: pgsodium_key_holder
--

GRANT ALL ON TABLE pgsodium.key TO pgsodium_key_maker;


--
-- Name: TABLE masking_rule; Type: ACL; Schema: pgsodium; Owner: postgres
--

GRANT ALL ON TABLE pgsodium.masking_rule TO pgsodium_key_holder;


--
-- Name: TABLE masked_columns; Type: ACL; Schema: pgsodium; Owner: postgres
--

GRANT ALL ON TABLE pgsodium.masked_columns TO pgsodium_key_holder;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO anon;
GRANT ALL ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO anon;
GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth REVOKE ALL ON SEQUENCES FROM supabase_auth_admin;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth REVOKE ALL ON FUNCTIONS FROM supabase_auth_admin;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth REVOKE ALL ON TABLES FROM supabase_auth_admin;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: pgbouncer; Owner: pgbouncer
--

ALTER DEFAULT PRIVILEGES FOR ROLE pgbouncer IN SCHEMA pgbouncer REVOKE ALL ON SEQUENCES FROM pgbouncer;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: pgbouncer; Owner: pgbouncer
--

ALTER DEFAULT PRIVILEGES FOR ROLE pgbouncer IN SCHEMA pgbouncer REVOKE ALL ON FUNCTIONS FROM pgbouncer;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: pgbouncer; Owner: pgbouncer
--

ALTER DEFAULT PRIVILEGES FOR ROLE pgbouncer IN SCHEMA pgbouncer REVOKE ALL ON TABLES FROM pgbouncer;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime REVOKE ALL ON SEQUENCES FROM supabase_admin;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime REVOKE ALL ON FUNCTIONS FROM supabase_admin;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime REVOKE ALL ON TABLES FROM supabase_admin;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA storage REVOKE ALL ON SEQUENCES FROM supabase_admin;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA storage REVOKE ALL ON FUNCTIONS FROM supabase_admin;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA storage REVOKE ALL ON TABLES FROM supabase_admin;


--
-- Name: issue_graphql_placeholder; Type: SECURITY LABEL; Schema: graphql_public; Owner: supabase_admin
--

SECURITY LABEL FOR supabase ON FUNCTION graphql_public.set_graphql_placeholder() IS 'options=(isolated-storage-key="51889ee3-759f-5374-918c-308332997230")';


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1 (Debian 15.1-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: object_id(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.object_id(p_bucket_name text, p_object_name text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_bucket_id uuid;
    v_object_id uuid;
BEGIN
    SELECT id INTO v_bucket_id FROM storage.buckets WHERE name = p_bucket_name;
    IF v_bucket_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT id INTO v_object_id FROM storage.objects WHERE bucket_id = v_bucket_id AND name = p_object_name;
    RETURN v_object_id;
END;
$$;


ALTER FUNCTION storage.object_id(p_bucket_name text, p_object_name text) OWNER TO supabase_storage_admin;

--
-- Name: audit_trail; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_trail (
    id uuid NOT NULL,
    instance_id uuid,
    payload jsonb,
    created_at timestamp with time zone
)
PARTITION BY RANGE (created_at);


ALTER TABLE auth.audit_trail OWNER TO supabase_auth_admin;

--
-- Name: audit_trail_2024_06; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_trail_2024_06 (
    id uuid NOT NULL,
    instance_id uuid,
    payload jsonb,
    created_at timestamp with time zone
);


ALTER TABLE auth.audit_trail_2024_06 OWNER TO supabase_auth_admin;

--
-- Name: audit_trail_2024_07; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_trail_2024_07 (
    id uuid NOT NULL,
    instance_id uuid,
    payload jsonb,
    created_at timestamp with time zone
);


ALTER TABLE auth.audit_trail_2024_07 OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method character varying(10) NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    provider_id text NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type character varying(10) NOT NULL,
    status character varying(10) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type character varying(30) NOT NULL,
    token_hash text NOT NULL,
    rel_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    id bigint NOT NULL,
    instance_id uuid,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    from_ip_address inet,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal character varying(10),
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
)
PARTITION BY RANGE (created_at);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: sessions_2024_06; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions_2024_06 (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal character varying(10),
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions_2024_06 OWNER TO supabase_auth_admin;

--
-- Name: sessions_2024_07; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions_2024_07 (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal character varying(10),
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions_2024_07 OWNER TO supabase_auth_admin;

--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone character varying(15) DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change character varying(15) DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    email_change_token_new character varying(255) DEFAULT ''::character varying,
    email_change character varying(255) DEFAULT ''::character varying,
    email_change_sent_at timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    user_id_v2 character varying(36)
)
PARTITION BY RANGE (created_at);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: users_2024_06; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users_2024_06 (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone character varying(15) DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change character varying(15) DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    email_change_token_new character varying(255) DEFAULT ''::character varying,
    email_change character varying(255) DEFAULT ''::character varying,
    email_change_sent_at timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    user_id_v2 character varying(36)
);


ALTER TABLE auth.users_2024_06 OWNER TO supabase_auth_admin;

--
-- Name: users_2024_07; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users_2024_07 (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone character varying(15) DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change character varying(15) DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    email_change_token_new character varying(255) DEFAULT ''::character varying,
    email_change character varying(255) DEFAULT ''::character varying,
    email_change_sent_at timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    user_id_v2 character varying(36)
);


ALTER TABLE auth.users_2024_07 OWNER TO supabase_auth_admin;

--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[],
    version text,
    owner_id text
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL,
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL,
    etag text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: audit_trail_2024_06; Type: TABLE ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_trail ATTACH PARTITION auth.audit_trail_2024_06 FOR VALUES FROM ('2024-06-01 00:00:00+00') TO ('2024-07-01 00:00:00+00');


--
-- Name: audit_trail_2024_07; Type: TABLE ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_trail ATTACH PARTITION auth.audit_trail_2024_07 FOR VALUES FROM ('2024-07-01 00:00:00+00') TO ('2024-08-01 00:00:00+00');


--
-- Name: sessions_2024_06; Type: TABLE ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions ATTACH PARTITION auth.sessions_2024_06 FOR VALUES FROM ('2024-06-01 00:00:00+00') TO ('2024-07-01 00:00:00+00');


--
-- Name: sessions_2024_07; Type: TABLE ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions ATTACH PARTITION auth.sessions_2024_07 FOR VALUES FROM ('2024-07-01 00:00:00+00') TO ('2024-08-01 00:00:00+00');


--
-- Name: users_2024_06; Type: TABLE ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users ATTACH PARTITION auth.users_2024_06 FOR VALUES FROM ('2024-06-01 00:00:00+00') TO ('2024-07-01 00:00:00+00');


--
-- Name: users_2024_07; Type: TABLE ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users ATTACH PARTITION auth.users_2024_07 FOR VALUES FROM ('2024-07-01 00:00:00+00') TO ('2024-08-01 00:00:00+00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: audit_trail audit_trail_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_trail
    ADD CONSTRAINT audit_trail_pkey PRIMARY KEY (id, created_at);


--
-- Name: audit_trail_2024_06 audit_trail_2024_06_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_trail_2024_06
    ADD CONSTRAINT audit_trail_2024_06_pkey PRIMARY KEY (id, created_at);


--
-- Name: audit_trail_2024_07 audit_trail_2024_07_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_trail_2024_07
    ADD CONSTRAINT audit_trail_2024_07_pkey PRIMARY KEY (id, created_at);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (provider_id, user_id);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_pkey PRIMARY KEY (id);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id, created_at);


--
-- Name: sessions_2024_06 sessions_2024_06_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions_2024_06
    ADD CONSTRAINT sessions_2024_06_pkey PRIMARY KEY (id, created_at);


--
-- Name: sessions_2024_07 sessions_2024_07_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions_2024_07
    ADD CONSTRAINT sessions_2024_07_pkey PRIMARY KEY (id, created_at);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email) PARTITION BY RANGE (created_at);


--
-- Name: users_2024_06 users_2024_06_email_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users_2024_06
    ADD CONSTRAINT users_2024_06_email_key UNIQUE (email);


--
-- Name: users_2024_07 users_2024_07_email_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users_2024_07
    ADD CONSTRAINT users_2024_07_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone) PARTITION BY RANGE (created_at);


--
-- Name: users_2024_06 users_2024_06_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users_2024_06
    ADD CONSTRAINT users_2024_06_phone_key UNIQUE (phone);


--
-- Name: users_2024_07 users_2024_07_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users_2024_07
    ADD CONSTRAINT users_2024_07_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id, created_at);


--
-- Name: users_2024_06 users_2024_06_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users_2024_06
    ADD CONSTRAINT users_2024_06_pkey PRIMARY KEY (id, created_at);


--
-- Name: users_2024_07 users_2024_07_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users_2024_07
    ADD CONSTRAINT users_2024_07_pkey PRIMARY KEY (id, created_at);


--
-- Name: users users_user_id_v2_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_user_id_v2_key UNIQUE (user_id_v2) PARTITION BY RANGE (created_at);


--
-- Name: users_2024_06 users_2024_06_user_id_v2_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users_2024_06
    ADD CONSTRAINT users_2024_06_user_id_v2_key UNIQUE (user_id_v2);


--
-- Name: users_2024_07 users_2024_07_user_id_v2_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users_2024_07
    ADD CONSTRAINT users_2024_07_user_id_v2_key UNIQUE (user_id_v2);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: audit_trail_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_trail_created_at_idx ON auth.audit_trail USING btree (created_at);


--
-- Name: audit_trail_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_trail_instance_id_idx ON auth.audit_trail USING btree (instance_id);


--
-- Name: audit_trail_2024_06_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_trail_2024_06_created_at_idx ON auth.audit_trail_2024_06 USING btree (created_at);


--
-- Name: audit_trail_2024_06_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_trail_2024_06_instance_id_idx ON auth.audit_trail_2024_06 USING btree (instance_id);


--
-- Name: audit_trail_2024_07_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_trail_2024_07_created_at_idx ON auth.audit_trail_2024_07 USING btree (created_at);


--
-- Name: audit_trail_2024_07_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_trail_2024_07_instance_id_idx ON auth.audit_trail_2024_07 USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE (confirmation_token !~~ '-%'::text);


--
-- Name: confirmation_token_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.confirmation_token_idx ATTACH PARTITION auth.users_2024_06;


--
-- Name: confirmation_token_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.confirmation_token_idx ATTACH PARTITION auth.users_2024_07;


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE (email_change_token_current !~~ '-%'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.email_change_token_current_idx ATTACH PARTITION auth.users_2024_06;


--
-- Name: email_change_token_current_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.email_change_token_current_idx ATTACH PARTITION auth.users_2024_07;


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE (email_change_token_new !~~ '-%'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.email_change_token_new_idx ATTACH PARTITION auth.users_2024_06;


--
-- Name: email_change_token_new_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.email_change_token_new_idx ATTACH PARTITION auth.users_2024_07;


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: flow_state_user_id_authentication_method_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_user_id_authentication_method_idx ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: identities_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_provider_id_idx ON auth.identities USING btree (provider_id);


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_one_time_tokens_token_hash; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX idx_one_time_tokens_token_hash ON auth.one_time_tokens USING btree (token_hash);


--
-- Name: idx_one_time_tokens_user_id_token_type; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_one_time_tokens_user_id_token_type ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: idx_user_id_provider; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX idx_user_id_provider ON auth.identities USING btree (user_id, provider);


--
-- Name: mfa_amr_claims_session_id_authentication_method_pkey; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_amr_claims_session_id_authentication_method_pkey ON auth.mfa_amr_claims USING btree (session_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE (reauthentication_token !~~ '-%'::text);


--
-- Name: reauthentication_token_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.reauthentication_token_idx ATTACH PARTITION auth.users_2024_06;


--
-- Name: reauthentication_token_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.reauthentication_token_idx ATTACH PARTITION auth.users_2024_07;


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE (recovery_token !~~ '-%'::text);


--
-- Name: recovery_token_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.recovery_token_idx ATTACH PARTITION auth.users_2024_06;


--
-- Name: recovery_token_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.recovery_token_idx ATTACH PARTITION auth.users_2024_07;


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_token_idx ON auth.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_created_at_idx ON auth.sessions USING btree (created_at);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sessions_2024_06_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_2024_06_created_at_idx ON auth.sessions_2024_06 USING btree (created_at);


--
-- Name: sessions_2024_06_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_2024_06_user_id_idx ON auth.sessions_2024_06 USING btree (user_id);


--
-- Name: sessions_2024_07_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_2024_07_created_at_idx ON auth.sessions_2024_07 USING btree (created_at);


--
-- Name: sessions_2024_07_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_2024_07_user_id_idx ON auth.sessions_2024_07 USING btree (user_id);


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_created_at_idx ON auth.users USING btree (created_at);


--
-- Name: users_email_partial_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_email_partial_idx ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: users_email_partial_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.users_email_partial_idx ATTACH PARTITION auth.users_2024_06;


--
-- Name: users_email_partial_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.users_email_partial_idx ATTACH PARTITION auth.users_2024_07;


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, email);


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: users_is_anonymous_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.users_is_anonymous_idx ATTACH PARTITION auth.users_2024_06;


--
-- Name: users_is_anonymous_idx; Type: INDEX ATTACH; Schema: auth; Owner: supabase_auth_admin
--

ALTER INDEX auth.users_is_anonymous_idx ATTACH PARTITION auth.users_2024_07;


--
-- Name: users_2024_06_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_06_created_at_idx ON auth.users_2024_06 USING btree (created_at);


--
-- Name: users_2024_06_email_partial_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_06_email_partial_idx ON auth.users_2024_06 USING btree (email) WHERE (is_sso_user = false);


--
-- Name: users_2024_06_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_06_instance_id_email_idx ON auth.users_2024_06 USING btree (instance_id, email);


--
-- Name: users_2024_06_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_06_instance_id_idx ON auth.users_2024_06 USING btree (instance_id);


--
-- Name: users_2024_06_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_06_is_anonymous_idx ON auth.users_2024_06 USING btree (is_anonymous);


--
-- Name: users_2024_07_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_07_created_at_idx ON auth.users_2024_07 USING btree (created_at);


--
-- Name: users_2024_07_email_partial_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_07_email_partial_idx ON auth.users_2024_07 USING btree (email) WHERE (is_sso_user = false);


--
-- Name: users_2024_07_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_07_instance_id_email_idx ON auth.users_2024_07 USING btree (instance_id, email);


--
-- Name: users_2024_07_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_07_instance_id_idx ON auth.users_2024_07 USING btree (instance_id);


--
-- Name: users_2024_07_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_2024_07_is_anonymous_idx ON auth.users_2024_07 USING btree (is_anonymous);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: part_number_upload_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX part_number_upload_id_idx ON storage.s3_multipart_uploads_parts USING btree (upload_id, part_number);


--
-- Name: s3_multipart_uploads_bucket_id_key_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX s3_multipart_uploads_bucket_id_key_idx ON storage.s3_multipart_uploads USING btree (bucket_id, key);


--
-- Name: users_2024_06; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER tr_check_and_set_user_id_v2 BEFORE INSERT ON auth.users_2024_06 FOR EACH ROW EXECUTE FUNCTION auth.check_and_set_user_id_v2();


--
-- Name: users_2024_07; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER tr_check_and_set_user_id_v2 BEFORE INSERT ON auth.users_2024_07 FOR EACH ROW EXECUTE FUNCTION auth.check_and_set_user_id_v2();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id) REFERENCES auth.users(id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id) REFERENCES auth.sessions(id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id) REFERENCES auth.users(id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id) REFERENCES auth.users(id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id, session_id) REFERENCES auth.sessions(id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id) REFERENCES auth.users(id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id);


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime FOR ALL TABLES;


--
-- Name: pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres;
GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO anon;
GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO authenticated;
GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO service_role;


--
-- Name: pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres;
GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO anon;
GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO authenticated;
GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO service_role;


--
-- Name: TABLE audit_trail; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_trail TO dashboard_user;
GRANT ALL ON TABLE auth.audit_trail TO postgres;


--
-- Name: TABLE audit_trail_2024_06; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_trail_2024_06 TO dashboard_user;
GRANT ALL ON TABLE auth.audit_trail_2024_06 TO postgres;


--
-- Name: TABLE audit_trail_2024_07; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_trail_2024_07 TO dashboard_user;
GRANT ALL ON TABLE auth.audit_trail_2024_07 TO postgres;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.flow_state TO dashboard_user;
GRANT ALL ON TABLE auth.flow_state TO postgres;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.identities TO dashboard_user;
GRANT ALL ON TABLE auth.identities TO postgres;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT ALL ON TABLE auth.instances TO postgres;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;
GRANT ALL ON TABLE auth.mfa_amr_claims TO postgres;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;
GRANT ALL ON TABLE auth.mfa_challenges TO postgres;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;
GRANT ALL ON TABLE auth.mfa_factors TO postgres;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;
GRANT ALL ON TABLE auth.one_time_tokens TO postgres;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT ALL ON TABLE auth.refresh_tokens TO postgres;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;
GRANT ALL ON TABLE auth.saml_providers TO postgres;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;
GRANT ALL ON TABLE auth.saml_relay_states TO postgres;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.sessions TO dashboard_user;
GRANT ALL ON TABLE auth.sessions TO postgres;


--
-- Name: TABLE sessions_2024_06; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.sessions_2024_06 TO dashboard_user;
GRANT ALL ON TABLE auth.sessions_2024_06 TO postgres;


--
-- Name: TABLE sessions_2024_07; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.sessions_2024_07 TO dashboard_user;
GRANT ALL ON TABLE auth.sessions_2024_07 TO postgres;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;
GRANT ALL ON TABLE auth.sso_domains TO postgres;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;
GRANT ALL ON TABLE auth.sso_providers TO postgres;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT ALL ON TABLE auth.users TO postgres;


--
-- Name: TABLE users_2024_06; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users_2024_06 TO dashboard_user;
GRANT ALL ON TABLE auth.users_2024_06 TO postgres;


--
-- Name: TABLE users_2024_07; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users_2024_07 TO dashboard_user;
GRANT ALL ON TABLE auth.users_2024_07 TO postgres;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO postgres;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.migrations TO postgres;
GRANT ALL ON TABLE storage.migrations TO anon;
GRANT ALL ON TABLE storage.migrations TO authenticated;
GRANT ALL ON TABLE storage.migrations TO service_role;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO postgres;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO postgres;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO postgres;


--
-- PostgreSQL database dump complete
--
