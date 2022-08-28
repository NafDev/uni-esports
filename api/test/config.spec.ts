import supertest from 'supertest';

const app = supertest('http://localhost:3000/');

test('API Health Check', async () => {
	const resp = await app.get('ping');
	expect(resp.statusCode).toBe(200);
});
