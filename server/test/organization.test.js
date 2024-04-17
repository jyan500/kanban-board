process.env.NODE_ENV = 'test'

var chai = require("chai")
var chaiHttp = require("chai-http")
var should = chai.should()

// use temporary server
chai.use(chaiHttp)

var app = require("../index")
var knex = require("../db/db")

describe("routes: organization", function() {
	beforeEach(function(done) {
    knex.migrate.rollback()
    .then(function() {
      knex.migrate.latest()
      .then(function() {
        return knex.seed.run().then(function() {
          done();
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
	describe("GET /api/organization", () => {
		it("should get organizations", (done) => {
			chai.request(app).get("/api/organization").end((err, res) => {
				res.status.should.equal(200)
				res.type.should.equal("application/json")
				let body = JSON.parse(res.text)
				body.length.should.equal(2)
				done()
			})	
		})	
		it("should get organization by id", (done) => {
			chai.request(app).get("/api/organization/1").end((err, res) => {
				res.status.should.equal(200)
				res.type.should.equal("application/json")
				let body = JSON.parse(res.text)
				body.length.should.equal(1)
				done()
			})	
		})	
	})
})


