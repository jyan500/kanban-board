process.env.NODE_ENV = 'test'

var chai = require("chai")
var chaiHttp = require("chai-http")
var should = chai.should()
var { 
	createTokenForUserRole,
	createUserWithOrganization,
} = require("../helpers/test-helpers")
var { assert } = chai

// use temporary server
chai.use(chaiHttp)

var app = require("../index")
var db = require("../db/db")

describe("routes: ticket", function() {

	let token;
	beforeEach(function(done) {
		db.migrate.rollback()
		.then(function() {
			db.migrate.latest()
			.then(function() {
				return db.seed.run().then(function() {
					createTokenForUserRole(
						"Jansen", 
						"Yan",
						"jansen@jansen-test-company.com",
						"Test123!",
						"USER",
						"Jansen Test Company"
					).then(function(res){
						token = res
						done()
					});
				});
			})
		});
	});

	afterEach(function(done) {
		db.migrate.rollback()
		.then(function() {
			done();
		});
	});

	describe("/api/ticket", () => {
		it("should get tickets", async () => {
			await db("tickets").insert({
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			})
			const res = await chai.request(app).get("/api/ticket").set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length === 1, true)
		})	
		it("should get ticket by ID", async () => {
			await db("tickets").insert({
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			})
			const res = await chai.request(app).get("/api/ticket/1").set({"Authorization": `Bearer ${token}`})	
			res.status.should.equal(200)	
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length === 1, true)
		})
		it("should insert ticket", async () => {
			const payload = {
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}
			const res = await chai.request(app).post("/api/ticket").set({"Authorization": `Bearer ${token}`}).send(payload)
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const newticket = await db("tickets").where("organization_id", 1).where("name", "ticket #1").first()
			assert.equal(newticket != null, true)
			assert.equal(newticket.name, "ticket #1")
		})
		it("should update ticket", async () => {
			const id = await db("tickets").insert({
				"name": "ticket #2",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1,	
			}, ["id"])
			// update the name of the ticket
			const payload = {
				"name": "ticket #2 Updated",
				"description": "test",
				"organization_id": 1,
				"status_id": 1,
				"ticket_type_id": 1,
				"priority_id": 1,
			}
			const res = await chai.request(app).put(`/api/ticket/${id[0]}`).set({"Authorization": `Bearer ${token}`}).send(payload)
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const newticket = await db("tickets").where("id", id[0]).first()
			assert.equal(newticket != null, true)
			assert.equal(newticket.name, "ticket #2 Updated")
		})
		it("should delete ticket", async () => {
			const id = await db("tickets").insert({
				"name": "ticket #2 Updated",
				"description": "test",
				"organization_id": 1,
				"status_id": 1,
				"ticket_type_id": 1,
				"priority_id": 1,
			}, ["id"])	
			const res = await chai.request(app).delete(`/api/ticket/${id[0]}`).set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const ticket = await db("tickets").where("id", id[0]).first()
			// ticket should be deleted
			assert.equal(ticket == null, true)
		})
		it("get all assigned users for ticket", async () => {
			const userId1 = await createUserWithOrganization("Test", "User", "test@jansen-test-company.com")
			const userId2 = await createUserWithOrganization("Test2", "User2", "test2@jansen-test-company.com")
			const ticketId = await db("tickets").insert([{
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}], ["id"])
			await db("tickets_to_users").insert([
			{
				"user_id": userId1,	
				"ticket_id": ticketId
			}, 
			{
				"user_id": userId2,
				"ticket_id": ticketId
			}])
			const res = await chai.request(app).get(`/api/ticket/${ticketId[0]}/user`).set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length === 2, true)
		})
		it("can assign multiple users to ticket", async () => {
			const userId1 = await createUserWithOrganization("Test", "User", "test@jansen-test-company.com")
			const userId2 = await createUserWithOrganization("Test2", "User2", "test2@jansen-test-company.com")
			const ticketId = await db("tickets").insert([{
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}], ["id"])

			const res = await chai.request(app).post(`/api/ticket/${ticketId[0]}/user`).set({"Authorization": `Bearer ${token}`}).send({
				user_ids: [userId1, userId2]	
			})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const assignedUsers = await db("tickets_to_users").where("ticket_id", ticketId[0])
			assert.equal(assignedUsers.length, 2)
		})
		it("can delete user from ticket", async () => {
			const userId1 = await createUserWithOrganization("Test", "User", "test@jansen-test-company.com")
			const ticketId = await db("tickets").insert([{
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}], ["id"])
			await db("tickets_to_users").insert([
			{
				"user_id": userId1,	
				"ticket_id": ticketId
			}])
			const res = await chai.request(app).delete(`/api/ticket/${ticketId[0]}/user/${userId1}`).set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			const assignedUsers = await db("tickets_to_users").where("ticket_id", ticketId[0])
			assert.equal(assignedUsers.length, 0)
		})
		it("can create comment on ticket", async () => {
			const userId1 = await createUserWithOrganization("Test", "User", "test@jansen-test-company.com")
			const ticketId = await db("tickets").insert([{
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}], ["id"])
			const payload = {
				"comment": "This is a comment",
				"user_id": userId1,
				"ticket_id": ticketId[0],
			}
			const res = await chai.request(app).post(`/api/ticket/${ticketId[0]}/comment`).set({
				"Authorization": `Bearer ${token}`
			}).send(payload)
			res.status.should.equal(200)
			const comments = await db("ticket_comments").where("ticket_id", ticketId[0])
			assert.equal(comments.length, 1)
		})
		it("can get comment on ticket by comment id", async () => {
			const userId1 = await createUserWithOrganization("Test", "User", "test@jansen-test-company.com")
			const ticketId = await db("tickets").insert([{
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}], ["id"])
			const comment = await db("ticket_comments").insert([{
				"comment": "test",
				"ticket_id": ticketId[0],
				"user_id": userId1
			}], ["id"])
			const res = await chai.request(app).put(`/api/ticket/${ticketId[0]}/comment/${comment[0]}`).set({
				"Authorization": `Bearer ${token}`
			}).send({
				comment: "Test Update"
			})
			res.status.should.equal(200)
			const updatedComment = await db("ticket_comments").where("id", comment[0])
			assert.equal(updatedComment.length, 1)
			assert.equal(updatedComment[0].comment, "Test Update")
		})
		it("can delete comment on ticket by comment id", async () => {
			const userId1 = await createUserWithOrganization("Test", "User", "test@jansen-test-company.com")
			const ticketId = await db("tickets").insert([{
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}], ["id"])
			const comment = await db("ticket_comments").insert([{
				"comment": "test",
				"ticket_id": ticketId[0],
				"user_id": userId1
			}], ["id"])
			const res = await chai.request(app).delete(`/api/ticket/${ticketId[0]}/comment/${comment[0]}`).set({
				"Authorization": `Bearer ${token}`
			})
			res.status.should.equal(200)
			const updatedComment = await db("ticket_comments").where("id", comment[0])
			assert.equal(updatedComment.length, 0)
		})
		it("can update status through patch request", async () => {
			const userId1 = await createUserWithOrganization("Test", "User", "test@jansen-test-company.com")	
			const ticketId = await db("tickets").insert([{
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}], ["id"])
			const res = await chai.request(app).patch(`/api/ticket/${ticketId[0]}/status`).set({
				"Authorization": `Bearer ${token}`	
			}).send({
				status_id: 2
			})
			res.status.should.equal(200)
			const updatedTicket = await db("tickets").where("id", ticketId[0]).first()
			assert.equal(updatedTicket.status_id, 2)
		})
		it("can create relationship between two tickets", async () => {
			const userId1 = await createUserWithOrganization("Test", "User", "test@jansen-test-company.com")	
			const ticketId1 = await db("tickets").insert([{
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 4,
				"organization_id": 1
			}], ["id"])
			const ticketId2 = await db("tickets").insert([{
				"name": "ticket #2",
				"description": "test #2",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 4,
				"organization_id": 1
			}], ["id"])
			const res = await chai.request(app).post(`/api/ticket/${ticketId1[0]}/relationship`).set({
				"Authorization": `Bearer ${token}`
			}).send({
				parent_ticket_id: ticketId1[0],
				child_ticket_id: ticketId2[0],
				ticket_relationship_type_id: 1
			})
			res.status.should.equal(200)
			const relationship = await db("ticket_relationships").where("parent_ticket_id", ticketId1[0]).where("child_ticket_id", ticketId2[0]).first()
			assert.equal(relationship.length, 1)
		})
	})
})


