import supertest from 'supertest';
import he from 'he';
import mailhog from './scripts/mailhog';
import { createNewSession, createNewVerifiedUser } from './common';

const apiUsers = supertest('http://localhost:3000/users');
const apiAuth = supertest('http://localhost:3000/auth');

let cookies: string[];

describe('User registration', () => {
	test('Create a new user', async () => {
		await createNewVerifiedUser({
			email: 'test1@brunel.ac.uk',
			password: 'password',
			username: 'TestUser1'
		});
	});
});

describe('User registration error handling', () => {
	test('Create new user with existing email', async () => {
		const requestBody = {
			email: 'test1@brunel.ac.uk',
			password: 'password',
			username: 'TestUser2'
		};

		const resp = await apiUsers.post('/create').send(requestBody);

		expect(resp.statusCode).toBe(409);
		expect(resp.body).toEqual({ message: 'Email already in use' });
	});

	test('Create new user with existing username', async () => {
		const requestBody = {
			email: 'test2@brunel.ac.uk',
			password: 'password',
			username: 'TestUser1'
		};

		const resp = await apiUsers.post('/create').send(requestBody);

		expect(resp.statusCode).toBe(409);
		expect(resp.body).toEqual({ message: 'Username already in use' });
	});

	test('Create new user with invalid email', async () => {
		const requestBody = {
			email: 'test1brunel.ac.uk',
			password: 'password',
			username: 'TestUser2'
		};

		const resp = await apiUsers.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);
	});

	test('Create new user with invalid username', async () => {
		const requestBody = {
			email: 'test2@brunel.ac.uk',
			password: 'password',
			username: '12'
		};

		let resp = await apiUsers.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);

		requestBody.username = 'user#';

		resp = await apiUsers.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);

		requestBody.username = 'a bcd';

		resp = await apiUsers.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);

		requestBody.username = 'aaaaaaaaaaaaaaaaaaaaaaaaa';

		resp = await apiUsers.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);
	});

	test('Create new user with short password', async () => {
		const requestBody = {
			email: 'test2@brunel.ac.uk',
			password: 'passw',
			username: 'TestUser2'
		};

		const resp = await apiUsers.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);
	});

	test('Create user without academic email address', async () => {
		const requestBody = {
			email: 'test2@gmail.com',
			password: 'password',
			username: 'TestUser2'
		};

		const resp = await apiUsers.post('/create').send(requestBody);
		expect(resp.statusCode).toBe(400);
		expect(resp.body).toEqual({ message: 'Unknown university email domain' });
	});
});

describe('User sign-in flow', () => {
	test('User attempts sign in with incorrect details', async () => {
		let requestBody: any = {
			email: 'test@test.com',
			password: 'password'
		};

		let resp = await apiAuth.post('/signin').send(requestBody);
		expect(resp.statusCode).toBe(401);

		requestBody = {
			email: 'test1@brunel.ac.uk',
			password: undefined
		};

		resp = await apiAuth.post('/signin').send(requestBody);
		expect(resp.statusCode).toBe(400);
	});

	test('User signs in and gets profile', async () => {
		const requestBody = {
			email: 'test1@brunel.ac.uk',
			password: 'password'
		};

		[, cookies] = await createNewSession(requestBody);

		const resp = await apiUsers.get('/me').set('Cookie', cookies).send();
		expect(resp.body).toMatchObject({
			email: 'test1@brunel.ac.uk',
			username: 'TestUser1',
			university: 'Brunel University Uxbridge'
		});
	});
});

describe('User password flows', () => {
	test('User performs password change', async () => {
		let requestBody: any = {
			oldPassword: 'password',
			password: 'password2'
		};

		let resp = await apiAuth.post('/password/change').set('Cookie', cookies).send(requestBody);
		expect(resp.statusCode).toBe(201);

		requestBody = {
			email: 'test1@brunel.ac.uk',
			password: 'password2'
		};

		resp = await apiAuth.post('/signin').send(requestBody);
		expect(resp.statusCode).toBe(201);
	});

	test('User resets forgotten password', async () => {
		let resp = await apiAuth.post('/password/reset').send({ email: 'test1@brunel.ac.uk' });
		expect(resp.statusCode).toBe(201);

		const mail = await mailhog.latestTo('test1@brunel.ac.uk');
		expect(mail).toBeTruthy();
		expect(mail?.subject).toBe('Reset your password');

		const rawHtml = he.decode(mail?.html ?? '');
		const token = /(?<=\/users\/reset-password\?token=)\w{128}/.exec(rawHtml)?.at(0);
		expect(token).toBeTruthy();

		resp = await apiAuth.post('/password/reset/token').send({
			password: 'MyNewPassword10!',
			token
		});
		expect(resp.statusCode).toBe(201);

		const [loginResp] = await createNewSession({ email: 'test1@brunel.ac.uk', password: 'MyNewPassword10!' });
		expect(loginResp.statusCode).toBe(201);
	});
});
