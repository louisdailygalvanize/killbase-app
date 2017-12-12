
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('assassins', function (table) {
    // Creating Assassins table
    table.increments();
    table.string('full_name');
    table.string('code_name');
    table.string('weapon');
    table.string('contact_info').notNullable();
    table.integer('age');
    table.integer('price').notNullable().defaultTo(0);
    table.float('rating', 1, 2).notNullable().defaultTo(5.0);
    table.integer('kills').notNullable().defaultTo(0);
  })
  .then(function () {
    // Creating Targets table.
    return knex.schema.createTableIfNotExists('targets', function (table) {
      table.increments();
      table.string('target_name').notNullable();
      table.string('location').notNullable();
      table.string('target_photo').notNullable();
      table.integer('security_level').defaultTo(3);
    });
  })
  .then(function () {
    // Creating Clients table.
    return knex.schema.createTableIfNotExists('clients', function (table) {
      table.increments();
      table.string('client_name').notNullable();
      table.string('budget').notNullable();
    });
  })
  .then(function () {
    // Creating Contracts table.
    return knex.schema.createTableIfNotExists('contracts', function (table) {
      table.increments();
      table.integer('client_id').references('clients.id').onDelete('CASCADE');
      table.integer('target_id').references('targets.id').onDelete('CASCADE');
      table.integer('price').notNullable().defaultTo(0);
      table.integer('completed_by').references('assassins.id').nullable().onDelete('CASCADE');
      table.boolean('completed').defaultTo('false');
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('contracts')
  .then(function () {
    return knex.schema.dropTableIfExists('targets');
  })
  .then(function () {
    return knex.schema.dropTableIfExists('clients');
  })
  .then(function () {
    return knex.schema.dropTableIfExists('assassins');
  });

};
