import supertest from 'supertest';

describe('User registration', () => {
	const app = supertest('http://localhost:3000/users');

	test('Create a new user', async () => {
		const requestBody = {
			email: 'test1@brunel.ac.uk',
			password: 'password',
			username: 'TestUser1'
		};

		const resp = await app.post('/create').send(requestBody);

		expect(resp.statusCode).toBe(201);
	});

	test('Create new user with existing email', async () => {
		const requestBody = {
			email: 'test1@brunel.ac.uk',
			password: 'password',
			username: 'TestUser2'
		};

		const resp = await app.post('/create').send(requestBody);

		expect(resp.statusCode).toBe(409);
		expect(resp.body).toEqual({ message: 'Email already in use' });
	});

	test('Create new user with existing username', async () => {
		const requestBody = {
			email: 'test2@brunel.ac.uk',
			password: 'password',
			username: 'TestUser1'
		};

		const resp = await app.post('/create').send(requestBody);

		expect(resp.statusCode).toBe(409);
		expect(resp.body).toEqual({ message: 'Username already in use' });
	});

	test('Create new user with invalid email', async () => {
		const requestBody = {
			email: 'test1brunel.ac.uk',
			password: 'password',
			username: 'TestUser2'
		};

		const resp = await app.post('/create').send(requestBody);

		expect(resp.statusCode).toBe(400);
	});

	test('Create new user with invalid username', async () => {
		const requestBody = {
			email: 'test2@brunel.ac.uk',
			password: 'password',
			username: '12'
		};

		let resp = await app.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);

		requestBody.username = 'user#';

		resp = await app.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);

		requestBody.username = 'a bcd';

		resp = await app.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);

		requestBody.username = 'aaaaaaaaaaaaaaaaaaaaaaaaa';

		resp = await app.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);
	});

	test('Create new user with short password', async () => {
		const requestBody = {
			email: 'test2@brunel.ac.uk',
			password: 'passw',
			username: 'TestUser2'
		};

		const resp = await app.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);
	});

	test('Create user without academic email address', async () => {
		const requestBody = {
			email: 'test2@gmail.com',
			password: 'password',
			username: 'TestUser2'
		};

		const resp = await app.post('/create').send(requestBody);

		expect(resp.statusCode).toBe(400);
		expect(resp.body).toEqual({ message: 'Unknown university email domain' });
	});
});
