CREATE TABLE IF NOT EXISTS stay_state (
    id text PRIMARY KEY,
    data jsonb NOT NULL,
    version bigint NOT NULL DEFAULT 1,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stay_state_updated_at_idx ON stay_state (updated_at DESC);
