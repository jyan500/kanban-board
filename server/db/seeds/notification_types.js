/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('notification_types').del()
  await knex('notification_types').insert([
    {name: "Watching Ticket", template: "{{{recipient_name}}} is now watching the ticket: {{{ticket_name}}}"},
    {name: "Mention", template: "{{{sender_name}}} has mentioned you here: {{{ticket_name}}}"},
    {name: "Ticket Assigned", template: "{{{sender_name}}} has assigned you to the ticket: {{{ticket_name}}}"},
    {name: "Bulk Assigned", template: "{{{sender_name}}} has assigned {{{num_tickets}}} tickets to you"},
    {name: "Bulk Watching", template: "You are now watching {{{num_tickets}}} tickets"}
  ]);
};
