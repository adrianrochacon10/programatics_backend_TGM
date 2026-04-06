SET
	session_replication_role = replica;

--
-- PostgreSQL database dump
--
-- \restrict yK1AVTleLyoSqhyRnjN3hBXFMgzUQ5o4cSceMesLqeP81w2si7XYWtaT8IrzCYR
-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6
SET
	statement_timeout = 0;

SET
	lock_timeout = 0;

SET
	idle_in_transaction_session_timeout = 0;

SET
	transaction_timeout = 0;

SET
	client_encoding = 'UTF8';

SET
	standard_conforming_strings = on;

SELECT
	pg_catalog.set_config ('search_path', '', false);

SET
	check_function_bodies = false;

SET
	xmloption = content;

SET
	client_min_messages = warning;

SET
	row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
--
-- Data for Name: pantallas; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO
	"public"."pantallas" (
		"id",
		"nombre",
		"direccion",
		"url_direccion",
		"lat",
		"lng",
		"resolucion",
		"medidas",
		"precio",
		"hora_inicio",
		"hora_fin",
		"foto",
		"impactos",
		"status",
		"created_at",
		"updated_at"
	)
VALUES
	(
		'48e69cec-71c9-4d64-b123-2dc6af81b140',
		'Pantalla Acceso Principal',
		'Del Guadiana 224, Loma Dorada, 34104 Durango, Dgo.',
		'https://maps.app.goo.gl/GXDwhW6kUXRjzCvu9',
		24.0204446,
		-104.6461816,
		'1280 x 960 px',
		'3.20 x 2.40 mts',
		499.00,
		NULL,
		NULL,
		NULL,
		NULL,
		'active',
		'2026-03-24 19:25:01.139695+00',
		'2026-03-24 19:25:01.139695+00'
	),
	(
		'b2049f1d-a70a-4dca-9e66-a7599358bfc0',
		'Pantalla Acceso Walmart',
		'Del Guadiana 224, Loma Dorada, 34104 Durango, Dgo.',
		'https://maps.app.goo.gl/GXDwhW6kUXRjzCvu9',
		24.0360496,
		-104.6504338,
		'768 x 960 px',
		'1.92 x 2.40 mts',
		499.00,
		NULL,
		NULL,
		NULL,
		NULL,
		'active',
		'2026-03-24 19:37:37.106249+00',
		'2026-03-24 19:37:37.106249+00'
	),
	(
		'd5dfd773-d8bf-4204-82e1-c05c95bb6f46',
		'Pantalla Libertad',
		'Libertad 719, Las Playas, 34260 Durango, Dgo.',
		'https://maps.app.goo.gl/qL1ktFcsPvBfpoxp8',
		24.0208336,
		-104.6687463,
		'800 x 1280 px',
		'5.00 x 8.00 mts',
		499.00,
		NULL,
		NULL,
		NULL,
		NULL,
		'active',
		'2026-03-24 19:44:17.692629+00',
		'2026-03-24 19:44:17.692629+00'
	),
	(
		'493fa118-58c9-45fe-901e-89105d67baa0',
		'Pantalla Central',
		'Camionera 30, Col del Maestro, 34240 Durango, Dgo.',
		'https://maps.app.goo.gl/AW3g32vNSRb8kEjQ8',
		24.0062053,
		-104.6627397,
		'800 x 1280 px',
		'5.00 x 8.00 mts',
		499.00,
		NULL,
		NULL,
		NULL,
		NULL,
		'active',
		'2026-03-24 19:57:23.886963+00',
		'2026-03-24 19:57:23.886963+00'
	);

INSERT INTO
	"public"."planes" (
		"id",
		"dias",
		"spots_dia",
		"precio",
		"activo",
		"creado_en"
	)
VALUES
	(
		'1cce88e4-8861-4391-b2fb-0b03c8158ff8',
		1,
		6,
		199.00,
		true,
		now ()
	),
	(
		'2f1500fa-cffd-4be6-9e59-59b8b005e79b',
		3,
		6,
		499.00,
		true,
		now ()
	),
	(
		'a1357741-e9f7-4f31-b93b-aa502ba0656d',
		7,
		6,
		999.00,
		true,
		now ()
	);

--
-- Data for Name: planes; Type: TABLE DATA; Schema: public; Owner: postgres
--
--
-- Data for Name: reservaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--
--
-- Data for Name: contenido; Type: TABLE DATA; Schema: public; Owner: postgres
--
--
-- Data for Name: disponibilidad_dia; Type: TABLE DATA; Schema: public; Owner: postgres
--
--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: postgres
--
--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--
--
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--
--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--
INSERT INTO
	"storage"."buckets" (
		"id",
		"name",
		"owner",
		"created_at",
		"updated_at",
		"public",
		"avif_autodetection",
		"file_size_limit",
		"allowed_mime_types",
		"owner_id",
		"type"
	)
VALUES
	(
		'fotos_pantallas',
		'fotos_pantallas',
		NULL,
		'2026-03-24 19:56:54.594562+00',
		'2026-03-24 19:56:54.594562+00',
		false,
		false,
		NULL,
		NULL,
		NULL,
		'STANDARD'
	);

--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--
--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--
--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--
--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--
--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--
--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--
--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--
SELECT
	pg_catalog.setval ('"auth"."refresh_tokens_id_seq"', 1, false);

--
-- PostgreSQL database dump complete
--
-- \unrestrict yK1AVTleLyoSqhyRnjN3hBXFMgzUQ5o4cSceMesLqeP81w2si7XYWtaT8IrzCYR
RESET ALL;