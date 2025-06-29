import csv

def escape_sql_string(s):
    if s is None:
        return 'NULL'
    s = s.replace("'", "''")
    return f"'{s}'"

def generate_insert_stations(csv_path, output_sql_path):
    with open(csv_path, newline='', encoding='utf-8') as csvfile, open(output_sql_path, 'w', encoding='utf-8') as sqlfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Extraction des champs, en tenant compte que certains peuvent manquer ou être vides
            osm_id = escape_sql_string(row.get('osm_id'))
            amenity = escape_sql_string(row.get('amenity'))
            brand = escape_sql_string(row.get('brand'))
            name = escape_sql_string(row.get('name'))
            name_en = escape_sql_string(row.get('name_en'))
            operator = escape_sql_string(row.get('operator'))
            shop = escape_sql_string(row.get('shop'))
            
            latitude = row.get('latitude')
            longitude = row.get('longitude')
            
            latitude_val = latitude if latitude else 'NULL'
            longitude_val = longitude if longitude else 'NULL'
            
            insert_stmt = (
                "INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ("
                f"{osm_id}, {amenity}, {brand}, {name}, {name_en}, {operator}, {shop}, {latitude_val}, {longitude_val});\n"
            )
            sqlfile.write(insert_stmt)

def generate_insert_route(csv_path, output_sql_path):
    with open(csv_path, newline='', encoding='utf-8') as csvfile, open(output_sql_path, 'w', encoding='utf-8') as sqlfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            addr_city = escape_sql_string(row.get('addr_city'))
            highway = escape_sql_string(row.get('highway'))
            oneway = escape_sql_string(row.get('oneway'))
            ref = escape_sql_string(row.get('ref'))
            
            latitude = row.get('latitude')
            longitude = row.get('longitude')
            
            latitude_val = latitude if latitude else 'NULL'
            longitude_val = longitude if longitude else 'NULL'
            
            insert_stmt = (
                "INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ("
                f"{addr_city}, {highway}, {oneway}, {ref}, {latitude_val}, {longitude_val});\n"
            )
            sqlfile.write(insert_stmt)

if __name__ == "__main__":
    # Remplacer par tes chemins
    generate_insert_stations('stations.csv', 'insert_stations.sql')
    generate_insert_route('routes.csv', 'insert_route.sql')
    print("Fichiers SQL générés : insert_stations.sql et insert_route.sql")
