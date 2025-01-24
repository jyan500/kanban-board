/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('statuses').del()
  return await knex('statuses').insert([
    {id: 1, name: 'To-Do', organization_id: 1, order: 1},
    {id: 2, name: 'In Progress', organization_id: 1, order: 2},
    {id: 3, name: 'Code Complete', organization_id: 1, order: 3},
    {id: 4, name: 'On Test', organization_id: 1, order: 4},
    {id: 5, name: 'Staging', organization_id: 1, order: 5},
    {id: 6, name: 'Selected For Dev', organization_id: 2, order: 1},
    {id: 7, name: 'In Progress', organization_id: 2, order: 2},
    {id: 8, name: 'Code Complete', organization_id: 2, order: 3},
    {id: 9, name: 'On Test', organization_id: 2, order: 4},
    {id: 10, name: 'Complete', organization_id: 2, order: 5, is_completed: 1},
  ]);
};
