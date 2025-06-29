import csv
import psycopg2

def insert_stations_from_csv(csv_file_path, db_config):
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()

    with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                latitude = float(row['latitude']) if row['latitude'].lower() != 'latitude' else None
            except Exception:
                latitude = None
            try:
                longitude = float(row['longitude']) if row['longitude'].lower() != 'longitude' else None
            except Exception:
                longitude = None

            cursor.execute("""
                INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                row.get('osm_id'),
                row.get('amenity'),
                row.get('brand'),
                row.get('name'),
                row.get('name_en'),
                row.get('operator'),
                row.get('shop'),
                latitude,
                longitude
            ))

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    DB_CONFIG = {
        "host": "localhost",
        "dbname": "stations_service",
        "user": "postgres",
        "password": "steve",
        "port": 5432
    }
    csv_path = 'stations.csv'
    insert_stations_from_csv(csv_path, DB_CONFIG)
