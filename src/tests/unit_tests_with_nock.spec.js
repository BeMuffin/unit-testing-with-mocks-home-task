const { describe, it, afterEach } = require('mocha')
const sinon = require('sinon')
const nock = require('nock')
const { expect } = require('chai')
const jsonUserData = require('../../data/users.json')

const UserDataHandler = require('../data_handlers/user_data_handler')

describe('User data handler', function () {
  afterEach(function () {
    sinon.restore()
    nock.cleanAll()
  })

  it('should load users data successfully', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)

    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()

    expect(userDataHandler.users).to.deep.equal(jsonUserData)
  })

  it('should throw an error when failing to load users data', async function () {
    const errorMessage = 'Failed to load users data: Error'
    nock('http://localhost:3000')
      .get('/users')
      .replyWithError('')
    const userDataHandler = new UserDataHandler()
    try {
      await userDataHandler.loadUsers()
    } catch (error) {
      expect(error.message).to.equal(errorMessage)
    }
  })

  it('should return user emails list successfully', async function () {
    const expectedEmailsList = jsonUserData.map(user => user.email).join(';')
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)
    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()
    const response = userDataHandler.getUserEmailsList()
    expect(response).to.equal(expectedEmailsList)
  })

  it('should return an error when user emails list is empty', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, [])
    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()
    try {
      userDataHandler.getUserEmailsList()
    } catch (error) {
      expect(error.message).to.equal('No users loaded!')
    }
  })

  it('should return number of users successfully', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)
    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()
    const response = userDataHandler.getNumberOfUsers()
    expect(response).to.equal(jsonUserData.length)
  })

  it('should return an error when users list is empty', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, [])
    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()
    try {
      userDataHandler.getNumberOfUsers()
    } catch (error) {
      expect(error.message).to.equal('No users loaded!')
    }
  })

  it('should check that objects are matching search parameters successfully', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)
    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()
    const searchParams = { id: 1, username: 'Bret' }
    const response = userDataHandler.isMatchingAllSearchParams(jsonUserData[0], searchParams)
    expect(response).to.equal(true)
  })

  it('should check that objects are not matching search parameters', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)
    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()
    const searchParams = { id: 2, username: 'Bret' }
    const response = userDataHandler.isMatchingAllSearchParams(jsonUserData[0], searchParams)
    expect(response).to.equal(false)
  })

  it('should check received false when search parameter doesn\'t exist', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)
    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()
    const searchParams = { id: 1, username: 'Bret', phoneNumber: '1234566' }
    const response = userDataHandler.isMatchingAllSearchParams(jsonUserData[0], searchParams)
    expect(response).to.equal(false)
  })

  it('should find user by search parameters successfully', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)

    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()
    const searchParams = { id: 1, username: 'Bret' }
    const response = userDataHandler.findUsers(searchParams)
    expect(response).to.deep.equal([jsonUserData[0]])
  })

  it('should throw an error when no search parameters provided', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)
    const userDataHandler = new UserDataHandler()
    await userDataHandler.loadUsers()
    try {
      userDataHandler.findUsers()
    } catch (error) {
      expect(error.message).to.equal('No search parameters provoded!')
    }
  })

  it('should throw an error when users are not loaded', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)
    const userDataHandler = new UserDataHandler()
    userDataHandler.users = []
    await userDataHandler.loadUsers()
    const searchParams = { id: 1, username: 'Bret' }
    try {
      userDataHandler.findUsers(searchParams)
    } catch (error) {
      expect(error.message).to.equal('No users loaded!')
    }
  })

  it('should throw an error when no matching users found', async function () {
    nock('http://localhost:3000')
      .get('/users')
      .reply(200, jsonUserData)
    const userDataHandler = new UserDataHandler()
    const searchParams = { id: 1, username: 'Bret' }
    await userDataHandler.loadUsers()
    const isMatchingAllSearchParamsStub = sinon.stub(userDataHandler, 'isMatchingAllSearchParams')
    isMatchingAllSearchParamsStub.resolves(false)
    try {
      userDataHandler.findUsers(searchParams)
    } catch (error) {
      expect(error.message).to.equal('No matching users found!')
    }
  })
})
