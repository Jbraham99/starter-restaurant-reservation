
exports.up = function(knex) {
  return knex.schema.createTable("tables", (table) => {
    table.increments("table_id").primary();
    table.string("table_name")
    table.integer("capacity")
    table.string("status").defaultTo("free");
    table.integer("reservation_id")
    table.timestamps(true, true);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("tables")
};
