import csv
import time
import requests
import psycopg2

# Configuration PostgreSQL
DB_CONFIG = {
    "host": "localhost",
    "database": "stations_service",     # ⇦ Remplace par le nom de ta base
    "user": "postgres",         # ⇦ Remplace par ton user PostgreSQL
    "password": "steve",    # ⇦ Ton mot de passe PostgreSQL
    "port": 5432
}

def get_coordinates(osm_id):
    try:
        node_id = str(osm_id)
        if '/' in node_id:
            node_id = node_id.split('/')[1]
        query = f"""
        [out:json];
        node({node_id});
        out body;
        """
        response = requests.post("http://overpass-api.de/api/interpreter", data={"data": query}, timeout=10)
        response.raise_for_status()
        data = response.json()
        if data['elements']:
            element = data['elements'][0]
            return element.get('lat'), element.get('lon')
    except Exception as e:
        print(f"[!] Erreur pour {osm_id}: {e}")
    return None, None

def export_to_csv():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM stations;")
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]

        # Supprimer colonnes latitude/longitude si présentes
        columns = [col for col in columns if col not in ["latitude", "longitude"]]

        with open("stations.csv", mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(columns + ["latitude", "longitude"])

            for row in rows:
                row_dict = dict(zip(columns, row))
                osm_id = row_dict.get("osm_id")
                lat, lon = get_coordinates(osm_id)
                writer.writerow([row_dict[col] for col in columns] + [lat, lon])
                time.sleep(1)

        print("✅ Export CSV terminé sans doublons de colonnes.")
    except Exception as e:
        print(f"[!] Erreur lors de l'export : {e}")
    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    export_to_csv()
