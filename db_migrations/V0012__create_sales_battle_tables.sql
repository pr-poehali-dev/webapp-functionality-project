-- Create sales_managers table
CREATE TABLE IF NOT EXISTS sales_managers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    company_id INTEGER NOT NULL REFERENCES companies(id),
    avatar VARCHAR(10) NOT NULL,
    level INTEGER DEFAULT 1,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_a_id INTEGER NOT NULL REFERENCES companies(id),
    company_b_id INTEGER NOT NULL REFERENCES companies(id),
    prize_pool INTEGER DEFAULT 20000,
    status VARCHAR(20) DEFAULT 'setup',
    winner_id INTEGER REFERENCES sales_managers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create tournament_matches table
CREATE TABLE IF NOT EXISTS tournament_matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
    round INTEGER NOT NULL,
    match_order INTEGER NOT NULL,
    player1_id INTEGER REFERENCES sales_managers(id),
    player2_id INTEGER REFERENCES sales_managers(id),
    winner_id INTEGER REFERENCES sales_managers(id),
    score1 INTEGER DEFAULT 0,
    score2 INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    battle_log JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create battle_sessions table (for detailed battle logs)
CREATE TABLE IF NOT EXISTS battle_sessions (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES tournament_matches(id),
    manager_id INTEGER NOT NULL REFERENCES sales_managers(id),
    current_phase VARCHAR(20) DEFAULT 'greeting',
    chat_history JSONB DEFAULT '[]',
    phase_scores JSONB DEFAULT '{}',
    total_score INTEGER DEFAULT 0,
    timer_remaining INTEGER DEFAULT 300,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_managers_user_id ON sales_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_managers_company_id ON sales_managers(company_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_status ON tournament_matches(status);
CREATE INDEX IF NOT EXISTS idx_battle_sessions_match_id ON battle_sessions(match_id);
CREATE INDEX IF NOT EXISTS idx_battle_sessions_manager_id ON battle_sessions(manager_id);