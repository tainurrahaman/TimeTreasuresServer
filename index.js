require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xtebx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const userCollection = client.db("ArtifactsDB").collection("users");
const artifactsCollection = client.db("ArtifactsDB").collection("artifacts");

async function run() {
  try {
    // Users APIs

    // Get all user from DB
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add user in DB
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const { email, name, photo } = newUser;
      const result = await userCollection.insertOne({
        email,
        name,
        photo,
      });
      res.send(result);
    });

    // Artifacts APIs

    // Get all Artifacts (without filters)
    app.get("/artifacts/all", async (req, res) => {
      const result = await artifactsCollection.find().toArray();
      res.json(result);
    });

    // Get most Liked 6 artifacts
    app.get("/artifacts/mostLiked", async (req, res) => {
      const result = await artifactsCollection
        .find()
        .sort({ totalLikeCount: -1 })
        .limit(6)
        .toArray();
      res.json(result);
    });

    // Get Artifacts added by a specific user (using email)
    app.get("/artifacts", async (req, res) => {
      const { email } = req.query;
      const result = await artifactsCollection.find({ email }).toArray();
      res.json(result);
    });

    // Get Artifacts data using ID
    app.get("/artifacts/all/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await artifactsCollection.findOne(query);

        if (!result) {
          return res.status(404).json({ error: "Artifacts not found!" });
        }
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Invalid ID format!" });
      }
    });

    // Store artifact data in Artifacts DB
    app.post("/artifacts", async (req, res) => {
      const newArtifact = req.body;
      const result = await artifactsCollection.insertOne(newArtifact);
      res.send(result);
    });

    // Update artifacts Data when like (using Id)

    app.patch("/artifacts/all/:id/like", async (req, res) => {
      const id = req.params.id;
      const artifactsData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateArtifacts = {
        $set: {
          totalLikeCount: artifactsData.count,
        },
      };
      const result = await artifactsCollection.updateOne(
        filter,
        updateArtifacts
      );
      res.send(result);
    });

    // Update artifacts Data when change (using Id)

    app.patch("/artifacts/all/:id", async (req, res) => {
      const id = req.params.id;
      const artifactsData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateArtifacts = {
        $set: {
          artifacts_name: artifactsData.artifacts_name,
          fee: artifactsData.fee,
          user_email: artifactsData.user_email,
          user_name: artifactsData.user_name,
          type: artifactsData.type,
          create: artifactsData.create,
          description: artifactsData.description,
          discover: artifactsData.discover,
          discover_by: artifactsData.discover_by,
          location: artifactsData.location,
        },
      };
      const result = await artifactsCollection.updateOne(
        filter,
        updateArtifacts
      );

      res.send(result);
    });

    // Delete artifacts using ID(single artifact)

    app.delete("/artifacts/all/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artifactsCollection.deleteOne(query);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Travel in the past");
});

app.listen(port, () => {
  console.log("port is running on ", port);
});
