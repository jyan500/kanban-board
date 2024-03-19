/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('user_roles').del()
  await knex('user_roles').insert([
    {id: 1, name: 'USER'},
    {id: 2, name: 'ADMIN'},
    {id: 3, name: 'BOARD_ADMIN'},
  ]);
};
