/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('ticket_relationship_types').del()
  return await knex('ticket_relationship_types').insert([
    {name: 'Related'},
    {name: 'Duplicate'},
    {name: 'Blocker'},
    {name: 'Epic'}
  ]);
};
