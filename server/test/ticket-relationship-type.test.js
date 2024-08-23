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
var db = require("../db/db")

describe("routes: ticket-relationship-type", function() {
	let token;
	beforeEach(function(done) {
		db.migrate.rollback()
		.then(function() {
			db.migrate.latest()
			.then(function() {
				try{
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
				}
				catch(err){
					console.log("something went wrong with seeding")
				}
			})
		});
	});

	afterEach(function(done) {
		db.migrate.rollback()
		.then(function() {
			done();
		});
	});
	describe("/api/ticket-relationship-type", () => {
		it("should get ticket relationship types", async () => {
			const res = await chai.request(app).get("/api/ticket-relationship-type").set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length > 0, true)
		})	
		it("should get ticket relationship type by ID", async () => {
			const res = await chai.request(app).get("/api/ticket-relationship-type/1").set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length === 1, true)
		})	
	})
})


