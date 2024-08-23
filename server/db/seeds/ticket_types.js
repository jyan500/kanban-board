/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('ticket_types').del()
  return await knex('ticket_types').insert([
    {id: 1, name: 'Feature'},
    {id: 2, name: 'Modification'},
    {id: 3, name: 'Bug'},
    {id: 4, name: 'Epic'}
  ]);
};
