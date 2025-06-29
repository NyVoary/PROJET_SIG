import csv
import psycopg2

def insert_routes_from_csv(csv_file_path, db_config):
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
                INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                row.get('addr_city'),
                row.get('highway'),
                row.get('oneway'),
                row.get('ref'),
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
        "password": "",
        "port": 5432
    }
    csv_path = 'routes.csv'
    insert_routes_from_csv(csv_path, DB_CONFIG)
