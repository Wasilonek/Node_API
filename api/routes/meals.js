const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, res, callback) {
    callback(null, './uploads/');
  },
  filename: function(req, res, callback) {
    callback(null, file.originalname);
  }
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    callback(null, true);
  } else {
    callback(new Error("Wrong image format"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

const Meal = require('../models/meal');

// Handle GET request to "/meals"
router.get('/', (req, res, next) => {
  Meal.find()
    .select('image name _id')
    .exec()
    .then(meals => {
      response = {
        amount: meals.length,
        meals: meals
      };
      if (meals.length === 0) {
        res.status(200).json({
          message: 'Not found meals'
        });
      } else {
        res.status(200).json({
          meals: response
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// Handle POST request to "/meals"
router.post('/', upload.single('mealImage'), (req, res, next) => {
  const meal = new Meal({
    _id: new mongoose.Types.ObjectId(),
    mealImage: req.file.path,
    name: req.body.name
  });

  // Save meal in database
  meal
    .save()
    .then(response => {
      // Status 201 - resource created
      res.status(201).json({
        meal: response
      });
    })
    .catch(err => {
      res.error(500).json({
        error: err
      });
    });
});

// Handle GET request to specific meal
router.get('/:mealId', (req, res, next) => {
  const mealId = req.params.mealId;
  Meal.findById(mealId)
    .exec()
    .then(meal => {
      if (meal) {
        res.status(200).json({
          meal: meal
        });
      } else {
        res.status(404).json({
          message: 'Not found meal with provided ID'
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// Handle PATCH request to specific meal
router.patch('/:mealId', (req, res, next) => {
  const mealId = req.params.mealId;
  const updatedMeal = {};
  for (const prop of req.body) {
    updatedMeal[prop.propName] = prop.value;
  }
  console.log(updatedMeal);
  Meal.updateOne({ _id: mealId }, { $set: updatedMeal })
    .exec()
    .then(response => {
      res.status(200).json({
        message: response
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// Handle DELETE request to specific meal
router.delete('/:mealId', (req, res, next) => {
  Meal.remove({ _id: req.params.mealId })
    .exec()
    .then(response => {
      res.status(200).json({
        message: response
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
