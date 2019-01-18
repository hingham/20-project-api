# Project - API Server

## Submission Instructions
* Follow the instructions in the "Lab Instructions" documentation in the reference folder of the class repository

### Overview
Implement a fully functional, authenticated and authorized API Server using the latest coding techniques

#### Feature Tasks -- Server
* Use the `async/await` pattern where possible instead of promises for all asynchronous actions
* Multiple Models supported using a dynamic model loader
* Single API to work with all models for basic CRUD operations
* API Routes to be protected with the proper permissions based on user capability
  * `app.get('/schema')` should require the `superuser` capability
  * `app.get(...)` should require the `read` capability
  * `app.post(...)` should require the `create` capability
  * `app.put(...)` should require the `update` capability
  * `app.patch(...)` should require the `update` capability
  * `app.delete(...)` should require the `delete` capability

#### Stretch Goals
* Clean and modularize Auth Middleware
* Clean/Tighten the Auth Model
* Multiple OAuth Providers Support
  * Create an abstraction for the `oauth` route

#### Test
* 100% Test Coverage Goal For:
  * Auth router
    * Signup
    * Sign In via username/password or Token
  * Model Finder Middleware
  * Auth Middleware
    * Protected Routes
  * OAuth Chooser
  * API Routes
    * Make assertions on the data shapes returned from the API routes

#### Documentation
Write developer documentation to completely document usage of the API Server for developers
* JSDoc for all functions
* Working Swagger for the API

In the README.md write doc for developers ...
* How do I add models?
* How do I add new OAuth Providers?
* How do I identify an OAUth provider
* How do I setup my .env?  How do I set that up remotely?
* What routes are supported?
* How do I call them and what data do they expect?
* What format does data come back?
