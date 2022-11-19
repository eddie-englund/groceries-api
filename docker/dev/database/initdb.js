db = db.getSiblingDB('admin');
db.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD);

db = db.getSiblingDB(process.env.MONGO_NEW_DB);
db.createUser({
  user: process.env.MONGO_NEW_USER,
  pwd: process.env.MONGO_NEW_PASSWORD,
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_NEW_DB,
    },
  ],
});
