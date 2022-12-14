import supertest from 'supertest';

const api = supertest('http://localhost:3000');

test('Fetch university list', async () => {
	const resp = await api.get('/universities/list');
	expect(resp.statusCode).toBe(200);

	expect(resp.body.length).toBe(171);
});
