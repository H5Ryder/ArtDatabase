const Genre = require("../models/genre");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

// Display list of all Genres.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenre = await Genre.find({}, "name description")
    .sort({ name: 1 })
    .exec();

  res.render("genre_list", { title: "Genre List", genre_list: allGenre });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, items] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Item.find({ genre: req.params.id }).exec(),
  ]);

  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    items: items,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  allGenres = await Genre.find().sort({ name: 1 }).exec();

  res.render("genre_form", {
    title: "Create Item",
    genres: allGenres,
  });
});

// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "title name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      allGenres = await Genre.find().sort({ name: 1 }).exec();

      res.render("genre_form", {
        title: "Create Genre",
        genres: allGenres,
        genre: genre,
        errors: errors.array(),
      });
    } else {
      await genre.save();
      res.redirect(genre.url);
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [genre, items] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Item.find({ genre: { $in: [req.params.id] } }).exec(),
  ]);

  if (genre === null) {
    // No results.
    res.redirect("/catalog/genres");
  }

  res.render("Genre_delete", {
    title: "Delete Genre",
    genre: genre,
    items: items,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [genre, items] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Item.find({ genre: { $in: [req.params.id] } }).exec(),
  ]);

  if (items.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("Genre_delete", {
      title: "Delete Genre",
      genre: genre,
      items: items,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Genre.findByIdAndDelete(req.body.genreid);
    res.redirect("/catalog/genres");
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_form", {
    title: "Update Genre",
    genre: genre,
  });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "title name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a item object with escaped and trimmed data.

    const genre = new Genre({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Genre",
        genre: genre,
        errors: errors.array(),
      });

      return;
    } else {
      const updatedGenre = await Genre.findByIdAndUpdate(
        req.params.id,
        genre,
        {}
      );
      res.redirect(genre.url);
    }
  }),
];
