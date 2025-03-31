/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('priorities').del()
  return await knex('priorities').insert([
    {name: 'High', order: 1},
    {name: 'Medium', order: 2},
    {name: 'Low', order: 3}
  ]);
};
