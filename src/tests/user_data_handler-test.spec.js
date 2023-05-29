const { describe, it, afterEach } = require('mocha')
const { expect } = require('chai')
const sinon = require('sinon')
const axios = require('axios')
const jsonUserData = require('../../data/users.json')
const proxyquire = require('proxyquire')

let userDataHandler

describe('User data handler', function () {
  afterEach(async function () {
    sinon.restore()
  })
  it('should load users data successfully', async function () {
    const stub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: stub
    })
    userDataHandler = new UserDataHandler()
    stub.resolves({ data: jsonUserData })
    await userDataHandler.loadUsers()
    expect(userDataHandler.users).to.deep.equal(jsonUserData)
  })

  it('should throw an error when failing to load users data', async function () {
    const stub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: stub
    })
    userDataHandler = new UserDataHandler()
    const errorMessage = 'Failed to load users data: [object Object]'
    stub.rejects({ data: new Error(errorMessage) })
    try {
      await userDataHandler.loadUsers()
      expect.fail(errorMessage)
    } catch (error) {
      expect(error.message).to.equal(errorMessage)
    }
  })

  it('should return user emails list successfully', async function () {
    const expectedEmailsList = jsonUserData.map(user => user.email).join(';')
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: jsonUserData })
    await userDataHandler.loadUsers()
    const response = userDataHandler.getUserEmailsList()
    expect(response).to.equal(expectedEmailsList)
  })

  it('should return an error when user emails list is empty', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: [] })
    await userDataHandler.loadUsers()
    try {
      userDataHandler.getUserEmailsList()
      expect.fail('No users loaded!')
    } catch (error) {
      expect(error.message).to.equal('No users loaded!')
    }
  })

  it('should return number of users successfully', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: jsonUserData })
    await userDataHandler.loadUsers()
    const response = userDataHandler.getNumberOfUsers()
    expect(response).to.equal(jsonUserData.length)
  })

  it('should return an error when users list is empty', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: [] })
    await userDataHandler.loadUsers()
    try {
      userDataHandler.getNumberOfUsers()
      expect.fail('No users loaded!')
    } catch (error) {
      expect(error.message).to.equal('No users loaded!')
    }
  })

  it('should check that objects is matching search parameters successfully', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: jsonUserData })
    await userDataHandler.loadUsers()
    const searchParams = { id: 1, username: 'Bret' }
    const response = userDataHandler.isMatchingAllSearchParams(jsonUserData[0], searchParams)
    expect(response).to.equal(true)
  })

  it('should check that objects is not matching search parameters', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: jsonUserData })
    await userDataHandler.loadUsers()
    const searchParams = { id: 2, username: 'Bret' }
    const response = userDataHandler.isMatchingAllSearchParams(jsonUserData[0], searchParams)
    expect(response).to.equal(false)
  })

  it('should check received false with doesn\'t exist search parameter', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: jsonUserData })
    await userDataHandler.loadUsers()
    const searchParams = { id: 1, username: 'Bret', phoneNumber: '1234566' }
    const response = userDataHandler.isMatchingAllSearchParams(jsonUserData[0], searchParams)
    expect(response).to.equal(false)
  })

  it('should find user by search parameters successfully', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: jsonUserData })
    await userDataHandler.loadUsers()
    const searchParams = { id: 1, username: 'Bret' }
    const response = userDataHandler.findUsers(searchParams)
    expect(response).to.deep.equal([jsonUserData[0]])
  })

  it('should thow and error when no search parameters provoded', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: jsonUserData })
    await userDataHandler.loadUsers()
    try {
      userDataHandler.findUsers()
    } catch (error) {
      expect(error.message).to.equal('No search parameters provoded!')
    }
  })

  it('should thow and error when users are not loaded', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: jsonUserData })
    userDataHandler.users = []
    const searchParams = { id: 1, username: 'Bret' }
    await userDataHandler.loadUsers()
    try {
      userDataHandler.findUsers(searchParams)
    } catch (error) {
      expect(error.message).to.equal('No users loaded!')
    }
  })

  it('should thow and error when matching users are not found', async function () {
    const getUsersStub = sinon.stub(axios, 'get')
    const UserDataHandler = proxyquire('../data_handlers/user_data_handler.js', {
      axios: getUsersStub
    })
    userDataHandler = new UserDataHandler()
    getUsersStub.resolves({ data: jsonUserData })
    const isMatchingAllSearchParamsStub = sinon.stub(userDataHandler, 'isMatchingAllSearchParams')
    const searchParams = { id: 1, username: 'Bret' }
    isMatchingAllSearchParamsStub.resolves(false)
    await userDataHandler.loadUsers()
    try {
      userDataHandler.findUsers(searchParams)
    } catch (error) {
      expect(error.message).to.equal('No matching users found!')
    }
  })
})
