/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('organizations').del()
  return await knex('organizations').insert([
    {id: 1, name: 'Jansen Test Company'},
    {id: 2, name: 'Kanban Inc.'},
  ]);
};
