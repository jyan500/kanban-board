process.env.NODE_ENV = 'test'

var chai = require("chai")
var chaiHttp = require("chai-http")
var should = chai.should()
var { 
	createTokenForUserRole 
} = require("../helpers/test-helpers")
var { assert } = chai

// use temporary server
chai.use(chaiHttp)

var app = require("../index")
var knex = require("../db/db")

describe("routes: board", function() {

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

	describe("/api/board", () => {
		it("should get boards", async () => {
			await knex("boards").insert({
				"name": "Board #1",
				"organization_id": 1
			})
			const res = await chai.request(app).get("/api/board").set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length === 1, true)
		})	
		it("should get board by ID", async () => {
			await knex("boards").insert({
				"name": "Board #1",
				"organization_id": 1
			})
			const res = await chai.request(app).get("/api/board/1").set({"Authorization": `Bearer ${token}`})	
			res.status.should.equal(200)	
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length === 1, true)
		})
		it("should insert board", async () => {
			const payload = {
				"name": "Board #1",
				"organization_id": 1,
			}
			const res = await chai.request(app).post("/api/board").set({"Authorization": `Bearer ${token}`}).send(payload)
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const newBoard = await knex("boards").where("organization_id", 1).where("name", "Board #1").first()
			assert.equal(newBoard != null, true)
			assert.equal(newBoard.name, "Board #1")
		})
		it("should update board", async () => {
			const id = await knex("boards").insert({
				"name": "Board #2",
				"organization_id": 1,	
			}, ["id"])
			// update the name of the board
			const payload = {
				"name": "Board #2 Updated",
				"organization_id": 1,
			}
			const res = await chai.request(app).put(`/api/board/${id[0]}`).set({"Authorization": `Bearer ${token}`}).send(payload)
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const newBoard = await knex("boards").where("id", id[0]).first()
			assert.equal(newBoard != null, true)
			assert.equal(newBoard.name, "Board #2 Updated")
		})
		it("should delete board", async () => {
			const id = await knex("boards").insert({
				"name": "New Board #2",
				"organization_id": 1,	
			}, ["id"])	
			const res = await chai.request(app).delete(`/api/board/${id[0]}`).set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const board = await knex("boards").where("id", id[0]).first()
			// board should be deleted
			assert.equal(board == null, true)
		})
		it("should get all tickets for board", async () => {
			const id = await knex("boards").insert({
				"name": "New Board #2",
				"organization_id": 1	
			}, ["id"])	
			await knex("tickets").insert([
			{
				"name": "Ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			},
			{
				"name": "Ticket #2",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}])
			const ticketIds = await knex("tickets").where("organization_id", 1).select("id")
			await knex("tickets_to_boards").insert([
				{
					"board_id": id[0],
					"ticket_id": ticketIds[0].id
				},
				{
					"board_id": id[0],
					"ticket_id": ticketIds[1].id
				}
			])
			const res = await chai.request(app).get(`/api/board/${id[0]}/ticket`).set({
				"Authorization": `Bearer: ${token}`
			})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length === 2, true)
		})
	})
})


