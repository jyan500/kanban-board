process.env.NODE_ENV = 'test'

var chai = require("chai")
var chaiHttp = require("chai-http")
var should = chai.should()
var { 
	createTokenForUserRole } = require("../helpers/test-helpers")
var { assert } = chai

// use temporary server
chai.use(chaiHttp)

var app = require("../index")
var knex = require("../db/db")

describe("routes: ticket-type", function() {
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
	describe("GET /api/ticket-type", () => {
		it("should get ticket types", async () => {
			const res = await chai.request(app).get("/api/ticket-type").set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length > 0, true)
		})	
		it("should get ticket type by ID", async () => {
			const res = await chai.request(app).get("/api/ticket-type/1").set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length === 1, true)
		})	
	})
})


