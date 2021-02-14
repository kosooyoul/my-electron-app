const mongoose = require("mongoose");

const parseIdString = (buffer) => {
  return Buffer.from(buffer).toString("hex");
}

const executeQuery = async (databaseName, callbackWithMongodb, callbackWithError) => {
  let disposableConnection = null;

  try {
    disposableConnection = await mongoose.createConnection("mongodb://localhost:27017/", {
      dbName: databaseName,
      autoCreate: false
    });

    if (disposableConnection.readyState != 1) {
      throw new Error("Cannot connect to mongodb");
    }

    if (callbackWithMongodb) {
      return await callbackWithMongodb(disposableConnection.db);
    }
  } catch (e) {
    if (callbackWithError) {
      await callbackWithError();
    }
  } finally {
    if (disposableConnection) {
      await disposableConnection.close();
    }
  }

  return null;
};

const getDatabases = async () => {
  return await executeQuery(null, async (mongodb) => {
    const resultOfDatabases = await mongodb.executeDbAdminCommand({listDatabases: 1})

    if (resultOfDatabases.ok != 1) {
      return null;
    }

    const databases = resultOfDatabases.databases.map(item => ({
      "name": item.name,
      "sizeOnDisk": item.sizeOnDisk,
      "empty": item.empty
    }));

    return databases;
  });
};

const getCollections = async (databaseName) => {
  return executeQuery(databaseName, async (mongodb) => {
    const collections = await mongodb.listCollections().toArray();

    const refinedCollections = [];
    for (const collection of collections) {
      const fields = await mongodb.collection(collection.name).aggregate([
        {$project: {"arrayofkeyvalue": {"$objectToArray": "$$ROOT"}}},
        {$unwind: "$arrayofkeyvalue"},
        {$project: {"k": "$arrayofkeyvalue.k", "t": {$type: "$arrayofkeyvalue.v"}, "v": "$arrayofkeyvalue.v"}},
        {$group: {"_id": "$k", "t": {"$addToSet": "$t"},"v": {"$addToSet": {$cond: {if: {$eq: ["$t", "objectId"]}, then: "$v", else: "$__"}}}}},
        {$project: {"key": "$_id", "types": "$t", "samples": "$v"}},
        {$sort: {"key": 1}}
      ]).toArray();

      refinedCollections.push({
        "name": collection.name,
        "uuid": collection.info.uuid && parseIdString(collection.info.uuid.buffer) || null,
        "type": collection.type,
        "readonly": collection.info.readOnly || null,
        "fields": fields.map((field) => ({
          "key": field.key,
          "types": field.types,
          "nullable": field.types.includes("null"),
          "samples": field.types.includes("objectId") && field.samples.map(sample => parseIdString(sample.id)) || null
        }))
      });
    }

    return refinedCollections;
  });
};

module.exports = {
  getDatabases: getDatabases,
  getCollections: getCollections
};