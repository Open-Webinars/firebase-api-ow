const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({origin: true}));

app.get("/holamundo", (req, res) => {
  return res.status(200).send("Hola mundo, soy el primer endpoint");
});

exports.app = functions.https.onRequest(app);

const serviceAccount = require("./permisos.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

});

const db = admin.firestore();


/*
app.post('/api/libros', (req, res) => {
    (async () => {
        try {
          await db.collection('libros').doc('/' + req.body.id + '/')
              .create({titulo: req.body.titulo});
          return res.status(200).send();
        } catch (error) {
          console.log(error);
          return res.status(500).send(error);
        }
    })();
});
*/


function salida(codigo, entrada) {
  const today = new Date();
  const date = today.getFullYear()+"-"+
    (today.getMonth()+1)+"-"+
    today.getDate()+"|"+
    today.getHours() + ":" +
    today.getMinutes() + ":" +
    today.getSeconds();

  if (codigo === "200") {
    return {
      mensaje: "Proceso terminado exitosamente",
      folio: date,
      resultado: entrada,
    };
  }

  if (codigo === "201") {
    return {
      mensaje: "Elemento creado exitosamente",
      folio: date,
      resultado: entrada,
    };
  }

  if (codigo === "500") {
    return {
      mensaje: "Ocurrio un detalle en el servidor",
      folio: date,
      resultado: entrada,
    };
  }

  return {
    mensaje: "Ocurrio un detalle en el servidor",
    folio: date,
    resultado: entrada,
  };
}


app.post("/api/libros", (req, res) => {
  (async () => {
    try {
      await db.collection("libros").doc("/" + req.body.id + "/")
          .create({titulo: req.body.titulo});
      return res.status(200).send(salida("200", "Libro creado correctamente"));
    } catch (error) {
      console.log(error);
      return res.status(500).send(salida("500", error));
    }
  })();
});

app.get("/api/libros", async (req, res) => {
  try {
    const query = db.collection("libros");
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      id: doc.id,
      titulo: doc.data().titulo,
    }));

    return res.status(200).json(salida("200", response));
  } catch (error) {
    return res.status(500).json(salida("500", error));
  }
});


app.get("/api/libros/:libro_id", (req, res) =>{
  (async () => {
    try {
      const doc = db.collection("libros").doc(req.params.libro_id);
      const item = await doc.get();
      const response = item.data();
      return res.status(200).json(salida("200", response));
    } catch (error) {
      return res.status(500).send(salida("500", error));
    }
  })();
});

app.put("/api/libros/:libros_id", async (req, res) => {
  try {
    const document = db.collection("libros").doc(req.params.libros_id);

    await document.update({
      nombre: req.body.nombre,
    });

    return res.status(200).json(salida("200", "El libro ha sido actualizado"));
  } catch (error) {
    return res.status(500).json(salida("500", error));
  }
});

app.delete("/api/libros/:libros_id", async (req, res) => {
  try {
    const doc = db.collection("libros").doc(req.params.libros_id);
    await doc.delete();
    return res.status(200).json(salida("200", "El libros ha sido borrado exitosamente"));
  } catch (error) {
    return res.status(500).send(salida("500", error));
  }
});
