process.env.NODE_ENV = 'test'

var chai = require("chai")
var chaiHttp = require("chai-http")
var should = chai.should()

// use temporary server
chai.use(chaiHttp)
var { assert } = chai

var app = require("../index")
var db = require("../db/db")

const { createTokenForUserRole, createUser } = require("../helpers/test-helpers")

describe("private-routes: organization", function(){
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
						"ADMIN", // must be admin for the tests to work due to the addition of the user role middleware
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

  describe("/api/organization/registration-request", () => {
  	it("should get a registration request", async () => {
			const user1 = await createUser("Jansen", "Test", "jansen-test@jansen-test-company.com", "Test123!")
			const regId1 = await db("user_registration_requests").insert({
				"user_id": user1,
				"organization_id": 1
			}, ["id"])
			const res = await chai.request(app).get(`/api/organization/registration-request/${regId1[0]}`).set({
				"Authorization": `Bearer ${token}`
			})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			let body = JSON.parse(res.text)
			assert.equal(body.data.length === 1, true)
  	})
		it("should get all registration requests", async () => {
			const user1 = await createUser("Jansen", "Test", "jansen-test@jansen-test-company.com", "Test123!")
			const user2 = await createUser("Jansen", "Test2", "jansen-test-2@jansen-test-company.com", "Test123!")
			await db("user_registration_requests").insert([{
				"user_id": user1,
				"organization_id": 1
			},
			{
				"user_id": user2,
				"organization_id": 1
			}])
			const res = await chai.request(app).get("/api/organization/registration-request").set({"Authorization": `Bearer ${token}`})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			let body = JSON.parse(res.text)
			assert.equal(body.data.length === 2, true)
		})	
		it("should update all registration requests", async () => {
			const approvedByUser = await db("users").where("first_name", "Jansen").where("last_name", "Yan").first()
			const user1 = await createUser("Jansen", "Test", "jansen-test@jansen-test-company.com", "Test123!")
			const user2 = await createUser("Jansen", "Test2", "jansen-test-2@jansen-test-company.com", "Test123!")
			const regId1 = await db("user_registration_requests").insert({
				"user_id": user1,
				"organization_id": 1
			}, ["id"])
			const regId2 = await db("user_registration_requests").insert({
				"user_id": user2,	
				"organization_id": 1
			}, ["id"])	
			const res = await chai.request(app).post("/api/organization/registration-request/bulk-edit").set({
				"Authorization": `Bearer ${token}`
			}).send({
				user_registration_request_ids: [regId1[0], regId2[0]]
			})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			// check that both requests were approved
			const reg1 = await db("user_registration_requests").where("id", regId1[0]).first()
			const reg2 = await db("user_registration_requests").where("id", regId2[0]).first()
			assert.equal(reg1?.org_user_id, approvedByUser?.id)
			assert.equal(reg2?.org_user_id, approvedByUser?.id)
		})
		it("should update a registration request", async () => {
			const approvedByUser = await db("users").where("first_name", "Jansen").where("last_name", "Yan").first()
			const user1 = await createUser("Jansen", "Test", "jansen-test@jansen-test-company.com", "Test123!")
			const regId1 = await db("user_registration_requests").insert({
				"user_id": user1,
				"organization_id": 1
			}, ["id"])
			const res = await chai.request(app).put(`/api/organization/registration-request/${regId1[0]}`).set({
				"Authorization": `Bearer ${token}`
			})
			res.status.should.equal(200)
			res.type.should.equal("application/json")
			// check that both requests were approved
			const reg1 = await db("user_registration_requests").where("id", regId1[0]).first()
			assert.equal(reg1?.org_user_id, approvedByUser?.id)
		})
	})
})

describe("routes: organization", function() {
	beforeEach(function(done) {
    db.migrate.rollback()
    .then(function() {
      db.migrate.latest()
      .then(function() {
        return db.seed.run().then(function() {
          done();
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
	describe("/api/organization", () => {
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


