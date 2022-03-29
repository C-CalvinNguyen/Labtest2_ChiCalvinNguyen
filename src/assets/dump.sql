CREATE TABLE IF NOT EXISTS location(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  geoTimestamp TEXT,
  rawTimestamp TEXT,
  latitude TEXT,
  longitude TEXT
);
