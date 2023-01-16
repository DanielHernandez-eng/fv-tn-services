import { Router } from "express";
import merchantSchema from "../models/merchant.js";

const router2 = Router();

//create merchant
router2.post("/merchants", (req, res) => {
  const merchant = merchantSchema(req.body);
  merchant
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

//get a merchant by user_id or tiendanube store id
router2.get("/merchants/:id", (req, res) => {
  const { id } = req.params;
  merchantSchema
    .findOne({ user_id: id }, "shop_id id_token access_token")
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

//update a merchant
router2.put("/merchants/:id", (req, res) => {
  const { id } = req.params;
  const { shop_id, id_token, access_token } = req.body;
  merchantSchema
    .updateOne({ shop_id: id }, { $set: {shop_id, id_token, access_token} })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

export default router2;
