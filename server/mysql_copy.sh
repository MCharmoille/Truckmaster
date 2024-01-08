#!/bin/bash

# Paramètres de connexion à la base de données distante (VPS)
remote_db_host="37.187.55.12"
remote_db_user="maxime"
remote_db_password="MotdS!"
remote_db_name="ohtruckdesesse"

# Paramètres de connexion à la base de données locale (SQLWorkbench)
local_db_user="root"
local_db_password=""
local_db_name="ohtruckdesesse"

# Chemin où vous souhaitez sauvegarder le dump SQL
backup_dir="D:\save_truckmaster\mysql"

# Nom du fichier de sauvegarde
backup_file="backup.sql"

# Exécute la commande mysqldump pour sauvegarder la base de données distante
mysqldump -h $remote_db_host -u $remote_db_user -p$remote_db_password --default-character-set=utf8 $remote_db_name > $backup_dir/$backup_file

# Importe la sauvegarde dans la base de données locale
# mysql -u $local_db_user -p$local_db_password $local_db_name < $backup_dir/$backup_file

# # Supprime le fichier de sauvegarde s'il est confidentiel (assurez-vous que la sauvegarde est sécurisée)
# rm $backup_dir/$backup_file

echo "La copie de la base de données a été effectuée avec succès."
