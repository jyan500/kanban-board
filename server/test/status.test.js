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

describe("routes: status", function() {

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

	describe("/api/status", () => {
		it("should get statuses", async () => {
			const res = await chai.request(app).get("/api/status").set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length > 0, true)
		})	
		it("should get status by ID", async () => {
			const res = await chai.request(app).get("/api/status/1").set({"Authorization": `Bearer ${token}`})	
			res.status.should.equal(200)	
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length === 1, true)
		})
		it("should prevent duplicate statuses from being inserted", async () => {
			const order = await knex("statuses").where("organization_id", 1).max("order as order").first()
			const payload = {
				"name": "New Status #2",
				"organization_id": 1,	
				// order already exists
				"order": order.order
			}
			const res = await chai.request(app).post("/api/status").set({"Authorization": `Bearer ${token}`}).send(payload)
			// should return 422 because order already exists for this organization
			res.status.should.equal(422)		
		})
		it("should insert status", async () => {
			const order = await knex("statuses").where("organization_id", 1).max("order as order").first()
			const newOrder = parseInt(order.order) + 1
			const payload = {
				"name": "New Status",
				"organization_id": 1,
				"order": newOrder
			}
			const res = await chai.request(app).post("/api/status").set({"Authorization": `Bearer ${token}`}).send(payload)
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const newStatus = await knex("statuses").where("organization_id", 1).where("name", "New Status").first()
			assert.equal(newStatus != null, true)
			assert.equal(newStatus.name, "New Status")
		})
		it("should update status", async () => {
			const order = await knex("statuses").where("organization_id", 1).max("order as order").first()
			const newOrder = parseInt(order.order) + 1
			const id = await knex("statuses").insert({
				"name": "New Status #2",
				"organization_id": 1,	
				"order": newOrder
			}, ["id"])
			// update the name of the status
			const payload = {
				"name": "New Status #2 Updated",
				"organization_id": 1,
				"order": newOrder
			}
			const res = await chai.request(app).put(`/api/status/${id[0]}`).set({"Authorization": `Bearer ${token}`}).send(payload)
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const newStatus = await knex("statuses").where("id", id[0]).first()
			assert.equal(newStatus != null, true)
			assert.equal(newStatus.name, "New Status #2 Updated")
		})
		it("should delete status", async () => {
			const order = await knex("statuses").where("organization_id", 1).max("order as order").first()
			const newOrder = parseInt(order.order) + 1
			const id = await knex("statuses").insert({
				"name": "New Status #2",
				"organization_id": 1,	
				"order": newOrder
			}, ["id"])	
			const res = await chai.request(app).delete(`/api/status/${id[0]}`).set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const status = await knex("statuses").where("id", id[0]).first()
			// status should be deleted
			assert.equal(status == null, true)
		})
	})
})


