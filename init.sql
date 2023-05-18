-- Create the rights table
CREATE TABLE IF NOT EXISTS rights (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

-- Insert the rights data
INSERT INTO rights (name, description)
VALUES
  ('users:create', 'Créer un autre Dresseur'),
  ('users:read', 'Récupérer les informations des Dresseurs'),
  ('users:update:self', 'Modifier les informations du Dresseur authentifié'),
  ('users:update:all', 'Modifier les informations de n’importe quel Dresseur ainsi que ses droits'),
  ('users:delete:self', 'Supprimer le Dresseur authentifié'),
  ('users:delete:all', 'Supprimer n’importe quel Dresseur'),
  ('pokemons:create:self', 'Créer des Pokémons liés au Dresseur authentifié'),
  ('pokemons:create:all', 'Créer des Pokémons liés à n’importe quel Dresseur'),
  ('pokemons:read', 'Récupérer les informations des Pokémons'),
  ('pokemons:update:self', 'Modifier les informations des Pokémons liés au Dresseur authentifié'),
  ('pokemons:update:all', 'Modifier les informations des Pokémons liés à n’importe quel Dresseur'),
  ('pokemons:delete:self', 'Supprimer des Pokémons liés au Dresseur authentifié'),
  ('pokemons:delete:all', 'Supprimer des Pokémons liés à n’importe quel Dresseur'),
  ('trade:create:self', 'Créer un échange de la part du Dresseur authentifié'),
  ('trade:create:all', 'Créer un échange de la part de nn’importe quel Dresseur'),
  ('trade:read', 'Récupérer les informations des échanges'),
  ('trade:update:self', 'Accepter ou refuser un échange que le Dresseur a reçu'),
  ('trade:update:all', 'Accepter ou refuser un échange que n’importe quel Dresseur a reçu'),
  ('logs:read', 'Récupérer les logs de l’application');

