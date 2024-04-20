process.env.NODE_ENV = 'test'

var chai = require("chai")
var chaiHttp = require("chai-http")
var should = chai.should()
var { 
	createUser, 
	createOrganizationUserRole, 
	createUserTestToken } = require("../helpers/test-helpers")
var { assert } = chai

// use temporary server
chai.use(chaiHttp)

var app = require("../index")
var knex = require("../db/db")

describe("routes: ticket-type", function() {
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
	describe("GET /api/ticket-type", () => {
		it("should get ticket types", async () => {
			const userId = await createUser("Jansen", "Yan", "jansen@jansen-test-company.com", "Test123!")
			const userRole = await knex("user_roles").where("name", "USER").first()
			const organization = await knex("organizations").where("name", "Jansen Test Company").first()
			await createOrganizationUserRole(userId, organization.id, userRole.id)
			const token = await createUserTestToken(userId, "jansen@jansen-test-company.com", organization.id, userRole.id)
			const res = await chai.request(app).get("/api/ticket-type").set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			const body = JSON.parse(res.text)
			assert.equal(body.length > 0, true)
		})	
	})
})


