const Item = require("../models/item");
const Genre = require("../models/genre");

const { body, validationResult } = require("express-validator");
const fs = require("fs");


const multer = require("multer");
const upload = multer();

const asyncHandler = require("express-async-handler");

//Site Home Page
exports.index = asyncHandler(async (req, res, next) => {
  const [numItems, numGenres] = await Promise.all([
    Item.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Digital Art Home",
    item_count: numItems,
    genre_count: numGenres,
  });
});

// Display list of all Items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name description")
    .sort({ name: 1 })
    .exec();

  res.render("item_list", { title: "Item List", item_list: allItems });
});

// Display detail page for a specific Item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("genre").exec();

  if (item === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  let image = item.file;
  image = "data:image/png;base64," + image.toString("base64");

  

  res.render("item_detail", {
    title: "Item Detail",
    item: item,
    image: image,
  });
});

// Display Item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  allGenres = await Genre.find().sort({ name: 1 }).exec();

  res.render("item_form", {
    title: "Create Genre",
    genres: allGenres,
  });
});

// Handle Genre create on POST.
exports.item_create_post = [
  upload.single("avatar"),

  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },
  // Validate and sanitize the name field.
  body("name", "title name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Description must contains at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("price", "You need to enter a price").escape(),
  body("stock", "You need to enter stock").escape(),
  body("date", "Invalid date ")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    console.log("Check below-----------------------------------------")
    console.log(req.file.buffer);

  
    // Create a item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      date: req.body.date,
      genre: req.body.genre,
      file: req.file.buffer,
    });

    if (!errors.isEmpty()) {
      allGenres = await Genre.find().sort({ name: 1 }).exec();
      // There are errors. Render the form again with sanitized values/error messages.
      for (const genre of allGenres) {
        if (item.genre.includes(genre._id)) {
          genre.checked = "true";
        }
      }

      res.render("item_form", {
        title: "Create Item",
        item: item,
        genres: allGenres,
        errors: errors.array(),
      });

      return;
    } else {
      await item.save();
      res.redirect(item.url);
    }
  }),
];

// Display Item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    res.redirect("/catalog/items");
  }

  res.render("Item_delete", {
    title: "Delete Item",
    item: item,
  });
});

// Handle Item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.itemid);

  res.redirect("/catalog/items");
});

// Display Item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, allGenres] = await Promise.all([
    Item.findById(req.params.id)
      .select("name description price stock date genre date_formatted isoDate")
      .exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  allGenres.forEach((genre) => {
    if (item.genre.includes(genre._id)) genre.checked = "true";
  });

  res.render("item_form", {
    title: "Update Item",
    genres: allGenres,
    item: item,
  });
});

// Handle Item update on POST.
exports.item_update_post = [
  upload.single("avatar"),

  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize the name field.
  body("name", "title name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Description must contains at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("price", "You need to enter a price").escape(),
  body("stock", "You need to enter stock").escape(),
  body("date", "Invalid date ")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("genre.*").escape(),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.

    const errors = validationResult(req);

    const oldItem = await Item.findById(req.params.id);

    // Create a item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      date: req.body.date,
      genre: req.body.genre,
      _id: req.params.id,
      file: req.file ? req.file.buffer : oldItem.file.buffer,
    });

    if (!errors.isEmpty()) {
      allGenres = await Genre.find().sort({ name: 1 }).exec();
      // There are errors. Render the form again with sanitized values/error messages.
      for (const genre of allGenres) {
        if (item.genre.includes(genre._id)) {
          genre.checked = "true";
        }
      }

      res.render("item_form", {
        title: "Update Item",
        item: item,
        genres: allGenres,
        errors: errors.array(),
      });

      return;
    } else {
      const fs = require("fs");

      try {
        fs.unlinkSync(`public/images/${oldItem.file_name}`);

        console.log("Delete File successfully.");
      } catch (error) {
        console.log(error);
      }

      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      res.redirect(item.url);
    }
  }),
];
