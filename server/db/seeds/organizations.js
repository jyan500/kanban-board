/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('organizations').del()
  return await knex('organizations').insert([
    {name: 'Jansen Test Company'},
    {name: 'Kanban Inc.'},
  ]);
};
