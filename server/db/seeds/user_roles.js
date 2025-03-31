/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('user_roles').del()
  return await knex('user_roles').insert([
    {name: 'USER'},
    {name: 'ADMIN'},
    {name: 'BOARD_ADMIN'},
  ]);
};
