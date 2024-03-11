#! /usr/bin/env node

console.log(
    'This script populates your database. Specified database as argument - e.g.: node populatedb ""mongodb+srv://harrisryder:SZvKh0NskOFEvDoW@cluster0.nt7psh5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0""'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Item = require("./models/item");
  const Genre = require("./models/genre");

  
  const items = [];
  const genres = [];

  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createGenres();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // genre[0] will always be the Fantasy genre, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function genreCreate(index, name, description) {
    const genre = new Genre({ name: name, description: description });
    await genre.save();
    genres[index] = genre;
    console.log(`Added genre: ${name}`);
  }
  
  async function itemCreate(index,name, description, price, stock, date, genre) {
    const itemdetail = { name: name, description: description, price: price, stock: stock};
    if (date != false) itemdetail.date = date;
    if (genre != false) itemdetail.genre = genre;
  
    const item = new Item(itemdetail);
  
    await item.save();
    items[index] = item;
    console.log(`Added item: ${name} ${genre}`);
  } 
  
  async function createGenres() {
    console.log("Adding genres");
    await Promise.all([
      genreCreate(0, "Nature", "Art based of natural phenomenon & patterns"),
      genreCreate(1, "Mathematical", "Derived from Mathematical principles"),
      genreCreate(2, "Random", "Created from random processes"),
    ]);
  }
  
  async function createItems() {
    console.log("Adding Items");
    await Promise.all([
      itemCreate(0, "The Possum", "The first of its kind", 3000, 5, "1973-06-06", genres[0]),
      itemCreate(1, "Circus", "The only of its kind", 9030, 2, "1990-05-08", genres[1]),
      itemCreate(2, "Circadian Rythm", "One of its kind", 335, 10, "2003-01-06", genres[2]),
    ]);
  }
 