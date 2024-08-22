/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('ticket_relationship_types').del()
  return await knex('ticket_relationship_types').insert([
    {id: 1, name: 'Related'},
    {id: 2, name: 'Duplicate'},
    {id: 3, name: 'Blocker'},
    {id: 4, name: 'Epic'}
  ]);
};
