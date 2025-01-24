/*
  # Schéma de gamification

  1. Nouvelles Tables
    - `user_profiles`
      - Stocke les pseudonymes des utilisateurs
      - Lié à l'authentification Supabase
    
    - `city_objectives`
      - Objectifs personnalisés par ville
      - Nombre de portes visées
    
    - `user_progress`
      - Progression globale de l'utilisateur
      - Niveau actuel, XP total
    
    - `achievements`
      - Liste des succès disponibles
      - Nom, description, conditions, icône
    
    - `user_achievements`
      - Succès débloqués par utilisateur
      - Date de déblocage
    
    - `gaming_sessions`
      - Sessions de jeu
      - Séries complétées, pauses
    
  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour accès utilisateur uniquement
*/

-- Profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Objectifs par ville
CREATE TABLE IF NOT EXISTS city_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id text NOT NULL,
  target_doors integer NOT NULL DEFAULT 1000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, city_id)
);

-- Progression utilisateur
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level integer NOT NULL DEFAULT 1,
  total_xp integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Succès disponibles
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  icon text,
  xp_reward integer NOT NULL DEFAULT 0,
  conditions jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Succès débloqués
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Sessions de jeu
CREATE TABLE IF NOT EXISTS gaming_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  series_completed integer DEFAULT 0,
  doors_visited integer DEFAULT 0,
  current_series_doors integer DEFAULT 0,
  last_door_time timestamptz,
  status text DEFAULT 'active',
  pause_started_at timestamptz
);

-- Activer RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaming_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own objectives"
  ON city_objectives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own objectives"
  ON city_objectives FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own unlocked achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own gaming sessions"
  ON gaming_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_city_objectives_updated_at
  BEFORE UPDATE ON city_objectives
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insertion des succès de base
INSERT INTO achievements (name, description, category, xp_reward, conditions) VALUES
  ('Première poignée', 'Visiter 10 portes', 'progression', 100, '{"doors_visited": 10}'),
  ('Marcheur de rue', 'Visiter 100 portes', 'progression', 500, '{"doors_visited": 100}'),
  ('Maître des clés', 'Visiter 500 portes', 'progression', 1000, '{"doors_visited": 500}'),
  ('Échauffement', 'Terminer une série de 10 portes', 'series', 200, '{"series_completed": 1}'),
  ('Endurant', 'Terminer 5 séries consécutives', 'series', 500, '{"consecutive_series": 5}'),
  ('Marathonien', 'Réaliser 10 séries sans pause', 'series', 1000, '{"series_without_pause": 10}'),
  ('Visite rapide', '10 portes en moins de 15 minutes', 'bonus', 300, '{"doors": 10, "time_limit": 900}'),
  ('No pain no gain', 'Compléter une série après un échec', 'bonus', 200, '{"complete_after_fail": true}')
ON CONFLICT DO NOTHING;