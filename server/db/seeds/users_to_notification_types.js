/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users_to_notification_types').del()
  const users = await knex("users")
  const notificationTypes = await knex("notification_types")
  const toInsert = []
  users.forEach((user) => {
    notificationTypes.forEach(async (notificationType) => {
      toInsert.push({
        user_id: user.id,
        notification_type_id: notificationType.id
      })
    })
  })
  await knex('users_to_notification_types').insert(toInsert);
};
