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
var db = require("../db/db")

describe("routes: board", function() {

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

	describe("/api/board", () => {
		it("should get boards", async () => {
			await db("boards").insert({
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
			await db("boards").insert({
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
			const newBoard = await db("boards").where("organization_id", 1).where("name", "Board #1").first()
			assert.equal(newBoard != null, true)
			assert.equal(newBoard.name, "Board #1")
		})
		it("should update board", async () => {
			const id = await db("boards").insert({
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
			const newBoard = await db("boards").where("id", id[0]).first()
			assert.equal(newBoard != null, true)
			assert.equal(newBoard.name, "Board #2 Updated")
		})
		it("should delete board", async () => {
			const id = await db("boards").insert({
				"name": "New Board #2",
				"organization_id": 1,	
			}, ["id"])	
			const res = await chai.request(app).delete(`/api/board/${id[0]}`).set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const board = await db("boards").where("id", id[0]).first()
			// board should be deleted
			assert.equal(board == null, true)
		})
		it("should get all tickets for board", async () => {
			const id = await db("boards").insert({
				"name": "New Board #2",
				"organization_id": 1	
			}, ["id"])	
			await db("tickets").insert([
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
			const ticketIds = await db("tickets").where("organization_id", 1).select("id")
			await db("tickets_to_boards").insert([
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
		it("can insert multiple tickets into the board", async () => {
			const id = await db("boards").insert({
				"name": "New Board #2",
				"organization_id": 1	
			}, ["id"])	
			await db("tickets").insert([
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
			const ticketIds = await db("tickets").where("organization_id", 1).select("id")
			const payload = {
				"ticket_ids": ticketIds.map((ticket)=>ticket.id)
			}
			const res = await chai.request(app).post(`/api/board/${id[0]}/ticket`).set({
				"Authorization": `Bearer: ${token}`
			}).send(payload)
			res.status.should.equal(200)

			const tickets = await db("tickets_to_boards").where("board_id", id[0])
			assert.equal(tickets.length === 2, true)
		})
		it("can delete ticket from the board", async () => {
			const id = await db("boards").insert({
				"name": "New Board #2",
				"organization_id": 1	
			}, ["id"])	
			await db("tickets").insert([
			{
				"name": "Ticket #1",
				"description": "test",
				"status_id": 1,
				"priority_id": 1,
				"ticket_type_id": 1,
				"organization_id": 1
			}])
			const ticketIds = await db("tickets").where("organization_id", 1).select("id")
			await db("tickets_to_boards").insert([
				{
					"board_id": id[0],
					"ticket_id": ticketIds[0].id
				},
			])
			const res = await chai.request(app).delete(`/api/board/${id[0]}/ticket/${ticketIds[0].id}`).set({
				"Authorization": `Bearer: ${token}`
			})
			res.status.should.equal(200)
			const tickets = await db("tickets_to_boards").where("board_id", id[0])
			assert(tickets.length === 0, true)
		})
		it("should get all statuses for board", async () => {
			const id = await db("boards").insert({
				"name": "New Board #2",
				"organization_id": 1	
			}, ["id"])		
			await db("boards_to_statuses").insert([
			{
				"board_id": id[0],
				"status_id": 1
			},
			{
				"board_id": id[0],	
				"status_id": 2
			},
			{
				"board_id": id[0],
				"status_id": 3
			}
			])
			const res = await chai.request(app).get(`/api/board/${id[0]}/status`).set({
				"Authorization": `Bearer: ${token}`
			})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length, 3)
		})
		it("can insert multiple statuses into the board", async () => {
			const id = await db("boards").insert({
				"name": "New Board #2",
				"organization_id": 1	
			}, ["id"])	
			const payload = {
				status_ids: [1,2,3]
			}
			const res = await chai.request(app).post(`/api/board/${id[0]}/status`).set({
				"Authorization": `Bearer: ${token}`
			}).send(payload)
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const statuses = await db("boards_to_statuses").where("board_id", id[0])
			assert.equal(statuses.length, 3)
		})
		it("should fail if inserting a status that does not belong to logged in user's organization", async () => {
			const id = await db("boards").insert({
				"name": "New Board #2",
				"organization_id": 1
			}, ["id"])	
			const payload = {
				
			}
		})
		it("can delete status from the board", async () => {
			const id = await db("boards").insert({
				"name": "New Board #2",
				"organization_id": 1	
			}, ["id"])	
			const statusId = 1
			await db("boards_to_statuses").insert([{
				"board_id": id[0],
				"status_id": statusId 
			}])
			const res = await chai.request(app).delete(`/api/board/${id[0]}/status/${statusId}`).set({
				"Authorization": `Bearer: ${token}`
			})
			res.status.should.equal(200)
			const status = await db("boards_to_statuses").where("board_id", id[0])	
			assert.equal(status.length, 0)
		})
	})
})


