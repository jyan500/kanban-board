/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('notification_types').del()
  await knex('notification_types').insert([
    {id: 1, name: "Watching Ticket"},
    {id: 2, name: "Mention"},
    {id: 3, name: "Ticket Update"},
  ]);
};
