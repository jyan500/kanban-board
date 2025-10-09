/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('filters').del()
  return await knex('filters').insert([
    {name: 'sprintId', organization_id: 1, order: 5},
    {name: 'ticketTypeId', organization_id: 1, order: 1},
    {name: 'statusId', organization_id: 1, order: 3},
    {name: 'priorityId', organization_id: 1, order: 2},
    {name: 'assignee', organization_id: 1, order: 4},
    {name: 'sprintId', organization_id: 2, order: 5},
    {name: 'ticketTypeId', organization_id: 2, order: 1},
    {name: 'statusId', organization_id: 2, order: 3},
    {name: 'priorityId', organization_id: 2, order: 2},
    {name: 'assignee', organization_id: 2, order: 4},
  ]);
};
