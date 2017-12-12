let csvParser = require('../../helpers/csvParser');
let fs = require('fs');

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('assassins').del()
    .then(function () {
      // Read seed data from csv file and use parser to format everything.
      let assassinsData = fs.readFileSync('./data/assassins.csv', 'utf8');

      let assassins = csvParser.parseFile(assassinsData);

      return knex('assassins').insert(assassins).returning('*')
    });
};
