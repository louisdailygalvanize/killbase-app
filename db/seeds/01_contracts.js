const csvParser = require('../../helpers/csvParser');
const fs = require('fs');

exports.seed = function(knex, Promise) {
  // Deletes ALL existing Contracts
  return knex('contracts').del()
  .then(function () {
    // Deletes ALL existing Clients
    return knex('clients').del();
  })
  .then(function () {
    // Deletes ALL existing Targets
    return knex('targets').del();
  })
  .then(function () {
    // Read contracts csv file and populate both target and client arrays
    let contractsData = fs.readFileSync('./data/contracts.csv', 'utf8');
    let contracts = csvParser.parseFile(contractsData);

    // Before inserting into db.
    let targets = [];
    let clients = [];

    // Loop over contracts and create new target and client objects for each contract.
    contracts.forEach(function (contract) {

      // Creating new target object and pushing into targets array.
      let target = {};
      target.target_name = contract.target_name;
      target.location = contract.target_location;
      target.target_photo = contract.target_photo;
      target.security_level = contract.target_security;
      targets.push(target);

      // Creating new client object and pushing into clients array.
      let client = {};
      client.client_name = contract.client_name;
      client.budget = contract.budget;
      clients.push(client);
    });

    // Inserting seed targets
    return knex('targets').insert(targets).returning(['id', 'target_name'])
    .then(function (insertedTargets) {

      // Inserting seed clients
      return Promise.all([insertedTargets, knex('clients').insert(clients).returning(['id', 'client_name'])]);
    })
    .then(function (results) {
      // Creating our contracts object to insert into the db.

      // Decomposing the results of our promise.all into the two variables;
      let [createdTargets, createdClients] = results;

      // Creating an hashtable to access target data faster
      let indexedTargets = createdTargets.reduce(function (obj, target) {
        obj[target.target_name] = target;
        return obj;
      }, {});

      // Creating an hashtable to access client data faster
      let indexedClients = createdClients.reduce(function (obj, client) {
        obj[client.client_name] = client;
        return obj;
      }, {});

      // Map over contracts to create new contracts array to store in db.
      let seedContracts = contracts.map(function (seedContract) {

        // Create our contract object
        let contract = {};
        contract.client_id = indexedClients[seedContract.client_name].id;
        contract.target_id = indexedTargets[seedContract.target_name].id;
        contract.price = seedContract.budget;

        return contract;
      });
      return knex('contracts').insert(seedContracts).returning('*');
    })
    .then(function() {
      // Inner join on clients<>contracts<>targets tables to show human readable data.
      return knex('clients').select('targets.target_name', 'clients.client_name', 'contracts.price', 'contracts.completed', 'contracts.completed_by')
      .innerJoin('contracts', 'clients.id', 'contracts.client_id')
      .innerJoin('targets', 'contracts.target_id', 'targets.id')
      .then(function (client_target_contracts) {
        console.log(client_target_contracts);
      });
    });
  });
};
