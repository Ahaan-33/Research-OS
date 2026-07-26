-- [[15-Canonical-Data-Model]] physical schema, per ADR-0003 (hand-written SQL,
-- no ORM) and Reference Implementation Strategy §3 (event log + materialized
-- read model). Doc15's logical schema is authoritative; this is one physical
-- encoding of it.

CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL);

-- Materialized read model -----------------------------------------------

CREATE TABLE IF NOT EXISTS elements (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('content','relation')),
  kind TEXT,                  -- content only
  relation_type TEXT,         -- relation only
  endpoints TEXT,             -- relation only; JSON array of ElementId
  payload TEXT,               -- content only; JSON, opaque (Doc15 "payload opacity")
  prov TEXT NOT NULL          -- JSON ProvenanceExpr (D10.2 — non-optional)
);

-- Index-backed derived view: Current(E) = elements not named as `old` (endpoints[1])
-- by any relation element with relation_type = 'supersedes'.
CREATE TABLE IF NOT EXISTS supersessions (
  new_id TEXT NOT NULL,
  old_id TEXT NOT NULL,
  PRIMARY KEY (new_id, old_id)
);
CREATE INDEX IF NOT EXISTS idx_supersessions_old ON supersessions(old_id);

CREATE TABLE IF NOT EXISTS dimensions (
  id TEXT PRIMARY KEY,
  value_space TEXT NOT NULL,     -- JSON ValueSpaceSpec
  registered_at INTEGER NOT NULL,
  registered_by TEXT NOT NULL    -- JSON ProvenanceExpr
);

CREATE TABLE IF NOT EXISTS coordinate_status (
  element TEXT NOT NULL,
  dimension TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('examined')),  -- 'unexamined' = absent row (D14 / Doc15)
  PRIMARY KEY (element, dimension)
);

CREATE TABLE IF NOT EXISTS coordinate_values (
  element TEXT NOT NULL,
  dimension TEXT NOT NULL,
  seq INTEGER NOT NULL,          -- ordinal within this (element,dimension); not a causality claim
  value TEXT NOT NULL,           -- JSON
  prov TEXT NOT NULL,            -- JSON ProvenanceExpr
  written_at INTEGER NOT NULL,
  PRIMARY KEY (element, dimension, seq)
);
-- Index-backed derived view: Conflicts(S) = pairs with >=2 distinct values.
CREATE INDEX IF NOT EXISTS idx_coordinate_values_pair ON coordinate_values(element, dimension);

-- Event log (source of truth; read model above is its fold) --------------

CREATE TABLE IF NOT EXISTS events (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  act_type TEXT NOT NULL,   -- capture | supersede | interpret | synthesis_batch
  payload TEXT NOT NULL,    -- JSON — exactly what was applied to the read model
  committed_at INTEGER NOT NULL
);
