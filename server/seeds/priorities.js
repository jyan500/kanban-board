/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('priorities').del()
  await knex('priorities').insert([
    {id: 1, name: 'High', order: 1},
    {id: 2, name: 'Medium', order: 2},
    {id: 3, name: 'Low', order: 3}
  ]);
};
