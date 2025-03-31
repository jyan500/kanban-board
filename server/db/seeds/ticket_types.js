/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('ticket_types').del()
  return await knex('ticket_types').insert([
    {name: 'Feature'},
    {name: 'Modification'},
    {name: 'Bug'},
    {name: 'Epic'}
  ]);
};
