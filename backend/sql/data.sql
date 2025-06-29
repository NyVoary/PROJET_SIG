CREATE DATABASE stations_service;
\c stations_service;
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    osm_id VARCHAR(50),
    amenity VARCHAR(50),
    brand VARCHAR(100),
    name VARCHAR(150),
    name_en VARCHAR(150),
    operator VARCHAR(100),
    shop VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE route (
    id SERIAL PRIMARY KEY,
    addr_city VARCHAR(100),
    highway VARCHAR(50),
    oneway VARCHAR(10),
    ref VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- Étape 1 : Ajouter une colonne de type geometry avec le bon SRID
ALTER TABLE route ADD COLUMN geom geometry(Point, 4326);

-- Étape 2 : Remplir la colonne avec les coordonnées existantes
UPDATE route
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

-- Étape 3 : Optionnel : ajouter un index spatial
CREATE INDEX idx_route_geom ON route USING GIST (geom);


INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/614389229', 'fuel', 'Total', 'Manja', 'Total MANJA', 'Total', 'kiosk', -18.9120706, 47.5179075);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/614403707', 'fuel', 'Total', 'Isoanifanaovana', '', 'Total', 'kiosk', -18.9067212, 47.5118894);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/614403710', 'fuel', 'Galana', 'Valiha', '', 'Galana', 'kiosk', -18.9073071, 47.5129964);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/616734925', 'fuel', 'Jovena', 'Domoina', 'Jovena DOMOINA', 'Jovena', '', -18.908437, 47.5199352);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/616734958', 'fuel', 'Shell', 'Fitiavana', '', 'Shell', '', -18.9072151, 47.5173277);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/616734976', 'fuel', 'Galana', 'Nirina', '', 'Galana', 'kiosk', -18.9057675, 47.5210491);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/616757179', 'fuel', 'Shell', 'Voanio', '', 'Shell', '', -18.9077265, 47.5216411);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/620818083', 'fuel', 'Galana', 'Galana', '', 'Galana', '', -18.9458733, 47.5246889);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/620818084', 'fuel', 'Galana', 'Tsarafaritra', '', 'Galana', '', -18.9356137, 47.5288088);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/620818092', 'fuel', 'Shell', 'Havozo', '', 'Shell', '', -18.9016519, 47.5252294);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/620818101', 'fuel', 'Total', 'Fierenana', '', 'Total', '', -18.9177984, 47.5388532);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/620818103', 'fuel', 'Galana', 'GALAN Avana', 'Galana AVANA', 'Galana', '', -18.9018461, 47.5275523);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/620818107', 'fuel', 'Shell', 'Ravinala', '', 'Shell', '', -18.9017355, 47.5394947);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/620824093', 'fuel', 'Jovena', 'Ampasika', '', 'Jovena', '', -18.9098134, 47.4992557);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/620900962', 'fuel', 'Galana', 'Anjoma', '', 'Galana', '', -18.9070195, 47.5267435);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/620900986', 'fuel', 'Shell', 'Tselatra', '', 'Shell', '', -18.9036859, 47.5235575);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/667740294', 'fuel', 'Shell', 'Station d''Essence Ambatoroka', '', 'Shell', '', -18.9211567, 47.5404713);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/667889067', 'fuel', 'Jovena Premium', 'JOVENA Antaninandro', '', 'Jovena', '', -18.9035682, 47.5291913);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/669223708', 'fuel', 'Total', 'Kininina', 'Total KINININA', 'Total', '', -18.9014222, 47.5285317);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/686271698', 'fuel', '', '', '', 'Total', '', -18.9399092, 47.5221401);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/845724565', 'fuel', 'Shell', 'Tsarahonenana', '', 'Shell', '', -18.9642721, 47.5294925);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/845724577', 'fuel', 'Galana', 'Miary-Tsoa', '', 'Galana', '', -18.9878407, 47.5321989);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/845854257', 'fuel', 'Jovena', 'Mevasoa', '', 'Jovena', '', -18.9241584, 47.5202678);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/845937324', 'fuel', 'Jovena', 'Imaitsoanala', '', 'Jovena', '', -18.9122431, 47.528529);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/845947785', 'fuel', 'Shell', 'Manakambahiny', '', 'Shell', '', -18.9277524, 47.5369713);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/1319959767', 'fuel', '', '', '', 'Total', '', -18.9169559, 47.5357095);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/1497192447', 'fuel', 'Galana', 'Kintana', 'Galana KINTANA', 'Galana', '', -18.9105799, 47.5045549);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/1497192977', 'fuel', 'Shell', 'Tsiferana', '', 'Shell', '', -18.92129, 47.5083778);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/1497195528', 'fuel', 'Galana', 'Station GALANA IARIVO', 'Galana IARIVO Soanierana', '', '', -18.937053, 47.522578);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/3549643051', 'fuel', 'Total', 'Station Service TOTAL', '', 'Total', '', -18.9036692, 47.5173755);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/4292241290', 'fuel', '', '', '', 'Shell', '', -18.9114618, 47.4957949);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/8446375784', 'fuel', 'Shell', 'Shell Ankoay', '', 'Shell', 'kiosk', -18.9536372, 47.5470766);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/8457444138', 'fuel', 'Galana', 'Galana Taratra Andrefanambohijanahary', '', 'Galana', 'yes', -18.9206976, 47.5213073);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/8527665840', 'fuel', '', 'Galana Taratra', '', '', 'kiosk', -18.9207607, 47.5212849);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/9229767617', 'fuel', '', 'JOVENA Tanikely', '', '', '', -18.93944, 47.4898636);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/10946861903', 'fuel', '', 'Total Ankadimbahoaka', '', '', '', -18.948207, 47.5285453);
INSERT INTO stations (osm_id, amenity, brand, name, name_en, operator, shop, latitude, longitude) VALUES ('node/11422760670', 'fuel', '', 'Shell Anosizato', 'Shell Anosizato', '', '', -18.945717, 47.512467);

INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/27362008', 'primary', 'yes', -18.9233936, 47.520437);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/27362040', 'primary', 'yes', -18.9455698, 47.5247849);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/27362109', 'primary', 'yes', -18.9406596, 47.5225454);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/27362118', 'primary', 'yes', -18.9355761, 47.5223045);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/28823139', 'primary', 'yes', -18.9185872, 47.5212877);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Place de l''OUA', 'way/28915120', 'primary', '', -18.9143386, 47.5241742);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('L…lana Ralaimongo', 'way/28915127', 'primary', '', -18.9130112, 47.5254659);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Tunnel d''Ambohidahy', 'way/28915149', 'primary', '', -18.9113915, 47.526849);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/28915150', 'primary', '', -18.9108091, 47.5273161);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny Fahaleovantena', 'way/28915257', 'primary', 'yes', -18.9070089, 47.5246526);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny Fahaleovantena', 'way/28915271', 'primary', 'yes', -18.9039829, 47.5215257);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny 26 Jona 1960', 'way/28930045', 'primary', '', -18.9091053, 47.5264789);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/30321431', 'primary', 'yes', -18.9550263, 47.5295642);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/30583704', 'primary', 'yes', -18.9553052, 47.5290459);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/30583899', 'primary', 'yes', -18.9557035, 47.5289194);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/31233797', 'primary', 'yes', -18.9556815, 47.5296077);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/45181094', 'primary', 'yes', -18.9143513, 47.5243109);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/45181097', 'primary', 'yes', -18.9145809, 47.5241631);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/45181098', 'primary', 'yes', -18.914575, 47.5240941);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/45181100', 'primary', 'yes', -18.9143054, 47.5242884);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('L…lana Mohamed V', 'way/45478182', 'primary', 'yes', -18.9173638, 47.5239899);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/76833493', 'primary', '', -18.9589288, 47.5295767);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/76833494', 'primary', '', -18.9611205, 47.5296402);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/77338147', 'primary', 'yes', -18.9320943, 47.5206787);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny Fahaleovantena', 'way/119369725', 'primary', 'yes', -18.9061092, 47.5239237);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/186254005', 'primary', 'yes', -18.9405489, 47.5227468);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/186254012', 'primary', 'yes', -18.943195, 47.5233698);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/186255403', 'primary', 'yes', -18.9183308, 47.5213317);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/186255410', 'primary', 'yes', -18.9558822, 47.5289722);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/186255413', 'primary', 'yes', -18.9183556, 47.5215982);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/186255416', 'primary', 'yes', -18.9186059, 47.5215542);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/267005638', 'primary', '', -18.9690918, 47.5311236);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/301483807', 'primary', 'yes', -18.910129, 47.5274008);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Place de l''OUA', 'way/311093540', 'primary', '', -18.9143607, 47.524206);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('L…lana Mohamed V', 'way/312190305', 'primary', '', -18.9158479, 47.5240631);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Place de l''OUA', 'way/312190315', 'primary', '', -18.914448, 47.5242238);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/312190372', 'primary', 'yes', -18.9174999, 47.5239522);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/312190376', 'primary', 'yes', -18.9174479, 47.5238948);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Place de l''OUA', 'way/312190377', 'primary', '', -18.9144249, 47.5240764);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/312190378', 'primary', 'yes', -18.9174762, 47.5237661);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/312430381', 'primary', 'yes', -18.9493445, 47.5260322);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/312430383', 'primary', 'yes', -18.9492162, 47.5260658);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/312430387', 'primary', 'yes', -18.9473957, 47.525464);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/316806322', 'primary', 'yes', -18.9175998, 47.5237441);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/316806323', 'primary', 'yes', -18.9175811, 47.5238761);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/400120300', 'primary', 'yes', -18.94307, 47.5232413);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/414000246', 'primary', 'yes', -18.9551857, 47.529837);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny Fahaleovantena', 'way/414005971', 'primary', 'no', -18.9077089, 47.5251926);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/527098803', 'primary', 'yes', -18.9172006, 47.523928);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Place de l''OUA', 'way/531720057', 'primary', '', -18.9144065, 47.5242308);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Place de l''OUA', 'way/531720060', 'primary', '', -18.9143672, 47.5241181);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny Fahaleovantena', 'way/531720068', 'primary', 'yes', -18.9066093, 47.524068);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny 26 Jona 1960', 'way/531720075', 'primary', '', -18.9081296, 47.525579);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/542604738', 'primary', 'yes', -18.9561448, 47.5291188);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/542604739', 'primary', '', -18.9565361, 47.5293609);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('L…lana Mohamed V', 'way/544835748', 'primary', 'yes', -18.9171166, 47.5240175);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/563866207', 'primary', 'yes', -18.9187695, 47.521815);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/565439302', 'primary', 'yes', -18.9429789, 47.5235373);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/565439303', 'primary', 'yes', -18.9435768, 47.5237814);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/566072482', 'primary', 'yes', -18.956205, 47.5292988);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny Fahaleovantena', 'way/566255283', 'primary', 'yes', -18.9044461, 47.5219545);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/566974050', 'primary', '', -18.978521, 47.5329337);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/566974052', 'primary', '', -18.9858932, 47.5325862);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/566991531', 'primary', 'yes', -18.9434411, 47.5238923);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/567053247', 'primary', 'yes', -18.9437374, 47.52412);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/577818058', 'primary', 'yes', -18.9104655, 47.5275356);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny Fahaleovantena', 'way/580927389', 'primary', 'yes', -18.9052344, 47.5226824);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/591763195', 'primary', 'yes', -18.9457727, 47.5247778);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/591777236', 'primary', 'yes', -18.9431879, 47.5236917);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/605945681', 'primary', 'yes', -18.9370928, 47.5223738);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/605945682', 'primary', 'yes', -18.9270539, 47.5205389);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('', 'way/605945683', 'primary', 'yes', -18.9370569, 47.5221676);
INSERT INTO route (addr_city, highway, oneway, ref, latitude, longitude) VALUES ('Araben''ny 26 Jona 1960', 'way/1151215929', 'primary', 'yes', -18.9098452, 47.5271482);
