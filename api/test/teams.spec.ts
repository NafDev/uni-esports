import type { TeamDto } from '@uni-esports/interfaces';
import supertest from 'supertest';
import { createNewSession, createNewVerifiedUser } from './common';

const apiTeams = supertest('http://localhost:3000/teams');

describe('Team creation', () => {
	test('Create new team', async () => {
		await createNewVerifiedUser({
			email: 'captain-test-1@brunel.ac.uk',
			password: 'Password10',
			username: 'captain-test-1'
		});

		const [, authCookies] = await createNewSession({ email: 'captain-test-1@brunel.ac.uk', password: 'Password10' });

		const requestBody = { teamName: 'test-team-1' };

		let resp = await apiTeams.post('/create').set('Cookie', authCookies).send(requestBody);

		expect(resp.statusCode).toBe(201);
		expect(resp.body).toEqual(
			expect.objectContaining<TeamDto>({
				id: expect.any(Number),
				members: expect.any(Array),
				name: expect.stringMatching('test-team-1'),
				university: expect.stringMatching('Brunel University Uxbridge')
			})
		);

		const newTeamResp: TeamDto = resp.body;

		resp = await apiTeams.get(`/${newTeamResp.id}`).set('Cookie', authCookies).send();

		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual(
			expect.objectContaining<TeamDto>({
				id: expect.any(Number),
				members: expect.any(Array),
				name: expect.stringMatching('test-team-1'),
				university: expect.stringMatching('Brunel University Uxbridge')
			})
		);
	});
});
