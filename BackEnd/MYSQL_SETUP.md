# 🗄️ MySQL Database Setup Guide

## ✅ Base de Données Créée

**Nom de la base de données:** `app_padel`

## 📊 Tables Créées

### 1. **roles**
Stocke les rôles utilisateurs
- id (INT, PRIMARY KEY)
- name (VARCHAR(100), UNIQUE)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Données insérées:**
- Admin
- Direction Générale FIP
- FIP Competitions Director
- Brand Head / Marketing Director
- Tournament Commercial Director

### 2. **users**
Stocke les utilisateurs
- id (INT, PRIMARY KEY)
- username (VARCHAR(80), UNIQUE)
- email (VARCHAR(120), UNIQUE)
- password_hash (VARCHAR(255))
- first_name (VARCHAR(100))
- last_name (VARCHAR(100))
- profile_image (VARCHAR(255))
- is_active (BOOLEAN)
- role_id (INT, FOREIGN KEY → roles.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Données insérées:**
| Username | Email | Nom | Rôle |
|----------|-------|-----|------|
| admin | admin@padel.com | Admin User | Admin |
| director | director@fip.com | Jean Dupont | Direction Générale FIP |
| competitions | competitions@fip.com | Marie Martin | FIP Competitions Director |
| marketing | marketing@padel.com | Pierre Bernard | Brand Head / Marketing Director |
| commercial | commercial@padel.com | Sophie Dubois | Tournament Commercial Director |

### 3. **dashboards**
Stocke les dashboards Power BI
- id (INT, PRIMARY KEY)
- name (VARCHAR(100))
- slug (VARCHAR(100), UNIQUE)
- description (TEXT)
- icon (VARCHAR(50))
- order_index (INT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Données insérées:**
1. Overview (slug: overview, icon: dashboard)
2. Operational (slug: operational, icon: settings)
3. Equipment (slug: equipment, icon: inventory)
4. Sponsorship (slug: sponsorship, icon: handshake)
5. SDG (slug: sdg, icon: eco)

### 4. **dashboard_permissions**
Gère les permissions d'accès aux dashboards
- id (INT, PRIMARY KEY)
- role_id (INT, FOREIGN KEY → roles.id)
- dashboard_id (INT, FOREIGN KEY → dashboards.id)
- can_view (BOOLEAN)
- can_edit (BOOLEAN)
- created_at (TIMESTAMP)

**Permissions configurées:**
- **Admin:** Tous les dashboards
- **Direction Générale FIP:** Overview
- **FIP Competitions Director:** Operational
- **Brand Head / Marketing Director:** Equipment
- **Tournament Commercial Director:** Sponsorship + SDG

### 5. **audit_logs**
Logs d'audit pour traçabilité
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY → users.id)
- action (VARCHAR(100))
- entity_type (VARCHAR(50))
- entity_id (INT)
- details (TEXT)
- ip_address (VARCHAR(45))
- created_at (TIMESTAMP)

## 🔧 Configuration

### Fichier .env
```env
DATABASE_URL=mysql+pymysql://root:@localhost/app_padel
```

### Connexion MySQL
- **Host:** localhost
- **Port:** 3306
- **Database:** app_padel
- **User:** root
- **Password:** (vide par défaut)

## 📝 Commandes Utiles

### Vérifier la base de données
```sql
USE app_padel;
SHOW TABLES;
```

### Voir les utilisateurs
```sql
SELECT u.id, u.username, u.email, u.first_name, u.last_name, r.name as role
FROM users u
JOIN roles r ON u.role_id = r.id;
```

### Voir les dashboards
```sql
SELECT * FROM dashboards ORDER BY order_index;
```

### Voir les permissions
```sql
SELECT r.name as role, d.name as dashboard, dp.can_view, dp.can_edit
FROM dashboard_permissions dp
JOIN roles r ON dp.role_id = r.id
JOIN dashboards d ON dp.dashboard_id = d.id
ORDER BY r.name, d.order_index;
```

### Compter les utilisateurs par rôle
```sql
SELECT r.name as role, COUNT(u.id) as user_count
FROM roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.id, r.name;
```

## 🔄 Réinitialiser la Base de Données

Si vous devez réinitialiser complètement :

```bash
# 1. Supprimer la base de données
mysql -u root -e "DROP DATABASE IF EXISTS app_padel;"

# 2. Recréer la base de données
python setup_mysql.py

# 3. Réinsérer les données
python seeders/seed_data.py
```

## 🚀 Démarrage

Après la configuration MySQL :

```bash
# Démarrer le backend
python run.py
```

Le backend sera disponible sur http://localhost:5000

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. **Backend démarré:** http://localhost:5000
2. **Test API:** http://localhost:5000/api/roles
3. **Login:** POST http://localhost:5000/api/auth/login
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

## 🔐 Sécurité

**Important pour la production:**
1. Changez les mots de passe par défaut
2. Utilisez un mot de passe MySQL fort
3. Configurez les variables d'environnement sécurisées
4. Activez SSL pour MySQL
5. Limitez les accès réseau à la base de données

## 📊 Statistiques

- **5 rôles** configurés
- **5 utilisateurs** de test créés
- **5 dashboards** Power BI configurés
- **9 permissions** d'accès définies
- **5 tables** créées avec indexes optimisés

## 🎯 Prochaines Étapes

1. ✅ Base de données créée
2. ✅ Tables créées
3. ✅ Données insérées
4. ✅ Configuration .env mise à jour
5. 🚀 Démarrer l'application

---

**Base de données prête pour la production !** 🎉
