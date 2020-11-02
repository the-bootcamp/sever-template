const app = require("express");
const router = new app.Router();
const Subscriptions = require("../models/Subscription.model");
const mongoose = require("mongoose");
const Session = require("../models/Session.model");
const User = require("../models/User.model");
const MemberShip = require("../models/Membership.model");
/**********************************
 *  POST - /user/edit
 ************************************/
router.post("/edit", (req, res) => {
  console.log("/user/edit =>", req.headers.accesstoken);
  console.log("/user/edit =>", req.body);

  const body = Object.fromEntries(
    Object.entries(req.body).filter((el) => el[1])
  );
  Session.findById({ _id: req.headers.accesstoken })
    .then((sessionFromDB) => {
      if (sessionFromDB) {
        User.findByIdAndUpdate(sessionFromDB.userId, body, { new: true })
          .then((userInfofromDB) => {
            MemberShip.findOne(
              { membership: userInfofromDB.membership },
              { _id: 0, cottagetype: 1 }
            ).then((cottagetype) => {
              return res.status(200).json({
                success: "user profile updated ",
                userInfo: {
                  ...userInfofromDB.toObject(),
                  ...cottagetype.toObject(),
                },
              });
            });
          })
          .catch((error) =>
            res
              .status(200)
              .json({ errorMessage: "Session is not active", error })
          );
      } else {
        return res.status(200).json({ errorMessage: "session not updated " });
      }
    })
    .catch((error) =>
      res.status(200).json({ errorMessage: "Session is not active", error })
    );
});

/**********************************
 *  POST - /user/subscribe/:email
 ************************************/
router.post("/subscribe/:email", (req, res, next) => {
  console.log(req.params.email);
  if (!req.params.email) {
    return res.status(200).json({
      errorMessage: "Email-Id is empty.",
    });
  }

  Subscriptions.create({
    email: req.params.email,
    createdAt: Date.now(),
  })
    .then((res) => {
      return res.status(200).json({ success: "User is sunscribed" });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(200).json({ errorMessage: error.message });
      } else if (error.code === 11000) {
        return res.status(200).json({
          errorMessage:
            "Email need to be unique. Either username or email is already used.",
        });
      }
      // else {
      //   return res.status(500).json({ errorMessage: error });
      // }
    }); // close .catch()
});

/**  */
module.exports = router;
