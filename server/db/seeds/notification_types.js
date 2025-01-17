/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('notification_types').del()
  await knex('notification_types').insert([
    {id: 1, name: "Watching Ticket", template: "{{{recipient_name}}} is now watching the ticket: {{{ticket_name}}}"},
    {id: 2, name: "Mention", template: "{{{sender_name}}} has mentioned you here: {{{ticket_name}}}"},
    {id: 3, name: "Ticket Update", template: "{{{sender_name}}} has updated the ticket: {{{ticket_name}}}"},
    {id: 4, name: "Ticket Assigned", template: "{{{sender_name}}} has assigned you to the ticket: {{{ticket_name}}}"},
  ]);
};
