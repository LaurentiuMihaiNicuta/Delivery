const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.createCourier = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.end();
      return;
    }

    const { email, password, name, phone } = req.body;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });

      await admin.firestore().collection("couriers").doc(userRecord.uid).set({
        name,
        email,
        phone,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: "courier",
        free: true,
      });

      res.status(200).send({
        message: "Courier created successfully",
        id: userRecord.uid,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
});

exports.deleteCourier = functions.https.onCall(async (data, context) => {
  const uid = data.uid;

  try {
    await admin.auth().deleteUser(uid);
    await admin.firestore().collection("couriers").doc(uid).delete();
    return { message: "Courier deleted successfully" };
  } catch (error) {
    return { error: error.message };
  }
});
