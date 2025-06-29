import psycopg2
import csv
import requests
import time

# === Configuration de la base de données ===
# Configuration PostgreSQL
DB_CONFIG = {
    "host": "localhost",
    "database": "stations_service",     # ⇦ Remplace par le nom de ta base
    "user": "postgres",         # ⇦ Remplace par ton user PostgreSQL
    "password": "steve",    # ⇦ Ton mot de passe PostgreSQL
    "port": 5432
}


CSV_OUTPUT = 'routes_with_coords.csv'
OVERPASS_URL = "http://overpass-api.de/api/interpreter"

# === Fonction pour récupérer le centre géographique d'un way ===
def get_way_center(osm_id):
    if not osm_id or not osm_id.startswith("way/"):
        return None, None
    way_id = osm_id.split("/")[1]
    query = f"""
    [out:json];
    way({way_id});
    out center;
    """
    try:
        response = requests.post(OVERPASS_URL, data={'data': query})
        response.raise_for_status()
        data = response.json()
        elements = data.get("elements", [])
        if elements and "center" in elements[0]:
            center = elements[0]["center"]
            return center["lat"], center["lon"]
    except Exception as e:
        print(f"[!] Erreur pour {osm_id}: {e}")
    return None, None

# === Connexion à la base ===
conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

# On récupère toutes les colonnes sauf geom
cur.execute("""
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'route'
    AND column_name != 'geom'
    ORDER BY ordinal_position
""")
columns = [r[0] for r in cur.fetchall()]
columns += ['latitude', 'longitude']

# On sélectionne les données
cur.execute("SELECT * FROM route")
rows = cur.fetchall()

# === Écriture dans le CSV ===
with open(CSV_OUTPUT, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(columns)

    for row in rows:
        row_dict = dict(zip(columns[:-2], row))
        osm_id = row_dict.get("highway")
        lat, lon = get_way_center(osm_id)
        csv_row = list(row_dict.values()) + [lat, lon]
        writer.writerow(csv_row)
        time.sleep(1.5)  # Important pour ne pas saturer Overpass

cur.close()
conn.close()
print(f"[✔] CSV généré avec latitude/longitude : {CSV_OUTPUT}")
