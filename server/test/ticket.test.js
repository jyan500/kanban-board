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
var knex = require("../db/db")

describe("routes: ticket", function() {

	let token;
	beforeEach(function(done) {
		knex.migrate.rollback()
		.then(function() {
			knex.migrate.latest()
			.then(function() {
				return knex.seed.run().then(function() {
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
		knex.migrate.rollback()
		.then(function() {
			done();
		});
	});

	describe("/api/ticket", () => {
		it("should get tickets", async () => {
			await knex("tickets").insert({
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
			await knex("tickets").insert({
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
			const newticket = await knex("tickets").where("organization_id", 1).where("name", "ticket #1").first()
			assert.equal(newticket != null, true)
			assert.equal(newticket.name, "ticket #1")
		})
		it("should update ticket", async () => {
			const id = await knex("tickets").insert({
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
			const newticket = await knex("tickets").where("id", id[0]).first()
			assert.equal(newticket != null, true)
			assert.equal(newticket.name, "ticket #2 Updated")
		})
		it("should delete ticket", async () => {
			const id = await knex("tickets").insert({
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
			const ticket = await knex("tickets").where("id", id[0]).first()
			// ticket should be deleted
			assert.equal(ticket == null, true)
		})
		it("get all assigned users for ticket", async () => {
			const userId1 = await createUserWithOrganization("Test", "User", "test@jansen-test-company.com")
			const userId2 = await createUserWithOrganization("Test2", "User2", "test2@jansen-test-company.com")
			const ticketId = await knex("tickets").insert([{
				"name": "ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}], ["id"])
			await knex("tickets_to_users").insert([
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
	})
})


